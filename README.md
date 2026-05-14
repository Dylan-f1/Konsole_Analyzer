# Konsole Analyzer

> Module d'analyse de prospects pour équipes sales B2B — construit dans le cadre d'un exercice technique pour [Youno / Konsole](https://youno.ai).

**[Voir la démo en live →](https://konsole-analyzer.vercel.app)**

---

## Le problème métier

Un BDR ou un AE qui prospecte passe en moyenne **15 à 30 minutes par prospect** à faire de la recherche manuelle : site web, LinkedIn, Crunchbase, StackShare, réseaux sociaux. Pour qualifier 50 comptes par semaine, c'est jusqu'à **25 heures perdues en recherche à faible valeur ajoutée**.

Le vrai travail — la prise de contact, la personnalisation du message, la relance — ne commence qu'après. Et bien souvent, la qualification reste subjective : "ça ressemble à notre cible" ne s'appuie sur aucune donnée structurée.

**Konsole Analyzer résout ça.** Entrez une URL, obtenez en quelques secondes un profil complet de l'entreprise avec un score de fit objectif et des signaux GTM actionnables — le tout sans quitter votre navigateur.

---

## Ce que l'app retourne

- **Nom, description, secteur** — extrait et structuré par LLM à partir du contenu du site
- **Taille approximative** — estimée par le LLM (micro / petite / moyenne / grande) à partir des indices disponibles
- **Tech stack détectée** — 30+ technologies identifiées par pattern matching (Segment, Intercom, HubSpot, Stripe, Salesforce...)
- **Signaux GTM actionnables** — pas juste "Intercom détecté", mais "Chat live → équipe sales réactive à l'inbound"
- **Score de fit B2B SaaS sur 100** — logique explicite, défendable critère par critère
- **Lien LinkedIn** de l'entreprise si présent sur la page
- **Historique** des dernières analyses dans le navigateur

---

## Vision produit & intégration dans Konsole

Ce prototype est pensé comme un **module "Prospect Intelligence"** qui s'intégrerait naturellement dans Konsole.

### Cas d'usage concret pour une équipe sales

1. Un BDR reçoit une liste de 100 leads à traiter
2. Il colle chaque domaine dans Konsole Analyzer
3. En 30 secondes par compte, il obtient : score de fit, stack GTM, signaux commerciaux
4. Il **trie sa liste par score** et n'investit son temps que sur les comptes à 60+
5. Il utilise les signaux détectés pour **personnaliser son outreach** : "J'ai vu que vous utilisez HubSpot et Segment — ça me dit que vous avez déjà une culture data, voilà comment Konsole peut aller plus loin..."

### Ce que ça change pour le business

| Sans l'outil | Avec l'outil |
|---|---|
| 15-30 min de recherche manuelle par prospect | < 30 secondes |
| Qualification subjective ("ça ressemble à notre cible") | Score objectif sur 5 critères explicites |
| Messages génériques | Outreach personnalisé basé sur des signaux réels |
| Aucune priorisation des leads | Tri par score de fit → focus sur les comptes à fort potentiel |

### Pistes d'intégration dans le produit Konsole

- **Enrichissement automatique des comptes** : à chaque création de compte dans le CRM, déclencher une analyse en arrière-plan et peupler les champs "tech stack", "score fit", "signaux GTM"
- **Scoring configurable par ICP** : permettre à chaque équipe de définir son profil cible (secteur, taille, stack attendue) pour adapter le score à son marché
- **Trigger d'alertes** : notifier un AE quand un compte analysé franchit un seuil de score (ex: une startup détecte Salesforce → signal de croissance → outreach immédiat)
- **Export vers le CRM** : pousser les insights directement dans HubSpot ou Salesforce via API

---

## Architecture technique

```
app/
  page.js                 → UI principale (états : idle / loading / result / error + historique)
  api/analyze/
    route.js              → endpoint POST — orchestre toute la pipeline d'analyse
  layout.js               → layout global + metadata

components/
  URLInput.js             → champ de saisie + normalisation (stripe → https://stripe.com)
  CompanyCard.js          → nom, description, secteur, favicon, LinkedIn, taille
  TechStackBadges.js      → badges des technos détectées
  GTMSignals.js           → signaux commerciaux actionnables
  ScoringWidget.js        → score /100 avec recommandation et détail des critères
  LoadingSteps.js         → étapes animées pendant l'analyse

lib/
  normalizeUrl.js         → validation et normalisation de l'URL
  scraper.js              → fetch + extraction meta/og/favicon/LinkedIn/funding/signaux comportementaux
  techDetector.js         → 30+ patterns regex → tech détectée + signal GTM associé
  llmAnalyzer.js          → appel Groq, prompt JSON strict, fallback si échec LLM
  scorer.js               → score B2B SaaS sur 100 pts, logique explicite
  cache.js                → cache mémoire Map (get/set)
```

**Pipeline d'analyse :**
```
URL saisie → normalisation → cache? → scraping HTML
→ détection tech stack → appel LLM → scoring → assemblage → cache → affichage
```

Le LLM est **optionnel dans la pipeline** : si Groq échoue, l'analyse continue avec les données brutes du scraping. L'app ne tombe jamais complètement.

---

## Choix techniques et pourquoi

### Next.js App Router — pas de backend séparé
Le scraping et l'appel LLM doivent se faire côté serveur pour deux raisons business : ne pas exposer les clés API au client, et éviter les blocages CORS des sites scrapés. L'App Router permet d'avoir une Server Function directement dans le projet — pas besoin d'un backend Express séparé à maintenir et déployer.

### Groq (llama-3.3-70b-versatile) — vitesse avant tout
Le LLM structure les données brutes du scraping en JSON propre : nom d'entreprise, secteur, taille estimée. J'ai choisi Groq plutôt qu'OpenAI pour deux raisons métier : plan gratuit sans carte bancaire (zéro coût pour un MVP), et latence < 1s en moyenne — critique pour une app de qualification que des sales vont utiliser en flux tendu. L'appel se fait via `fetch` natif sans SDK pour limiter les dépendances.

### Scraping sans librairie externe — Vercel-ready
Plutôt que Cheerio ou Puppeteer, j'ai utilisé du regex sur le HTML brut. Avantage technique : zéro configuration pour le déploiement Vercel. Avantage business : les sites qui bloquent les headless browsers (Puppeteer) restent tout de même analysables via leurs métadonnées.

### Cache en mémoire — suffisant pour un MVP
Un `Map` Node.js évite de rappeler l'API et de re-scraper pour une URL déjà analysée dans la même session. Simple, sans infrastructure. La limite est connue et documentée (cf. section Limites).

---

## Logique de scoring "Fit B2B SaaS"

**Profil évalué : entreprise cible pour un vendeur B2B SaaS (type Konsole)**

Score sur 100 points. Chaque critère est indépendant et défendable — l'idée est qu'un sales puisse expliquer le score à son manager sans avoir à ouvrir le code.

| Critère | Points | Pourquoi ce poids |
|---|---|---|
| Stack SaaS détectée (Segment, Intercom…) | +30 | Signal le plus fort : une boîte qui a déjà investi dans une stack GTM a un budget et une culture outil |
| Secteur tech/software (via LLM) | +20 | Cible directe — les boîtes tech comprennent la valeur d'un outil SaaS B2B |
| Page pricing présente | +20 | Pricing transparent = culture SaaS, décision d'achat autonome probable |
| CTA demo ou trial détecté | +15 | Ils savent vendre de la même façon qu'on leur vend → empathie commerciale |
| Contenu en anglais | +15 | Marché anglophone = budget potentiellement plus élevé, habitude d'acheter des outils SaaS |

Interprétation : **75-100 → Fort fit, à prioriser** / **45-74 → Fit moyen, à qualifier** / **0-44 → Faible fit, hors cible**

---

## Lancer le projet en local

**Prérequis :** Node.js 18+, une clé API Groq gratuite sur [console.groq.com](https://console.groq.com) (pas de CB requise)

```bash
git clone https://github.com/ton-username/konsole-analyzer.git
cd konsole-analyzer
npm install
```

Créer `.env.local` à la racine :

```env
GROQ_API_KEY=ta_clé_groq_ici
```

```bash
npm run dev
# → http://localhost:3000
```

---

## Limites actuelles

| Limite | Impact business | Solution envisagée |
|---|---|---|
| Cache non persistant | Les cold starts Vercel vident le cache → premiers appels toujours lents | Redis / Vercel KV |
| Sites en JS pur | ~15% des sites chargent leur contenu via JS → scraping partiel | Browserless (headless managé) |
| Sites qui bloquent les bots | Quelques sites bloquent les requêtes non-browser | Rotation de User-Agent, Puppeteer |
| Scoring non configurable | Le score est fixe — ne s'adapte pas à un ICP différent (ex: vente aux PME) | ICP builder dans l'UI |
| Historique non partageable | L'historique est en localStorage, lié au navigateur de l'utilisateur | Base de données + comptes utilisateurs |

---

## Ce que j'améliorerais avec plus de temps

**Côté produit (priorité business) :**
1. **ICP configurable** — l'utilisateur définit sa cible (secteur, taille, stack attendue) et le score s'adapte
2. **Export CRM** — pousser les insights en un clic vers HubSpot ou Salesforce
3. **Analyse en batch** — uploader une liste de domaines et récupérer les scores en masse
4. **Alertes** — notifier quand un compte analysé change de profil (nouvelle techno détectée, levée de fonds...)

**Côté technique :**
1. **Persistance du cache** avec Vercel KV
2. **Scraping headless** pour les sites JS-only
3. **Enrichissement API** — LinkedIn, Hunter.io, Crunchbase pour compléter les données

---

## Stack

- [Next.js 16](https://nextjs.org) — App Router, Server Functions
- [Tailwind CSS v4](https://tailwindcss.com)
- [Groq](https://groq.com) — LLM inference (llama-3.3-70b-versatile)
- [Vercel](https://vercel.com) — hébergement et déploiement continu
