# Konsole Analyzer

> Outil d'intelligence prospect pour équipes GTM — construit dans le cadre d'un exercice technique pour [Youno / Konsole](https://youno.ai).

**[Voir la démo en live →](https://konsole-analyzer.vercel.app)**

---

## Le problème métier

Un GTM Engineer ou un BDR qui prospecte passe en moyenne **15 à 30 minutes par prospect** à faire de la recherche manuelle : site web, LinkedIn, StackShare, réseaux sociaux. Pour qualifier 50 comptes par semaine, c'est jusqu'à **25 heures perdues en recherche à faible valeur ajoutée**.

Le vrai travail — la prise de contact, la personnalisation du message, la relance — ne commence qu'après.

**Konsole Analyzer résout ça.** Entrez une URL, obtenez en quelques secondes un profil complet : stack technologique détectée, signaux comportementaux actionnables, données structurées prêtes à être exportées dans votre CRM.

---

## Ce que l'app retourne

- **Nom, description, secteur** — extrait et structuré par LLM à partir du contenu du site
- **Taille approximative** — estimée par le LLM à partir des indices disponibles
- **Tech stack détectée** — 30+ technologies identifiées par pattern matching (Segment, Intercom, HubSpot, Stripe, Salesforce...)
- **Signaux comportementaux** — pas juste "Intercom détecté", mais "Chat live → équipe sales réactive à l'inbound"
- **Lien LinkedIn** de l'entreprise si présent sur la page
- **Historique partagé** entre tous les membres de l'équipe

---

## Décisions produit et pourquoi

### Pas de scoring — c'est le travail du GTM Engineer

La v1 incluait un score de fit B2B sur 100 points. Cette fonctionnalité a été retirée pour une raison simple : **qualifier un prospect, c'est le métier du GTM Engineer, pas celui de l'outil.**

Un score automatique donne une fausse impression d'objectivité. Il repose sur des critères fixés par le développeur qui ne correspondent pas forcément à l'ICP de chaque équipe. Pire : il encourage le sales à faire confiance à un nombre plutôt qu'à son jugement.

L'app fournit des **données brutes et des signaux vérifiables**. Le GTM Engineer décide quoi en faire.

### Une vraie web app, pas un site vitrine

La v1 était utilisable uniquement en solo, via un navigateur. L'historique était stocké en localStorage — invisible pour les collègues, perdu au changement de navigateur.

Une équipe sales ne fonctionne pas en silos. L'app v2 est une **application web collaborative** : compte utilisateur, historique partagé entre membres de l'équipe, surveillance de signaux centralisée.

### Analyse en batch

Quand un BDR reçoit une liste de 50 domaines à qualifier, il ne veut pas les traiter un par un. Le mode batch accepte jusqu'à 20 URLs simultanément, les traite 3 par 3 (pour respecter les rate limits Groq), et retourne un tableau exportable.

### Surveillance de signaux (Signal Watch)

Les meilleurs moments pour contacter un prospect sont souvent éphémères : ils viennent d'adopter une nouvelle technologie, leur stack a changé. La fonctionnalité Watch permet de **mettre un site sous surveillance** — un cron tourne chaque nuit et notifie l'équipe si quelque chose change.

### Export CSV compatible HubSpot

Les insights ne valent rien s'ils restent dans l'app. L'export génère un CSV avec un BOM UTF-8 (compatible Excel) et des colonnes calquées sur les champs standard HubSpot (`Company name`, `LinkedIn Company Page`, `Industry`...) pour un import direct sans manipulation.

---

## Architecture technique

```
app/
  page.js                        → interface principale (mode single + batch)
  login/page.js                  → formulaire de connexion
  history/page.js                → historique partagé paginé
  signals/page.js                → signaux détectés sur les sites surveillés
  admin/users/page.js            → gestion des membres de l'équipe
  api/
    analyze/route.js             → analyse d'une URL (cache 24h MongoDB)
    analyze/batch/route.js       → analyse de plusieurs URLs en parallèle
    history/route.js             → historique partagé paginé
    watch/route.js               → abonnements de surveillance
    signals/route.js             → lecture et marquage des signaux
    cron/check-signals/route.js  → job nightly de détection de changements
    auth/[...nextauth]/route.js  → handler NextAuth
    setup/route.js               → création du premier admin
    admin/users/route.js         → CRUD utilisateurs (admin only)

components/
  BatchInput.js                  → textarea multi-URLs + validation
  BatchResults.js                → tableau de résultats + export CSV
  ExportButton.js                → export CSV (single ou batch)
  WatchButton.js                 → toggle surveillance d'un site
  Header.js                      → navigation + badge signaux non lus
  Providers.js                   → SessionProvider (client)

lib/
  auth.js                        → config NextAuth (credentials + JWT + rôles)
  mongoose.js                    → connexion MongoDB singleton
  exportCsv.js                   → génération CSV avec BOM
  normalizeUrl.js                → validation et normalisation d'URL
  scraper.js                     → fetch HTML + extraction meta/LinkedIn/signaux
  techDetector.js                → 30+ patterns regex → stack + signaux GTM
  llmAnalyzer.js                 → appel Groq, prompt JSON strict, fallback
  models/
    User.js                      → utilisateur avec rôle (admin / gtm_engineer)
    Analysis.js                  → résultat d'analyse avec référence à l'analyste
    Watch.js                     → site sous surveillance + snapshot
    Signal.js                    → changement détecté sur un site surveillé

proxy.js                         → protection des routes + contrôle d'accès admin
vercel.json                      → cron nightly (0 2 * * *)
```

**Pipeline d'analyse :**
```
URL → normalisation → cache MongoDB (24h)? → scraping HTML
→ détection tech stack → appel LLM → assemblage → sauvegarde → affichage
```

---

## Choix techniques et pourquoi

### Next.js App Router — pas de backend séparé
Le scraping et l'appel LLM doivent se faire côté serveur pour deux raisons : ne pas exposer les clés API au client, et éviter les blocages CORS des sites scrapés. L'App Router permet d'avoir des Server Functions directement dans le projet sans backend Express séparé à maintenir.

### NextAuth v4 — credentials + JWT + rôles
L'authentification repose sur un système email/mot de passe classique avec des rôles (`admin`, `gtm_engineer`). Pas d'OAuth pour éviter de dépendre d'un fournisseur externe. La session est propagée via JWT — le rôle est inclus dans le token pour éviter un aller-retour base de données à chaque requête. Le middleware `proxy.js` protège toutes les routes et redirige les non-admins hors de `/admin`.

### MongoDB Atlas + Mongoose — cache persistant et historique partagé
Le cache mémoire (`Map`) de la v1 était vidé à chaque cold start Vercel. MongoDB remplace ça avec un cache persistant de 24h sur les analyses. Il stocke aussi l'historique partagé, les abonnements de surveillance et les signaux détectés. Mongoose est utilisé en singleton pour éviter les connexions multiples lors des hot-reloads en développement.

### Groq (llama-3.3-70b-versatile) — vitesse avant tout
Plan gratuit sans CB, latence < 1s en moyenne — critique pour une app utilisée en flux tendu par des sales. Si Groq échoue, l'analyse continue avec les données brutes du scraping. Le LLM est optionnel dans la pipeline : l'app ne tombe jamais complètement.

### Scraping sans librairie — Vercel-ready
Regex sur le HTML brut plutôt que Cheerio ou Puppeteer. Zéro configuration pour Vercel, et les sites qui bloquent les headless browsers restent analysables via leurs métadonnées.

### Batch avec Promise.allSettled par chunks de 3
Le traitement concurrent est limité à 3 URLs simultanées pour respecter les rate limits de Groq. `Promise.allSettled` garantit qu'une URL en erreur n'interrompt pas l'analyse des autres.

---

## Lancer le projet en local

**Prérequis :** Node.js 18+, un cluster MongoDB Atlas (gratuit), une clé Groq ([console.groq.com](https://console.groq.com))

```bash
git clone https://github.com/Dylan-f1/Konsole_Analyzer.git
cd Konsole_Analyzer
npm install
```

Créer `.env.local` à la racine :

```env
GROQ_API_KEY=ta_clé_groq
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=une_chaîne_aléatoire_longue
NEXTAUTH_URL=http://localhost:3000
CRON_SECRET=une_autre_chaîne_aléatoire
```

Créer le premier compte admin :

```bash
node scripts/seed-admin.mjs
# → dylan@konsole.app / Admin1234!
```

```bash
npm run dev
# → http://localhost:3000
```

---

## Limites actuelles

| Limite | Impact | Solution envisagée |
|---|---|---|
| Sites en JS pur | ~15% des sites chargent leur contenu via JS → scraping partiel | Browserless (headless managé) |
| Sites qui bloquent les bots | Quelques sites retournent une 403 | Rotation de User-Agent |
| Signaux GTM réels | Les vrais signaux GTM (Crunchbase, LinkedIn, levées de fonds) nécessitent des APIs payantes — on détecte des signaux comportementaux côté site | Intégration Crunchbase API, Apollo |
| Pas d'export vers CRM | L'export CSV est manuel | Webhook HubSpot / Salesforce |

---

## Stack

- [Next.js 16](https://nextjs.org) — App Router, Server Functions
- [NextAuth v4](https://next-auth.js.org) — authentification JWT
- [Tailwind CSS v4](https://tailwindcss.com)
- [Groq](https://groq.com) — LLM inference (llama-3.3-70b-versatile)
- [MongoDB Atlas](https://www.mongodb.com/atlas) + [Mongoose](https://mongoosejs.com)
- [Vercel](https://vercel.com) — hébergement, déploiement continu, cron jobs
