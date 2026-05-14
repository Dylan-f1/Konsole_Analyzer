const TIMEOUT_MS = 10_000;

function extractMeta(html, name) {
  const match =
    html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i")) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"));
  return match ? match[1].trim() : null;
}

function extractOg(html, property) {
  const match =
    html.match(new RegExp(`<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`, "i")) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${property}["']`, "i"));
  return match ? match[1].trim() : null;
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
}

function detectLanguage(html) {
  const match = html.match(/<html[^>]+lang=["']([^"']+)["']/i);
  return match ? match[1].toLowerCase() : null;
}

function hasPricingPage(html) {
  return /href=["'][^"']*\/pricing["']/i.test(html);
}

function hasCtaDemoOrTrial(html) {
  return /(free trial|start free|get started|book a demo|request a demo|try for free)/i.test(html);
}

function extractLinkedIn(html) {
  const match = html.match(/https?:\/\/(www\.)?linkedin\.com\/company\/([a-zA-Z0-9_-]+)/i);
  return match ? match[0] : null;
}

function extractFavicon(html, baseUrl) {
  // Priorité : apple-touch-icon > icon > shortcut icon
  const patterns = [
    /<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']apple-touch-icon["']/i,
    /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*icon[^"']*["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const href = match[1];
      if (href.startsWith("http")) return href;
      if (href.startsWith("//")) return "https:" + href;
      const origin = new URL(baseUrl).origin;
      return origin + (href.startsWith("/") ? href : "/" + href);
    }
  }

  // Fallback universel : /favicon.ico est quasi toujours présent
  return new URL(baseUrl).origin + "/favicon.ico";
}

function detectFundingSignals(html) {
  const signals = [];
  if (/(series [a-e]|seed round|raised \$|funding round)/i.test(html)) {
    const match = html.match(/series ([a-e])/i);
    signals.push(match ? `Levée de fonds détectée (Series ${match[1].toUpperCase()})` : "Levée de fonds détectée");
  }
  if (/(Y Combinator|YC \d{2}|backed by)/i.test(html)) signals.push("Soutenu par un accélérateur (YC ou autre)");
  return signals;
}

function detectBehavioralSignals(html) {
  const signals = [];

  // Content marketing
  if (/href=["'][^"']*\/blog["']/i.test(html))
    signals.push({ key: "blog", label: "Blog actif → stratégie content marketing en place" });

  // Developer focus
  if (/href=["'][^"']*\/(docs|documentation|api|developers?)["']/i.test(html))
    signals.push({ key: "docs", label: "Documentation/API publique → produit orienté développeurs" });

  // Social proof & pipeline mature
  if (/href=["'][^"']*\/(customers?|case-studies|success-stories|references?)["']/i.test(html))
    signals.push({ key: "customers", label: "Page clients/cas d'usage → pipeline commercial mature" });

  // Integrations & ecosystem
  if (/href=["'][^"']*\/(integrations?|marketplace|apps?|partners?)["']/i.test(html))
    signals.push({ key: "integrations", label: "Page intégrations → stratégie écosystème développée" });

  // Social presence
  if (/twitter\.com|x\.com\/[a-zA-Z]/i.test(html))
    signals.push({ key: "twitter", label: "Présence Twitter/X → communication publique active" });
  if (/youtube\.com\/(channel|c\/|@)/i.test(html))
    signals.push({ key: "youtube", label: "Chaîne YouTube → investissement en contenu vidéo" });

  // Sales motion
  if (/href=["'][^"']*\/(contact|talk-to-sales|sales|get-a-quote)["']/i.test(html))
    signals.push({ key: "contact-sales", label: "Page 'Contacter les ventes' → cycle de vente assisté" });

  // Community
  if (/(slack|discord|community)/i.test(html))
    signals.push({ key: "community", label: "Communauté détectée (Slack/Discord) → stratégie PLG" });

  // GDPR / EU market
  if (/(cookie consent|gdpr|rgpd)/i.test(html))
    signals.push({ key: "gdpr", label: "Conformité GDPR → marché européen ciblé" });

  return signals;
}

function estimateCompanySize(html) {
  // Cherche un nombre d'employés explicite en premier
  const countMatch = html.match(/(\d[\d,]+)\s*\+?\s*(employees|team members|people|collaborateurs)/i);
  if (countMatch) {
    const n = parseInt(countMatch[1].replace(/,/g, ""), 10);
    if (n >= 1000) return "Très grande (1000+)";
    if (n >= 201)  return "Grande (201-1000)";
    if (n >= 51)   return "Moyenne (51-200)";
    if (n >= 11)   return "Petite (11-50)";
    return "Micro (1-10)";
  }

  // Signaux qualitatifs en fallback
  if (/(fortune 500|global offices|offices in \d+)/i.test(html)) return "Très grande (1000+)";
  if (/(enterprise|hundreds of|thousands of customers)/i.test(html)) return "Grande (201-1000)";
  if (/(growing team|series [b-e]|scale.?up)/i.test(html)) return "Moyenne (51-200)";
  if (/(small team|seed|bootstrapped|just us|tiny team)/i.test(html)) return "Micro (1-10)";
  return null;
}

export async function scrapeUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let html;
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KonsoleAnalyzer/1.0)",
        "Accept": "text/html,application/xhtml+xml,*/*",
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (err) {
    if (err.name === "AbortError") throw new Error("TIMEOUT");
    throw err;
  } finally {
    clearTimeout(timer);
  }

  return {
    html,
    title: extractTitle(html),
    description: extractMeta(html, "description") || extractOg(html, "description"),
    ogTitle: extractOg(html, "title"),
    ogSiteName: extractOg(html, "site_name"),
    lang: detectLanguage(html),
    hasPricing: hasPricingPage(html),
    hasCta: hasCtaDemoOrTrial(html),
    favicon: extractFavicon(html, url),
    linkedIn: extractLinkedIn(html),
    fundingSignals: detectFundingSignals(html),
    companySize: estimateCompanySize(html),
    behavioralSignals: detectBehavioralSignals(html),
  };
}
