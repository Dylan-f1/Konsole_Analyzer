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

  return new URL(baseUrl).origin + "/favicon.ico";
}

function detectFundingSignals(html) {
  const signals = [];
  if (/(series [a-e]|seed round|raised \$|funding round)/i.test(html)) {
    const match = html.match(/series ([a-e])/i);
    signals.push({
      label: match ? `Levée de fonds détectée (Series ${match[1].toUpperCase()})` : "Levée de fonds détectée",
      action: "Budget en croissance — moment idéal pour pitcher. Mentionne la levée dans ton premier message pour montrer que tu suis leur actualité.",
      url: null,
    });
  }
  if (/(Y Combinator|YC \d{2}|backed by)/i.test(html)) {
    signals.push({
      label: "Soutenu par un accélérateur (YC ou autre)",
      action: "Culture startup, décision rapide. Approche directe par email court. Le CEO lit ses emails — écris-lui directement.",
      url: null,
    });
  }
  return signals;
}

// Extract the first href matching a pattern, return null if not found
function extractHref(html, pattern) {
  const match = html.match(pattern);
  return match ? match[1] : null;
}

// Resolve a potentially relative href to an absolute URL
function resolveUrl(href, baseUrl) {
  if (!href) return null;
  if (href.startsWith("http")) return href;
  if (href.startsWith("//")) return "https:" + href;
  try {
    const origin = new URL(baseUrl).origin;
    return origin + (href.startsWith("/") ? href : "/" + href);
  } catch { return null; }
}

