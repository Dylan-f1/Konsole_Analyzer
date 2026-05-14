import { NextResponse } from "next/server";
import { normalizeUrl } from "@/lib/normalizeUrl";
import { scrapeUrl } from "@/lib/scraper";
import { detectTechStack, buildGtmSignals } from "@/lib/techDetector";
import { analyzeWithLLM } from "@/lib/llmAnalyzer";
import { computeScore } from "@/lib/scorer";
import { buildRecommendations } from "@/lib/recommendations";
import { connectDB } from "@/lib/mongoose";
import Analysis from "@/lib/models/Analysis";

const CACHE_TTL_HOURS = 24;

export async function POST(req) {
  let rawUrl, icp;
  try {
    const body = await req.json();
    rawUrl = body.url;
    icp = body.icp ?? {};
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

  // Cache DB — on cherche une analyse récente (< 24h) pour cette URL + cet ICP
  const since = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000);
  const cached = await Analysis.findOne({
    url,
    icp: icp,
    createdAt: { $gte: since },
  }).sort({ createdAt: -1 }).lean();

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

  const scrapedGtmSignals = [
    scraped.hasPricing && "Page pricing publique → process de vente transparent",
    scraped.hasCta && "CTA demo/trial détecté → cycle de vente self-serve",
    scraped.linkedIn && "Profil LinkedIn trouvé → enrichissement commercial possible",
    ...scraped.fundingSignals,
    ...scraped.behavioralSignals.map((s) => s.label),
  ].filter(Boolean);

  const gtmSignals = buildGtmSignals(scraped.html, scrapedGtmSignals);

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

  const companySize = llmData.companySize ?? scraped.companySize;

  const { score, label, status, breakdown } = computeScore({
    techStack,
    sector: llmData.sector,
    hasPricing: scraped.hasPricing,
    hasCta: scraped.hasCta,
    lang: scraped.lang,
    companySize,
  }, icp);

  const analysisData = {
    url,
    companyName: llmData.companyName,
    description: llmData.description,
    sector: llmData.sector,
    companySize,
    techStack,
    gtmSignals,
    score,
    scoreLabel: label,
    status,
    scoreBreakdown: breakdown,
    favicon: scraped.favicon,
    linkedIn: scraped.linkedIn,
    icp,
  };

  analysisData.recommendations = buildRecommendations(analysisData);

  // Persistance en base
  const saved = await Analysis.create(analysisData);

  return NextResponse.json({
    ...analysisData,
    _id: saved._id.toString(),
    createdAt: saved.createdAt,
    fromCache: false,
  });
}
