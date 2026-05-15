// Each entry: detected tech + GTM signal (business context for the commercial)
const PATTERNS = [
  // Analytics & Product
  {
    name: "Segment",
    pattern: /segment\.com\/analytics|analytics\.js/i,
    gtm: "Segment — stack data mature, équipe growth structurée",
  },
  {
    name: "Google Analytics",
    pattern: /google-analytics\.com|gtag\/js|UA-\d{4,}/i,
    gtm: null,
  },
  {
    name: "Mixpanel",
    pattern: /mixpanel\.com\/lib/i,
    gtm: "Mixpanel — suivi produit avancé, culture data-driven",
  },
  {
    name: "Amplitude",
    pattern: /cdn\.amplitude\.com/i,
    gtm: "Amplitude — analytics produit, équipe PM active",
  },
  {
    name: "Heap",
    pattern: /heapanalytics\.com/i,
    gtm: "Heap — capture comportementale automatique, orientation growth",
  },
  {
    name: "Hotjar",
    pattern: /static\.hotjar\.com/i,
    gtm: "Hotjar — analyse UX, équipe produit attentive à l'expérience utilisateur",
  },
  {
    name: "PostHog",
    pattern: /posthog\.com/i,
    gtm: "PostHog — stack open-source, équipe tech-first",
  },

  // CRM & Support
  {
    name: "Intercom",
    pattern: /intercom\.io|intercomcdn/i,
    gtm: "Intercom — chat live actif, équipe commerciale réactive à l'inbound",
  },
  {
    name: "HubSpot",
    pattern: /js\.hs-scripts\.com|hubspot\.com/i,
    gtm: "HubSpot — CRM en place, process inbound marketing structuré",
  },
  {
    name: "Drift",
    pattern: /js\.driftt\.com/i,
    gtm: "Drift — marketing conversationnel, pipeline piloté par le chat",
  },
  {
    name: "Zendesk",
    pattern: /static\.zdassets\.com/i,
    gtm: "Zendesk — support client organisé, volume de tickets significatif",
  },
  {
    name: "Salesforce",
    pattern: /salesforce\.com|pardot/i,
    gtm: "Salesforce — vente enterprise, cycle de vente long probable",
  },
  {
    name: "Freshdesk",
    pattern: /freshdesk\.com|freshchat/i,
    gtm: "Freshdesk — support client structuré",
  },
  {
    name: "Crisp",
    pattern: /crisp\.chat/i,
    gtm: "Crisp — chat live, probablement une startup early-stage",
  },

  // Payment & Billing
  {
    name: "Stripe",
    pattern: /js\.stripe\.com/i,
    gtm: "Stripe — infrastructure billing en place, monétisation active",
  },
  {
    name: "Paddle",
    pattern: /cdn\.paddle\.com/i,
    gtm: "Paddle — SaaS avec billing international",
  },
  {
    name: "Chargebee",
    pattern: /chargebee\.com/i,
    gtm: "Chargebee — gestion d'abonnements complexe, revenus récurrents établis",
  },

  // Frontend frameworks — informational only
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
    gtm: "Shopify — e-commerce, revenus transactionnels",
  },
  {
    name: "WordPress",
    pattern: /wp-content|wp-includes/i,
    gtm: null,
  },
  {
    name: "Webflow",
    pattern: /webflow\.com/i,
    gtm: "Webflow — site marketing soigné, équipe growth active",
  },

  // Marketing automation
  {
    name: "Marketo",
    pattern: /marketo\.net|munchkin/i,
    gtm: "Marketo — marketing automation enterprise, budget marketing élevé",
  },
  {
    name: "Clearbit",
    pattern: /clearbit\.com/i,
    gtm: "Clearbit — enrichissement de données prospects, équipe RevOps active",
  },
  {
    name: "Customer.io",
    pattern: /customer\.io|customeriotracking/i,
    gtm: "Customer.io — lifecycle marketing automatisé",
  },
  {
    name: "Apollo",
    pattern: /apollo\.io/i,
    gtm: "Apollo — prospection outbound active",
  },
];

export function detectTechStack(html) {
  return PATTERNS
    .filter(({ pattern }) => pattern.test(html))
    .map(({ name }) => name);
}

// Returns { label, url } objects for each detected signal
export function buildGtmSignals(html, scrapedSignals = []) {
  const fromTech = PATTERNS
    .filter(({ pattern, gtm }) => gtm && pattern.test(html))
    .map(({ gtm }) => ({ label: gtm, url: null }));

  return [...fromTech, ...scrapedSignals];
}
