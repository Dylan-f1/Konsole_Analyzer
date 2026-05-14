// Chaque entrée : tech détectée + signal GTM associé (ce que ça dit à un sales)
const PATTERNS = [
  // Analytics & Product
  {
    name: "Segment",
    pattern: /segment\.com\/analytics|analytics\.js/i,
    gtm: "Utilise Segment → stack data mature, équipe growth structurée",
  },
  {
    name: "Google Analytics",
    pattern: /google-analytics\.com|gtag\/js|UA-\d{4,}/i,
    gtm: null,
  },
  {
    name: "Mixpanel",
    pattern: /mixpanel\.com\/lib/i,
    gtm: "Mixpanel → suivi produit avancé, culture data-driven",
  },
  {
    name: "Amplitude",
    pattern: /cdn\.amplitude\.com/i,
    gtm: "Amplitude → analytics produit, probablement une équipe PM active",
  },
  {
    name: "Heap",
    pattern: /heapanalytics\.com/i,
    gtm: "Heap → capture comportementale automatique, orientation growth",
  },
  {
    name: "Hotjar",
    pattern: /static\.hotjar\.com/i,
    gtm: null,
  },
  {
    name: "PostHog",
    pattern: /posthog\.com/i,
    gtm: "PostHog → stack open-source, équipe tech-first",
  },

  // CRM & Support
  {
    name: "Intercom",
    pattern: /intercom\.io|intercomcdn/i,
    gtm: "Intercom → chat live actif, équipe sales/support réactive à l'inbound",
  },
  {
    name: "HubSpot",
    pattern: /js\.hs-scripts\.com|hubspot\.com/i,
    gtm: "HubSpot → CRM en place, process inbound marketing structuré",
  },
  {
    name: "Drift",
    pattern: /js\.driftt\.com/i,
    gtm: "Drift → conversational marketing, pipeline sales piloté par le chat",
  },
  {
    name: "Zendesk",
    pattern: /static\.zdassets\.com/i,
    gtm: "Zendesk → support client organisé, volume de tickets non négligeable",
  },
  {
    name: "Salesforce",
    pattern: /salesforce\.com|pardot/i,
    gtm: "Salesforce → sales enterprise, cycle de vente long probable",
  },
  {
    name: "Freshdesk",
    pattern: /freshdesk\.com|freshchat/i,
    gtm: null,
  },
  {
    name: "Crisp",
    pattern: /crisp\.chat/i,
    gtm: "Crisp → chat live, probablement startup early-stage",
  },

  // Paiement & Billing
  {
    name: "Stripe",
    pattern: /js\.stripe\.com/i,
    gtm: "Stripe → infrastructure billing en place, monétisation active",
  },
  {
    name: "Paddle",
    pattern: /cdn\.paddle\.com/i,
    gtm: "Paddle → SaaS avec billing géré, focus international",
  },
  {
    name: "Chargebee",
    pattern: /chargebee\.com/i,
    gtm: "Chargebee → gestion abonnements complexe, revenus récurrents établis",
  },

  // Frameworks frontend
  {
    name: "Next.js",
    pattern: /__NEXT_DATA__|_next\/static/i,
    gtm: null,
  },
  {
    name: "React",
    pattern: /react(\.min)?\.js/i,
    gtm: null,
  },
  {
    name: "Vue.js",
    pattern: /vue(\.min)?\.js|__vue_/i,
    gtm: null,
  },
  {
    name: "Angular",
    pattern: /angular(\.min)?\.js|ng-version/i,
    gtm: null,
  },
  {
    name: "Nuxt",
    pattern: /__nuxt|_nuxt\//i,
    gtm: null,
  },

  // E-commerce & CMS
  {
    name: "Shopify",
    pattern: /shopify\.com|cdn\.shopify/i,
    gtm: "Shopify → e-commerce, revenus transactionnels",
  },
  {
    name: "WordPress",
    pattern: /wp-content|wp-includes/i,
    gtm: null,
  },
  {
    name: "Webflow",
    pattern: /webflow\.com/i,
    gtm: "Webflow → site marketing soigné, signe d'une équipe growth",
  },

  // Marketing automation
  {
    name: "Marketo",
    pattern: /marketo\.net|munchkin/i,
    gtm: "Marketo → marketing automation enterprise, budget marketing élevé",
  },
  {
    name: "Clearbit",
    pattern: /clearbit\.com/i,
    gtm: "Clearbit → enrichissement de données prospects, équipe RevOps active",
  },
  {
    name: "Customer.io",
    pattern: /customer\.io|customeriotracking/i,
    gtm: "Customer.io → lifecycle marketing automatisé",
  },
  {
    name: "Apollo",
    pattern: /apollo\.io/i,
    gtm: "Apollo → prospection outbound active",
  },
];

export function detectTechStack(html) {
  return PATTERNS
    .filter(({ pattern }) => pattern.test(html))
    .map(({ name }) => name);
}

export function buildGtmSignals(html, scrapedSignals = []) {
  const fromTech = PATTERNS
    .filter(({ pattern, gtm }) => gtm && pattern.test(html))
    .map(({ gtm }) => gtm);

  return [...fromTech, ...scrapedSignals];
}
