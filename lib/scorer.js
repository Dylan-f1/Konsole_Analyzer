const SAAS_TOOLS = ["Segment", "Intercom", "HubSpot", "Drift", "Mixpanel", "Amplitude", "Heap", "PostHog", "Clearbit", "Marketo", "Salesforce"];

const SIZE_RANGES = {
  startup:    ["Micro (1-10)", "Petite (11-50)"],
  scaleup:    ["Moyenne (51-200)", "Grande (201-1000)"],
  enterprise: ["Très grande (1000+)"],
};

// icp = { sector: "all"|"tech"|"fintech"|"ecommerce"|"health", size: "all"|"startup"|"scaleup"|"enterprise", market: "any"|"en"|"fr" }
export function computeScore({ techStack, sector, hasPricing, hasCta, lang, companySize }, icp = {}) {
  let score = 0;
  const breakdown = [];

  // --- Critère 1 : Stack SaaS (poids fixe — signal objectif fort) ---
  const hasSaasTool = techStack.some((t) => SAAS_TOOLS.includes(t));
  if (hasSaasTool) {
    score += 30;
    breakdown.push({ label: "Stack SaaS détectée", points: 30 });
  }

  // --- Critère 2 : Secteur (adaptatif selon ICP) ---
  const sectorPoints = icp.sector && icp.sector !== "all" ? 30 : 20;
  const sectorKeywords = {
    all:       /(tech|software|saas|cloud|b2b|developer|api|platform|fintech|health)/i,
    tech:      /(tech|software|saas|cloud|b2b|developer|api|platform)/i,
    fintech:   /(fintech|finance|banking|payment|insurance|trading)/i,
    ecommerce: /(e-commerce|ecommerce|retail|marketplace|shopify|boutique)/i,
    health:    /(health|santé|médical|pharma|biotech|clinique)/i,
  };
  const pattern = sectorKeywords[icp.sector] ?? sectorKeywords["all"];
  if (pattern.test(sector ?? "")) {
    score += sectorPoints;
    breakdown.push({ label: `Secteur correspondant à l'ICP`, points: sectorPoints });
  }

  // --- Critère 3 : Pricing ---
  if (hasPricing) {
    score += 20;
    breakdown.push({ label: "Page pricing présente", points: 20 });
  }

  // --- Critère 4 : CTA demo / trial ---
  if (hasCta) {
    score += 15;
    breakdown.push({ label: "CTA demo ou trial détecté", points: 15 });
  }

  // --- Critère 5 : Marché (adaptatif selon ICP) ---
  if (icp.market === "fr") {
    const isFrench = lang && lang.startsWith("fr");
    if (isFrench) {
      score += 15;
      breakdown.push({ label: "Contenu en français (marché cible)", points: 15 });
    }
  } else {
    const isEnglish = lang && lang.startsWith("en");
    if (isEnglish) {
      score += 15;
      breakdown.push({ label: "Contenu en anglais", points: 15 });
    }
  }

  // --- Critère 6 : Taille (bonus si ICP taille défini) ---
  if (icp.size && icp.size !== "all" && companySize) {
    const matches = SIZE_RANGES[icp.size]?.some((s) => companySize.includes(s.split(" ")[0]));
    if (matches) {
      score += 10;
      breakdown.push({ label: `Taille correspondant à l'ICP (${icp.size})`, points: 10 });
    }
  }

  score = Math.min(score, 100);

  let label, status;
  if (score >= 85)      { label = "Cible idéale";    status = "ideal"; }
  else if (score >= 65) { label = "Fort potentiel";  status = "strong"; }
  else if (score >= 45) { label = "À surveiller";    status = "watch"; }
  else if (score >= 25) { label = "Trop tôt";        status = "early"; }
  else                  { label = "Hors cible";      status = "out"; }

  return { score, label, status, breakdown };
}
