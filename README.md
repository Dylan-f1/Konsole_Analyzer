# Konsole Analyzer

> Outil d'intelligence prospect pour équipes commerciales B2B — construit dans le cadre d'un exercice technique pour [Youno / Konsole](https://youno.ai).

**[Voir la démo en live →](https://konsole-analyzer.vercel.app)**

---

## Ce que fait l'app

Entrez une URL d'entreprise. En quelques secondes, l'app retourne :

- **Nom, description, secteur, taille** — structurés par un modèle de langage à partir du contenu de la page
- **Tech stack détectée** — 30+ technologies identifiées par pattern matching sur le HTML (Stripe, HubSpot, Intercom, Segment, Salesforce...)
- **Infrastructure** — détectée depuis les en-têtes HTTP de la réponse (Cloudflare, Vercel, AWS, nginx, backend language...)
- **Signaux comportementaux** — blog, documentation publique, page clients, communauté Slack/Discord, levée de fonds, conformité RGPD...
- **Lien LinkedIn** de l'entreprise si présent sur la page

Toutes les analyses sont partagées entre les membres de l'équipe. L'historique est commun, consultable, exportable.

---

## Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| Analyse URL unique | Profil complet en < 5s |
| Analyse en batch | Jusqu'à 20 URLs simultanément, traitées 3 par 3 |
| Historique partagé | Toutes les analyses de l'équipe, paginées, recherchables |
| Détail d'une analyse | Panneau latéral depuis l'historique — CompanyCard + stack + signaux |
| Surveillance de signaux | Watch sur un site — détection nightly des changements de stack |
| Export CSV | Compatible HubSpot et Excel (encodage UTF-8 avec BOM) |
| Gestion des accès | Rôles admin / membre, création de comptes depuis `/admin/users` |

---

## Choix techniques et pourquoi

### Next.js App Router — pas de backend séparé

Le scraping et l'appel au modèle de langage doivent se faire côté serveur : ne pas exposer les clés API au client, et éviter les blocages CORS des sites scrapés. L'App Router de Next.js permet d'avoir des fonctions serveur directement dans le projet — pas de backend Express séparé à déployer et maintenir.

### Groq (llama-3.3-70b-versatile) — vitesse avant tout

Le modèle de langage structure les données brutes du scraping en JSON propre : nom, secteur, taille estimée. Groq a été choisi pour deux raisons concrètes : plan gratuit sans carte bancaire (zéro coût pour un prototype) et latence inférieure à 1 seconde, critique pour un outil utilisé en flux tendu. Si Groq échoue, l'analyse continue avec les données brutes — le modèle est optionnel dans la pipeline, l'app ne tombe jamais complètement.

### Scraping sans librairie externe — compatible Vercel

Pattern matching regex sur le HTML brut plutôt que Cheerio ou Puppeteer. Zéro configuration pour Vercel, et les sites qui bloquent les navigateurs headless restent analysables via leurs métadonnées. Les en-têtes HTTP de la réponse sont analysés en parallèle pour détecter l'infrastructure (CDN, hébergeur, backend).

### MongoDB Atlas + Mongoose — cache persistant et données partagées

Le cache mémoire (`Map`) ne survit pas aux redémarrages du serveur sur Vercel. MongoDB remplace ça avec un cache persistant de 24 heures sur chaque analyse. Il stocke aussi l'historique partagé entre membres de l'équipe, les abonnements de surveillance et les signaux détectés. Mongoose est utilisé en singleton pour éviter les connexions multiples lors des rechargements à chaud en développement.

### NextAuth v4 — authentification email/mot de passe avec rôles

Pas d'OAuth pour éviter la dépendance à un fournisseur externe. L'authentification repose sur email + mot de passe (bcrypt, salage à 12 rounds). Le rôle est inclus dans le token JWT pour éviter un aller-retour base de données à chaque requête. Le fichier `proxy.js` protège toutes les routes et redirige les non-admins hors de `/admin`.

### Traitement batch par groupes de 3 avec Promise.allSettled

Le traitement concurrent est limité à 3 URLs simultanées pour respecter les limites de débit de Groq. `Promise.allSettled` garantit qu'une URL en erreur n'interrompt pas l'analyse des autres — le résultat partiel est toujours exploitable.

---

## Lancer le projet en local

**Prérequis :** Node.js 18+, un cluster MongoDB Atlas gratuit ([mongodb.com/atlas](https://mongodb.com/atlas)), une clé Groq gratuite ([console.groq.com](https://console.groq.com))

```bash
git clone https://github.com/Dylan-f1/Konsole_Analyzer.git
cd Konsole_Analyzer
npm install
```

Créer `.env.local` à la racine :

```env
GROQ_API_KEY=ta_clé_groq
MONGODB_URI=mongodb+srv://utilisateur:motdepasse@cluster.mongodb.net/Konsole_Analyzer
NEXTAUTH_SECRET=une_chaine_aleatoire_longue_minimum_32_caracteres
NEXTAUTH_URL=http://localhost:3000
CRON_SECRET=une_autre_chaine_aleatoire
```

### Créer le premier compte administrateur

La route `POST /api/setup` crée le premier compte admin. Elle se bloque automatiquement dès qu'un utilisateur existe en base — à appeler une seule fois :

```bash
curl -X POST http://localhost:3000/api/setup \
  -H "Content-Type: application/json" \
  -d '{"name": "Prénom", "email": "email@exemple.com", "password": "MotDePasse123!"}'
```

Les comptes suivants se créent depuis l'interface `/admin/users` une fois connecté.

```bash
npm run dev
# → http://localhost:3000/login
```

---

## Limites actuelles et ce que j'améliorerais avec plus de temps

### Limites actuelles

**Sites chargés en JavaScript pur**
Environ 15% des sites modernes chargent leur contenu via React ou Vue côté client. Le scraping ne voit que le HTML initial — vide. L'analyse retourne des données partielles ou seulement le nom de domaine. Avec plus de temps, j'intégrerais un navigateur headless managé (Browserless) pour rendre ces pages avant de les analyser.

**Sites qui bloquent les bots**
Certains sites, souvent de grands groupes, répondent 403 ou redirigent vers une page de vérification. L'app retourne une erreur. La solution connue est un proxy rotatif avec rotation de User-Agent, mais ça introduit des coûts d'infrastructure qui n'ont pas leur place dans un prototype.

**Les signaux de mise sur le marché réels ne sont pas là**
On détecte ce qui est visible sur le site public. Les signaux qui déclenchent vraiment une conversation commerciale — une levée de fonds annoncée, un recrutement de directeur des ventes, un changement de direction — nécessitent des APIs externes payantes (Crunchbase, Apollo, LinkedIn). C'est la prochaine couche logique, mais hors scope d'un prototype sans budget API.

**Le cache peut masquer des changements récents**
Si une entreprise change de stack aujourd'hui et que le site a été analysé hier, les données affichées sont celles d'hier. Le cache dure 24 heures. Le bouton "Réanalyser" contourne ça manuellement, mais il n'y a pas de détection automatique si on ne surveille pas le site.

**La surveillance tourne une fois par nuit**
Le cron de détection de changements se déclenche à 2h du matin. Si quelque chose change entre deux passages, le délai peut aller jusqu'à 24 heures avant que l'équipe soit notifiée. Avec plus de temps, je passerais sur une surveillance toutes les 4 à 6 heures et j'ajouterais une notification par email ou Slack.

---

## Architecture

```
app/
  page.js                        → interface principale (URL unique + batch)
  login/page.js                  → formulaire de connexion
  history/page.jsx               → historique partagé avec recherche et panneau de détail
  signals/page.js                → signaux détectés sur les sites surveillés
  admin/users/page.js            → gestion des membres de l'équipe
  api/
    analyze/route.js             → POST — analyse une URL (cache 24h, force refresh possible)
    analyze/batch/route.js       → POST — analyse plusieurs URLs en parallèle (max 20)
    history/route.js             → GET — historique paginé avec recherche (q, page, limit)
    watch/route.js               → GET / POST / DELETE — abonnements de surveillance
    signals/route.js             → GET / PATCH — signaux et marquage comme lus
    cron/check-signals/route.js  → POST — job nightly protégé par CRON_SECRET
    auth/[...nextauth]/route.js  → handler NextAuth
    setup/route.js               → POST — création du premier admin (bloqué ensuite)
    admin/users/route.js         → GET / POST / DELETE — gestion des comptes (admin)

lib/
  auth.js          → config NextAuth (credentials, JWT, rôles)
  mongoose.js      → connexion MongoDB singleton (hot-reload safe)
  exportCsv.js     → CSV avec BOM UTF-8, colonnes compatibles HubSpot
  normalizeUrl.js  → validation et normalisation d'URL
  scraper.js       → fetch HTML + headers + extraction des signaux
  techDetector.js  → 30+ patterns regex → stack + signaux comportementaux
  llmAnalyzer.js   → appel Groq, prompt JSON strict, fallback si échec
  models/
    User.js        → email, password (bcrypt), role (admin / gtm_engineer)
    Analysis.js    → résultat complet avec référence à l'analyste, cache 24h
    Watch.js       → site surveillé + snapshot de référence
    Signal.js      → changement détecté sur un site surveillé

proxy.js           → protection des routes + contrôle d'accès admin
vercel.json        → cron nightly à 2h du matin (0 2 * * *)
```

---

## Stack

- [Next.js 16](https://nextjs.org) — App Router, Server Functions
- [NextAuth v4](https://next-auth.js.org) — authentification JWT avec rôles
- [Tailwind CSS v4](https://tailwindcss.com)
- [Groq](https://groq.com) — inférence LLM (llama-3.3-70b-versatile)
- [MongoDB Atlas](https://www.mongodb.com/atlas) + [Mongoose](https://mongoosejs.com)
- [Vercel](https://vercel.com) — hébergement, déploiement continu, cron jobs
