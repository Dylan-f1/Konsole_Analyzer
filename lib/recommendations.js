// Génère des recommandations sales actionnables à partir du résultat d'analyse

const SIGNAL_ACTIONS = [
  {
    match: (r) => r.techStack?.includes("Intercom"),
    action: "Chat live Intercom détecté — contactez-les via leur widget pour un premier contact informel avant l'email.",
  },
  {
    match: (r) => r.techStack?.includes("HubSpot"),
    action: "CRM HubSpot en place — mentionnez votre intégration native HubSpot dès le premier message.",
  },
  {
    match: (r) => r.techStack?.includes("Salesforce"),
    action: "Salesforce détecté — cycle de vente probablement long, adressez-vous au RevOps ou Sales Ops en priorité.",
  },
  {
    match: (r) => r.techStack?.includes("Segment"),
    action: "Segment détecté — équipe data mature. Valorisez les capacités d'analytics et de tracking de Konsole.",
  },
  {
    match: (r) => r.techStack?.includes("Stripe") || r.techStack?.includes("Chargebee"),
    action: "Infrastructure billing en place — client habitué à payer pour des outils SaaS. Aversion au risque faible.",
  },
  {
    match: (r) => r.gtmSignals?.some((s) => s.includes("LinkedIn")),
    action: "Profil LinkedIn trouvé — identifiez le Head of Sales ou RevOps et connectez-vous avant d'envoyer un message.",
  },
  {
    match: (r) => r.gtmSignals?.some((s) => s.includes("funding") || s.includes("Levée")),
    action: "Levée de fonds détectée — budget disponible et pression de croissance. Moment idéal pour prospecter.",
  },
  {
    match: (r) => r.gtmSignals?.some((s) => s.includes("blog") || s.includes("Blog")),
    action: "Blog actif — engagez avec leur contenu (commentaire, partage) avant de contacter. Crée un contexte naturel.",
  },
  {
    match: (r) => r.gtmSignals?.some((s) => s.includes("cas d'usage") || s.includes("clients")),
    action: "Page clients/cas d'usage présente — ils valorisent la preuve sociale. Préparez des case studies similaires.",
  },
  {
    match: (r) => r.gtmSignals?.some((s) => s.includes("PLG") || s.includes("Communauté")),
    action: "Stratégie PLG détectée — approche product-led, commencez par un email court avec un lien d'essai gratuit.",
  },
];

const SCORE_STRATEGY = {
  "Fort fit": {
    priority: "🔴 Priorité haute",
    timing: "À contacter cette semaine",
    approach: "Approche directe recommandée : proposez une démo courte (20 min) centrée sur leurs signaux GTM spécifiques.",
  },
  "Fit moyen": {
    priority: "🟡 Priorité moyenne",
    timing: "À qualifier avant d'investir du temps",
    approach: "Envoyez un email de qualification court. Vérifiez le budget et le timing avant de proposer une démo.",
  },
  "Faible fit": {
    priority: "⚪ Priorité basse",
    timing: "À déprioritiser",
    approach: "Hors cible ICP actuel. Si vous avancez quand même : misez sur un angle éducatif plutôt que commercial.",
  },
};

export function buildRecommendations(result) {
  const strategy = SCORE_STRATEGY[result.scoreLabel] ?? SCORE_STRATEGY["Faible fit"];
  const signalActions = SIGNAL_ACTIONS
    .filter(({ match }) => match(result))
    .map(({ action }) => action);

  return { strategy, signalActions };
}
