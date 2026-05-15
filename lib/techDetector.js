// Each entry: detected tech + GTM signal + concrete action for the commercial
const PATTERNS = [
  // Analytics & Product
  {
    name: "Segment",
    pattern: /segment\.com\/analytics|analytics\.js/i,
    gtm: "Segment détecté — stack data mature, équipe growth structurée",
    action: "Ils ont investi dans une stack data sérieuse. Angle : montre comment Konsole se branche sur Segment pour enrichir les événements. Cherche un Data Engineer ou Head of Growth sur LinkedIn.",
  },
  {
    name: "Google Analytics",
    pattern: /google-analytics\.com|gtag\/js|UA-\d{4,}/i,
    gtm: null,
    action: null,
  },
  {
    name: "Mixpanel",
    pattern: /mixpanel\.com\/lib/i,
    gtm: "Mixpanel détecté — suivi produit avancé, culture data-driven",
    action: "Equipe orientée métriques. Parle-leur en termes de rétention et d'activation, pas de features. Interlocuteur idéal : Product Manager ou Head of Growth.",
  },
  {
    name: "Amplitude",
    pattern: /cdn\.amplitude\.com/i,
    gtm: "Amplitude détecté — analytics produit, équipe PM active",
    action: "Ils mesurent tout. Prépare des chiffres concrets sur le temps gagné par commercial avant d'écrire. Cherche un Product Manager ou Chief of Staff.",
  },
  {
    name: "Heap",
    pattern: /heapanalytics\.com/i,
    gtm: "Heap détecté — capture comportementale automatique, orientation growth",
    action: "Capture comportementale automatique → ils veulent comprendre chaque action utilisateur. Angle : 'Konsole fait pareil côté prospect — vous voyez ce qu'ils utilisent avant même de leur parler'.",
  },
  {
    name: "Hotjar",
    pattern: /static\.hotjar\.com/i,
    gtm: "Hotjar détecté — analyse UX, équipe produit attentive à l'expérience",
    action: "Equipe UX active. Cherche un Product Designer ou Head of Product comme allié interne avant d'aller voir le commercial.",
  },
  {
    name: "PostHog",
    pattern: /posthog\.com/i,
    gtm: "PostHog détecté — stack open-source, équipe tech-first",
    action: "Stack open-source → culture ingénierie forte. Approche technique dans ton email. Cherche un Engineering Manager ou CTO directement.",
  },

  // CRM & Support
  {
    name: "Intercom",
    pattern: /intercom\.io|intercomcdn/i,
    gtm: "Intercom détecté — chat live actif, équipe commerciale réactive à l'inbound",
    action: "Chat live actif. Contacte en semaine entre 9h et 12h, ils répondent vite. Mentionne que Konsole peut qualifier automatiquement les leads qui arrivent via leur chat.",
  },
  {
    name: "HubSpot",
    pattern: /js\.hs-scripts\.com|hubspot\.com/i,
    gtm: "HubSpot détecté — CRM en place, process inbound marketing structuré",
    action: "CRM en place. Angle intégration, pas remplacement. Cherche l'Ops Manager ou RevOps sur LinkedIn. Dans ton message : mentionne la compatibilité HubSpot native de Konsole.",
  },
  {
    name: "Drift",
    pattern: /js\.driftt\.com/i,
    gtm: "Drift détecté — marketing conversationnel, pipeline piloté par le chat",
    action: "Pipeline piloté par le chat. Angle : montre comment Konsole enrichit les conversations Drift avec les données prospect avant même qu'ils répondent.",
  },
  {
    name: "Zendesk",
    pattern: /static\.zdassets\.com/i,
    gtm: "Zendesk détecté — support client organisé, volume de tickets significatif",
    action: "Volume de support non négligeable. Cherche un Customer Success Manager ou Head of Support comme point d'entrée — ils ont souvent l'oreille du CEO sur les outils.",
  },
  {
    name: "Salesforce",
    pattern: /salesforce\.com|pardot/i,
    gtm: "Salesforce détecté — vente enterprise, cycle de vente long probable",
    action: "Cycle de vente long et décision multi-parties. Prévois 3-4 points de contact avant une démo. Cherche le RevOps ou Sales Ops — c'est eux qui valident les outils.",
  },
  {
    name: "Freshdesk",
    pattern: /freshdesk\.com|freshchat/i,
    gtm: "Freshdesk détecté — support client structuré",
    action: "Support structuré mais pas enterprise. Interlocuteur direct : Head of Support ou Operations Manager. Message court, proposition concrète.",
  },
  {
    name: "Crisp",
    pattern: /crisp\.chat/i,
    gtm: "Crisp détecté — chat live, probablement une startup early-stage",
    action: "Startup early-stage. Décision maker = CEO ou CTO directement. Email de 3 lignes maximum, pas de deck. Propose un appel de 15 minutes.",
  },

  // Payment & Billing
  {
    name: "Stripe",
    pattern: /js\.stripe\.com/i,
    gtm: "Stripe détecté — infrastructure billing en place, monétisation active",
    action: "Ils monétisent et ils paient déjà des outils SaaS. Angle ROI direct : calcule combien de temps Konsole fait gagner par commercial par semaine et mets-le dans l'objet de l'email.",
  },
  {
    name: "Paddle",
    pattern: /cdn\.paddle\.com/i,
    gtm: "Paddle détecté — SaaS avec billing international",
    action: "Billing international → probablement une équipe distribuée. Adapte ton pitch à un contexte multi-pays. Cherche un Head of Revenue ou CFO.",
  },
  {
    name: "Chargebee",
    pattern: /chargebee\.com/i,
    gtm: "Chargebee détecté — gestion d'abonnements complexe, revenus récurrents établis",
    action: "Revenus récurrents établis → modèle SaaS mature. Interlocuteurs : CFO ou Head of Finance en plus du CEO. Angle : Konsole augmente la valeur à vie des clients en qualifiant mieux dès le départ.",
  },

  // Frontend frameworks — informational only, no action needed
  {
    name: "Next.js",
    pattern: /__NEXT_DATA__|_next\/static/i,
    gtm: null,
    action: null,
  },
  {
    name: "React",
    pattern: /react(\.min)?\.js/i,
    gtm: null,
    action: null,
  },
  {
    name: "Vue.js",
    pattern: /vue(\.min)?\.js|__vue_/i,
    gtm: null,
    action: null,
  },
  {
    name: "Angular",
    pattern: /angular(\.min)?\.js|ng-version/i,
    gtm: null,
    action: null,
  },
  {
    name: "Nuxt",
    pattern: /__nuxt|_nuxt\//i,
    gtm: null,
    action: null,
  },

  // E-commerce & CMS
  {
    name: "Shopify",
    pattern: /shopify\.com|cdn\.shopify/i,
    gtm: "Shopify détecté — e-commerce, revenus transactionnels",
    action: "E-commerce pur. Angle : comment Konsole aide à qualifier leurs partenaires ou revendeurs B2B, pas leurs clients finaux. Cherche un Head of Partnerships ou Business Development.",
  },
  {
    name: "WordPress",
    pattern: /wp-content|wp-includes/i,
    gtm: null,
    action: null,
  },
  {
    name: "Webflow",
    pattern: /webflow\.com/i,
    gtm: "Webflow détecté — site marketing soigné, équipe growth active",
    action: "Ils investissent dans leur image. Cherche un Head of Marketing ou Growth Designer. Personnalise ton approche avec un compliment sincère sur leur site — ils y tiennent.",
  },

  // Marketing automation
  {
    name: "Marketo",
    pattern: /marketo\.net|munchkin/i,
    gtm: "Marketo détecté — marketing automation enterprise, budget marketing élevé",
    action: "Budget marketing enterprise. Cherche le CMO ou Marketing Ops. Angle : Konsole complète leur stack d'automation avec de l'intelligence prospect que Marketo ne produit pas.",
  },
  {
    name: "Clearbit",
    pattern: /clearbit\.com/i,
    gtm: "Clearbit détecté — enrichissement de données, équipe RevOps active",
    action: "Ils enrichissent déjà leurs données. Positionne Konsole comme le complément scraping/comportemental que Clearbit ne fait pas — données en temps réel depuis le site, pas depuis une base statique.",
  },
  {
    name: "Customer.io",
    pattern: /customer\.io|customeriotracking/i,
    gtm: "Customer.io détecté — lifecycle marketing automatisé",
    action: "Lifecycle marketing mature. Cherche un Growth Engineer ou CRM Manager. Angle : Konsole alimente Customer.io avec des données de qualification dès le premier touchpoint.",
  },
  {
    name: "Apollo",
    pattern: /apollo\.io/i,
    gtm: "Apollo détecté — prospection outbound active",
    action: "Ils font de l'outbound comme toi tu leur fais. Angle miroir dans ton email : 'Vous utilisez Apollo pour trouver des prospects — Konsole rend chaque prospect trouvé 10x plus actionnable'.",
  },
];

export function detectTechStack(html) {
  return PATTERNS
    .filter(({ pattern }) => pattern.test(html))
    .map(({ name }) => name);
}

// Returns { label, action, url } objects for each detected signal
export function buildGtmSignals(html, scrapedSignals = []) {
  const fromTech = PATTERNS
    .filter(({ pattern, gtm }) => gtm && pattern.test(html))
    .map(({ gtm, action }) => ({ label: gtm, action: action ?? null, url: null }));

  return [...fromTech, ...scrapedSignals];
}
