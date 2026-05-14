import { NextResponse } from "next/server";
import { normalizeUrl } from "@/lib/normalizeUrl";
import { scrapeUrl } from "@/lib/scraper";
import { detectTechStack, buildGtmSignals } from "@/lib/techDetector";
import { analyzeWithLLM } from "@/lib/llmAnalyzer";
import { getCache, setCache } from "@/lib/cache";

export async function POST(req) {
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

  const cached = getCache(url);
  if (cached) return NextResponse.json({ ...cached, fromCache: true });

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
    scraped.hasCta && "CTA demo ou trial détecté",
    scraped.linkedIn && "Profil LinkedIn trouvé",
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

  const result = {
    url,
    companyName: llmData.companyName,
    description: llmData.description,
    sector: llmData.sector,
    techStack,
    gtmSignals,
    favicon: scraped.favicon,
    linkedIn: scraped.linkedIn,
    companySize: llmData.companySize ?? scraped.companySize,
    fromCache: false,
  };

  setCache(url, result);
  return NextResponse.json(result);
}
