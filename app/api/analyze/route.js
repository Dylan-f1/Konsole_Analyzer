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

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let rawUrl;
  try {
    const body = await req.json();
    rawUrl = body.url;
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  let url;
  try {
    url = normalizeUrl(rawUrl);
  } catch {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  await connectDB();

  // 24h cache — avoid re-scraping a recently analyzed URL
  const since = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000);
  const cached = await Analysis.findOne({ url, createdAt: { $gte: since } })
    .sort({ createdAt: -1 })
    .populate("analyzedBy", "name")
    .lean();

  if (cached) {
    return NextResponse.json({ ...cached, _id: cached._id.toString(), fromCache: true });
  }

  // Scraping
  let scraped;
  try {
    scraped = await scrapeUrl(url);
  } catch (err) {
    if (err.message === "TIMEOUT") {
      return NextResponse.json({ error: "Le site met trop de temps à répondre (> 10s)" }, { status: 504 });
    }
    return NextResponse.json({ error: "Site introuvable ou inaccessible" }, { status: 502 });
  }

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
      companySize: null,
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
    analyzedBy:  session.user.id,
  };

  const saved = await Analysis.create(analysisData);

  return NextResponse.json({
    ...analysisData,
    _id:        saved._id.toString(),
    analyzedBy: { name: session.user.name },
    createdAt:  saved.createdAt,
    fromCache:  false,
  });
}