// Returns { label, action, url } objects — url is the actual source page when found
function detectBehavioralSignals(html, baseUrl = "") {
  const signals = [];

  // Content marketing — extract real blog URL
  const blogHref = extractHref(html, /href=["']([^"']*\/blog[^"']*)["']/i);
  if (blogHref) {
    signals.push({
      label: "Blog actif — stratégie content marketing en place",
      action: "Lis leurs 2-3 derniers articles avant d'écrire. Cite un point précis dans ton email — ça montre que tu t'es renseigné et ça double ton taux de réponse.",
      url: resolveUrl(blogHref, baseUrl),
    });
  }

  // Developer focus — extract real docs URL
  const docsHref = extractHref(html, /href=["']([^"']*\/(docs|documentation|api|developers?)[^"']*)["']/i);
  if (docsHref) {
    signals.push({
      label: "Documentation/API publique — produit orienté développeurs",
      action: "Produit tech-first. Cherche un Engineering Manager ou CTO comme point d'entrée. Approche technique dans ton message, pas commerciale.",
      url: resolveUrl(docsHref, baseUrl),
    });
  }

  // Social proof — extract real customers page URL
  const customersHref = extractHref(html, /href=["']([^"']*\/(customers?|case-studies|success-stories|references?)[^"']*)["']/i);
  if (customersHref) {
    signals.push({
      label: "Page clients/cas d'usage — pipeline commercial mature",
      action: "Lis leurs cas clients. Si tu as des références dans le même secteur, cite-les dans ton approche. La preuve sociale entre pairs est le levier le plus fort.",
      url: resolveUrl(customersHref, baseUrl),
    });
  }

  // Integrations — extract real integrations page URL
  const integrationsHref = extractHref(html, /href=["']([^"']*\/(integrations?|marketplace|apps?|partners?)[^"']*)["']/i);
  if (integrationsHref) {
    signals.push({
      label: "Page intégrations — stratégie écosystème développée",
      action: "Ils pensent en termes de connectivité. Angle : 'Konsole s'intègre à ce que vous avez déjà'. Vérifie quelles intégrations ils ont et mentionne celles que Konsole supporte.",
      url: resolveUrl(integrationsHref, baseUrl),
    });
  }

  // Twitter/X — extract actual profile URL from href attribute
  const twitterMatch = html.match(/href=["'](https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[a-zA-Z0-9_]{1,50})[^"'"]*/i);
  if (twitterMatch) {
    signals.push({
      label: "Présence Twitter/X — communication publique active",
      action: "Surveille leurs publications sur X. Les annonces de recrutement, de lancement produit ou de levée de fonds sont des signaux de timing parfaits pour prendre contact.",
      url: twitterMatch[1],
    });
  } else if (/twitter\.com|x\.com\/[a-zA-Z]/i.test(html)) {
    signals.push({
      label: "Présence Twitter/X — communication publique active",
      action: "Surveille leurs publications sur X. Les annonces de recrutement ou de lancement produit sont des signaux de timing parfaits pour prendre contact.",
      url: null,
    });
  }

  // YouTube — extract actual channel URL
  const youtubeMatch = html.match(/href=["'](https?:\/\/(?:www\.)?youtube\.com\/(?:channel\/|c\/|@)[^"']+)["']/i);
  if (youtubeMatch) {
    signals.push({
      label: "Chaîne YouTube — investissement en contenu vidéo",
      action: "Regarde leur dernière vidéo avant d'appeler. C'est un excellent point d'accroche dans un email et ça montre que tu t'intéresses vraiment à eux.",
      url: youtubeMatch[1],
    });
  } else if (/youtube\.com\/(channel|c\/|@)/i.test(html)) {
    signals.push({
      label: "Chaîne YouTube — investissement en contenu vidéo",
      action: "Regarde leur dernière vidéo avant d'appeler. C'est un excellent point d'accroche dans un email.",
      url: null,
    });
  }

  // Sales motion — extract real contact/sales page URL
  const contactHref = extractHref(html, /href=["']([^"']*\/(contact|talk-to-sales|sales|get-a-quote)[^"']*)["']/i);
  if (contactHref) {
    signals.push({
      label: "Page 'Contacter les ventes' — cycle de vente assisté",
      action: "Ils sont habitués aux démos commerciales. Propose directement un créneau de 20 minutes dans ton premier email — pas besoin de passer par une phase de découverte longue.",
      url: resolveUrl(contactHref, baseUrl),
    });
  }

  // Community — extract real Discord invite or Slack workspace URL
  const discordMatch = html.match(/href=["'](https?:\/\/discord\.(?:gg|com\/invite)\/[^"']+)["']/i);
  const slackMatch = html.match(/href=["'](https?:\/\/[a-zA-Z0-9-]+\.slack\.com\/[^"']*)["']/i);
  if (discordMatch || slackMatch) {
    const communityUrl = discordMatch ? discordMatch[1] : slackMatch[1];
    signals.push({
      label: "Communauté détectée (Slack/Discord) — stratégie product-led growth",
      action: "Rejoins leur communauté et observe 2-3 jours avant d'approcher. Tu identifieras les vrais problèmes dont parle leur base d'utilisateurs — et tu pourras les citer.",
      url: communityUrl,
    });
  } else if (/(slack|discord|community)/i.test(html)) {
    signals.push({
      label: "Communauté détectée (Slack/Discord) — stratégie product-led growth",
      action: "Ils ont une communauté active. Cherche à y rejoindre pour observer les conversations avant d'approcher commercialement.",
      url: null,
    });
  }

  // GDPR / EU market
  if (/(cookie consent|gdpr|rgpd)/i.test(html)) {
    signals.push({
      label: "Conformité GDPR — marché européen ciblé",
      action: "Marché européen. Adapte ton pitch avec les aspects conformité et souveraineté des données — c'est un argument fort en Europe que les outils américains ne peuvent pas tenir.",
      url: null,
    });
  }

  return signals;
}

function estimateCompanySize(html) {
  const countMatch = html.match(/(\d[\d,]+)\s*\+?\s*(employees|team members|people|collaborateurs)/i);
  if (countMatch) {
    const n = parseInt(countMatch[1].replace(/,/g, ""), 10);
    if (n >= 1000) return "Très grande (1000+)";
    if (n >= 201)  return "Grande (201-1000)";
    if (n >= 51)   return "Moyenne (51-200)";
    if (n >= 11)   return "Petite (11-50)";
    return "Micro (1-10)";
  }

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
    behavioralSignals: detectBehavioralSignals(html, url), // pass base URL for link resolution
  };
}
