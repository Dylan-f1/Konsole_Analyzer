import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { normalizeUrl } from "@/lib/normalizeUrl";
import { scrapeUrl } from "@/lib/scraper";
import { detectTechStack, buildGtmSignals } from "@/lib/techDetector";
import { analyzeWithLLM } from "@/lib/llmAnalyzer";
import { connectDB } from "@/lib/mongoose";
import Analysis from "@/lib/models/Analysis";

const CACHE_TTL_HOURS = 24;
const CONCURRENCY = 3; // max parallel analyses to avoid rate limiting

// Process URLs in chunks of CONCURRENCY
async function processInChunks(items, handler) {
  const results = [];
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const chunk = items.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(chunk.map(handler));
    results.push(...settled);
  }
  return results;
}

async function analyzeOne(url, userId, userName) {
  const since = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000);
  const cached = await Analysis.findOne({ url, createdAt: { $gte: since } })
    .sort({ createdAt: -1 })
    .lean();

  if (cached) {
    return { ...cached, _id: cached._id.toString(), fromCache: true };
  }

  const scraped = await scrapeUrl(url);
  const techStack = detectTechStack(scraped.html);

  const scrapedSignals = [
    scraped.hasPricing && "Page pricing publique",
    scraped.hasCta     && "CTA demo ou trial détecté",
    scraped.linkedIn   && "Profil LinkedIn trouvé",
    ...scraped.fundingSignals,
    ...scraped.behavioralSignals.map((s) => s.label),
  ].filter(Boolean);

  const gtmSignals = buildGtmSignals(scraped.html, scrapedSignals);

  let llmData;
  try {
    llmData = await analyzeWithLLM({
      title: scraped.title,
      description: scraped.description,
      ogSiteName: scraped.ogSiteName,
      techStack,
      url,
    });
  } catch {
    llmData = {
      companyName: scraped.ogSiteName ?? scraped.title ?? url,
      description: scraped.description ?? "Aucune description disponible",
      sector: "Inconnu",
    };
  }

  const analysisData = {
    url,
    companyName: llmData.companyName,
    description: llmData.description,
    sector:      llmData.sector,
    companySize: llmData.companySize ?? scraped.companySize,
    techStack,
    gtmSignals,
    favicon:     scraped.favicon,
    linkedIn:    scraped.linkedIn,
    analyzedBy:  userId,
  };

  const saved = await Analysis.create(analysisData);
  return { ...analysisData, _id: saved._id.toString(), analyzedBy: { name: userName }, fromCache: false };
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let urls;
  try {
    const body = await req.json();
    urls = body.urls;
    if (!Array.isArray(urls) || urls.length === 0) throw new Error();
  } catch {
    return NextResponse.json({ error: "Fournissez un tableau d'URLs non vide" }, { status: 400 });
  }

  if (urls.length > 20) {
    return NextResponse.json({ error: "Maximum 20 URLs par batch" }, { status: 400 });
  }

  // Normalize and deduplicate
  const normalized = [];
  const errors = [];

  for (const raw of urls) {
    try {
      normalized.push(normalizeUrl(String(raw).trim()));
    } catch {
      errors.push({ url: raw, error: "URL invalide" });
    }
  }

  const unique = [...new Set(normalized)];

  await connectDB();

  const settled = await processInChunks(unique, (url) =>
    analyzeOne(url, session.user.id, session.user.name)
  );

  const results = settled.map((s, i) => {
    if (s.status === "fulfilled") return { url: unique[i], success: true, data: s.value };
    const msg = s.reason?.message ?? "Erreur inconnue";
    return { url: unique[i], success: false, error: msg.includes("TIMEOUT") ? "Site trop lent (> 10s)" : "Site inaccessible" };
  });

  return NextResponse.json({ results: [...results, ...errors.map((e) => ({ url: e.url, success: false, error: e.error }))] });
}
