const SAAS_TOOLS = ["Segment", "Intercom", "HubSpot", "Drift", "Mixpanel", "Amplitude", "Heap", "PostHog", "Clearbit", "Marketo", "Salesforce"];

export function computeScore({ techStack, sector, hasPricing, hasCta, lang }) {
  let score = 0;
  const breakdown = [];

  const hasSaasTool = techStack.some((t) => SAAS_TOOLS.includes(t));
  if (hasSaasTool) {
    score += 30;
    breakdown.push({ label: "Stack SaaS détectée", points: 30 });
  }

  const isTechSector = /(tech|software|saas|cloud|b2b|developer|api|platform)/i.test(sector ?? "");
  if (isTechSector) {
    score += 20;
    breakdown.push({ label: "Secteur tech/software", points: 20 });
  }

  if (hasPricing) {
    score += 20;
    breakdown.push({ label: "Page pricing présente", points: 20 });
  }

  if (hasCta) {
    score += 15;
    breakdown.push({ label: "CTA demo ou trial détecté", points: 15 });
  }

  const isEnglish = lang && lang.startsWith("en");
  if (isEnglish) {
    score += 15;
    breakdown.push({ label: "Contenu en anglais", points: 15 });
  }

  let label;
  if (score >= 75) label = "Fort fit";
  else if (score >= 45) label = "Fit moyen";
  else label = "Faible fit";

  return { score, label, breakdown };
}
