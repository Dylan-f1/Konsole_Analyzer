# Konsole Analyzer

> Outil d'intelligence prospect pour équipes commerciales B2B — construit dans le cadre d'un exercice technique pour [Youno / Konsole](https://youno.ai).

**[Voir la démo en live →](https://konsole-analyzer.vercel.app)**

---

## Le problème

Quand un commercial ou un ingénieur chargé de la stratégie de mise sur le marché prospecte, il passe en moyenne **15 à 30 minutes par entreprise** à faire de la recherche manuelle : site web, LinkedIn, réseaux sociaux. Pour qualifier 50 comptes par semaine, c'est jusqu'à **25 heures perdues en recherche à faible valeur ajoutée**.

Le vrai travail — la prise de contact, la personnalisation du message, la relance — ne commence qu'après.

**Konsole Analyzer résout ça.** Entrez une URL, obtenez en quelques secondes un profil complet : stack technologique détectée, signaux comportementaux actionnables, données structurées prêtes à être exportées dans votre outil CRM.

---

## Fonctionnalités

### Analyse d'URL

Entrez n'importe quel domaine ou URL. L'app retourne :

- **Nom, description, secteur** — extrait et structuré par le modèle de langage à partir du contenu du site
- **Taille approximative** — estimée à partir des indices disponibles sur la page (micro / petite / moyenne / grande)
- **Tech stack détectée** — 30+ technologies identifiées par pattern matching (Segment, Intercom, HubSpot, Stripe, Salesforce, PostHog...)
- **Signaux comportementaux** — pas juste "Intercom détecté", mais "Chat live actif → équipe commerciale réactive à l'inbound"
- **Lien LinkedIn** de l'entreprise si présent sur la page

### Analyse en batch

Le mode batch accepte jusqu'à 20 URLs en même temps. Les résultats s'affichent dans un tableau exportable. Utile quand un commercial reçoit une liste de prospects à qualifier rapidement.

### Historique partagé

Toutes les analyses effectuées par l'équipe sont centralisées dans un historique commun, paginé, avec la référence à l'analyste qui a lancé la recherche.

### Surveillance de signaux

Un site peut être mis sous surveillance. Un job automatique tourne chaque nuit et compare la stack technologique et les signaux détectés avec le dernier snapshot. Si quelque chose change (nouvelle technologie adoptée, nouveau signal détecté), un signal est créé et visible par toute l'équipe.

### Export CSV compatible HubSpot

Les résultats sont exportables en CSV avec un encodage UTF-8 compatible Excel, et des colonnes calquées sur les champs standard HubSpot (`Company name`, `LinkedIn Company Page`, `Industry`...) pour un import direct sans manipulation.

### Gestion des accès

Deux rôles : `admin` et `gtm_engineer`. L'administrateur crée les comptes de l'équipe depuis `/admin/users`. Toutes les routes sont protégées par authentification JWT.

---

## Décisions produit

### Pas de scoring automatique

Qualifier un prospect, c'est le métier du commercial ou de l'ingénieur chargé de la stratégie de mise sur le marché — pas celui de l'outil. Un score calculé automatiquement reposerait sur des critères fixés par le développeur qui ne correspondent pas forcément à la cible de chaque équipe. L'app fournit des **données brutes et des signaux vérifiables**. L'équipe décide quoi en faire.

### Application web collaborative, pas un outil solo

Un historique stocké dans le navigateur est invisible pour les collègues et perdu au changement de machine. Une équipe commerciale ne fonctionne pas en silos. L'app est pensée comme un **outil partagé** : compte utilisateur, historique commun, surveillance centralisée.

### Signaux comportementaux vs signaux de marché

Les signaux détectés sont des **signaux comportementaux** extraits du site (technologies installées, présence d'un chat, structure de pricing). Les signaux de marché réels — levées de fonds, changements de poste, publications LinkedIn — nécessitent des APIs externes (Crunchbase, Apollo) et relèvent d'une prochaine itération.

---

## Architecture

```
app/
  page.js                        → interface principale (mode URL unique + batch)
  login/page.js                  → formulaire de connexion
  history/page.js                → historique partagé paginé
  signals/page.js                → signaux détectés sur les sites surveillés
  admin/users/page.js            → gestion des membres de l'équipe
  api/
    analyze/route.js             → POST — analyse une URL, cache 24h MongoDB
    analyze/batch/route.js       → POST — analyse plusieurs URLs en parallèle
    history/route.js             → GET — historique paginé
    watch/route.js               → GET / POST / DELETE — abonnements de surveillance
    signals/route.js             → GET / PATCH — lecture et marquage des signaux
    cron/check-signals/route.js  → POST — job nightly, protégé par CRON_SECRET
    auth/[...nextauth]/route.js  → handler NextAuth
    setup/route.js               → POST — création du premier admin (bloqué ensuite)
    admin/users/route.js         → GET / POST / DELETE — gestion des comptes (admin)

components/
  BatchInput.js                  → saisie multi-URLs + validation (max 20)
  BatchResults.js                → tableau de résultats + bouton export
  ExportButton.js                → export CSV (une analyse ou toutes)
  WatchButton.js                 → toggle surveillance d'un site
  Header.js                      → navigation + badge signaux non lus (polling 60s)
  Providers.js                   → SessionProvider (client)

lib/
  auth.js                        → config NextAuth (credentials, JWT, rôles)
  mongoose.js                    → connexion MongoDB singleton
  exportCsv.js                   → génération CSV avec BOM UTF-8
  normalizeUrl.js                → validation et normalisation d'URL
  scraper.js                     → fetch HTML + extraction meta / LinkedIn / signaux
  techDetector.js                → 30+ patterns regex → stack + signaux comportementaux
  llmAnalyzer.js                 → appel Groq, prompt JSON strict, fallback si échec
  models/
    User.js                      → utilisateur avec rôle (admin / gtm_engineer)
    Analysis.js                  → résultat d'analyse avec référence à l'analyste
    Watch.js                     → site surveillé + snapshot de référence
    Signal.js                    → changement détecté sur un site surveillé

proxy.js                         → protection des routes + contrôle d'accès admin
vercel.json                      → cron nightly (0 2 * * *)
```

**Pipeline d'analyse :**
```
URL → normalisation → cache MongoDB (24h) ? → scraping HTML
→ détection tech stack → appel LLM → assemblage → sauvegarde → affichage
```

---

## Choix techniques

### Next.js App Router — pas de backend séparé
Le scraping et l'appel au modèle de langage se font côté serveur pour deux raisons : ne pas exposer les clés API au client, et éviter les blocages CORS des sites scrapés. L'App Router permet d'avoir des fonctions serveur directement dans le projet sans backend Express séparé à maintenir.

### NextAuth v4 — credentials + JWT + rôles
Authentification email/mot de passe classique sans dépendance à un fournisseur OAuth externe. Le rôle est inclus dans le token JWT pour éviter un aller-retour base de données à chaque requête. Le fichier `proxy.js` protège toutes les routes et redirige les non-admins hors de `/admin`.

### MongoDB Atlas + Mongoose — cache persistant et données partagées
MongoDB stocke les analyses (cache 24h), l'historique partagé, les abonnements de surveillance et les signaux détectés. Mongoose est utilisé en singleton pour éviter les connexions multiples lors des hot-reloads en développement.

### Groq (llama-3.3-70b-versatile) — vitesse avant tout
Plan gratuit sans carte bancaire, latence inférieure à 1 seconde en moyenne. Si Groq échoue, l'analyse continue avec les données brutes du scraping — le modèle de langage est optionnel dans la pipeline.

### Scraping sans librairie externe — compatible Vercel
Regex sur le HTML brut plutôt que Cheerio ou Puppeteer. Zéro configuration pour Vercel, et les sites qui bloquent les navigateurs headless restent analysables via leurs métadonnées.

### Batch avec Promise.allSettled par groupes de 3
Le traitement concurrent est limité à 3 URLs simultanées pour respecter les limites de débit de Groq. `Promise.allSettled` garantit qu'une URL en erreur n'interrompt pas l'analyse des autres.

---

## Installation et premier démarrage

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

### Créer le premier compte administrateur

La route `POST /api/setup` crée le premier compte admin. Elle est bloquée automatiquement dès qu'un utilisateur existe en base. À appeler une seule fois au premier démarrage :

```bash
curl -X POST http://localhost:3000/api/setup \
  -H "Content-Type: application/json" \
  -d '{"name": "Dylan", "email": "dylan@konsole.app", "password": "MotDePasseSecurisé!"}'
```

Ou via PowerShell :

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/setup" `
  -ContentType "application/json" `
  -Body '{"name":"Dylan","email":"dylan@konsole.app","password":"MotDePasseSecurisé!"}'
```

Une fois connecté, les autres comptes se créent depuis l'interface `/admin/users`.

```bash
npm run dev
# → http://localhost:3000
```

---

## Gestion des comptes via l'API

| Route | Méthode | Accès | Description |
|---|---|---|---|
| `/api/setup` | POST | Public (une seule fois) | Crée le premier admin si aucun utilisateur n'existe |
| `/api/admin/users` | GET | Admin | Liste tous les membres de l'équipe |
| `/api/admin/users` | POST | Admin | Crée un nouveau compte (`name`, `email`, `password`, `role`) |
| `/api/admin/users` | DELETE | Admin | Supprime un compte par `id` |

---

## Limites actuelles

| Limite | Impact | Solution envisagée |
|---|---|---|
| Sites chargés en JavaScript pur | ~15% des sites chargent leur contenu via JavaScript — le scraping retourne une page partielle | Browserless (navigateur headless managé) |
| Sites qui bloquent les bots | Certains sites retournent une 403 sur les requêtes automatisées | Rotation de User-Agent |
| Signaux de marché (levées de fonds, recrutement) | Nécessitent des APIs externes payantes (Crunchbase, Apollo, LinkedIn) | Intégration API en prochaine itération |
| Pas d'export direct vers le CRM | L'export CSV est manuel | Webhook HubSpot / Salesforce |

---

## Stack

- [Next.js 16](https://nextjs.org) — App Router, Server Functions
- [NextAuth v4](https://next-auth.js.org) — authentification JWT
- [Tailwind CSS v4](https://tailwindcss.com)
- [Groq](https://groq.com) — inférence LLM (llama-3.3-70b-versatile)
- [MongoDB Atlas](https://www.mongodb.com/atlas) + [Mongoose](https://mongoosejs.com)
- [Vercel](https://vercel.com) — hébergement, déploiement continu, cron jobs
