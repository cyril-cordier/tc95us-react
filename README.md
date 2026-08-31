# TC 95 Us — site du Tennis Club de Us (React)

Réécriture en React du site du [Tennis Club de Us](https://www.tc95us.fr) (95450),
initialement développé en Vue 2 / Vuex.

## Stack

| Rôle | Choix |
| --- | --- |
| Build | Vite 6 |
| UI | React 18 + TypeScript (strict) |
| Routage | React Router 6 (data router, routes en lazy) |
| Données serveur | TanStack Query 5 |
| Styles | Bootstrap 5 + React-Bootstrap |
| Éditeur riche | Quill (`react-quill-new`), chargé uniquement dans l'admin |
| Backend | Parse Server (REST) — inchangé |
| Déploiement | Netlify |

## Démarrer

```bash
npm install
cp .env.example .env   # puis renseigner les clés Parse
npm run dev
```

| Commande | Effet |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | typecheck + build de production dans `dist/` |
| `npm run preview` | sert le build de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript seul |

## Variables d'environnement

Toutes préfixées `VITE_` pour être exposées au client (voir `.env.example`).
Aucune n'est secrète au sens strict — ce sont des clés publiques Parse — mais
elles ne sont plus écrites en dur dans le code.

| Variable | Rôle |
| --- | --- |
| `VITE_PARSE_API_URL` | racine de l'API Parse |
| `VITE_PARSE_APPLICATION_ID` | identifiant d'application Parse |
| `VITE_PARSE_REST_API_KEY` | clé REST Parse |
| `VITE_PARSE_JAVASCRIPT_KEY` | clé JavaScript Parse |
| `CLOUDINARY_URL` | cloud Cloudinary ciblé par les uploads de l'admin (sans préfixe `VITE_` : lue au build seulement) |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | upload preset non signé autorisant ces envois |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics (vide = désactivé) |

## Architecture

```
src/
├── api/          définition des ressources Parse + hooks CRUD génériques
├── auth/         contexte de session et gardes de routes
├── lib/          client Parse, session, upload, tri, téléchargement
├── types/        modèle de données du club
├── components/
│   ├── layout/   coquille du site (navbar, footer, gabarits)
│   ├── ui/       primitives réutilisables
│   ├── content/  blocs éditoriaux pilotés depuis l'admin
│   ├── public/   tableaux et grilles des pages publiques
│   └── admin/    générateur de CRUD + configuration des 9 écrans
├── pages/        une page par route, chargée en lazy
└── routes.tsx    plan du site, redirections des anciennes URL incluses
```

### Le point central : un CRUD générique

La version Vue avait **9 modules Vuex** (~1 600 lignes) qui répétaient chacun les
mêmes `list / get / create / update / delete`, et **9 composants d'administration**
(~2 800 lignes) qui répétaient chacun le même tableau et les mêmes trois modales.

Ici, une ressource se déclare en quelques lignes :

```ts
export const eventsResource = define<ClubEvent>({
  key: 'events',
  path: '/classes/events',
  sort: byWeightDesc,
  numeric: ['weight'],
})
```

et son écran d'administration se décrit par ses champs
(`src/components/admin/configs.tsx`), que `<ResourceManager>` transforme en
tableau, formulaire, modales et mutations.

### Les blocs éditoriaux

Les textes du site vivent tous dans la classe Parse `contents` et sont
discriminés par leur champ `title`. Ces titres sont désormais des constantes
(`CONTENT_SLOTS`) : dans la version Vue chaque page comparait une chaîne
recopiée à la main, et une faute de frappe rendait le bloc invisible sans
erreur.

## Ce que la réécriture corrige

- **Jeton de session figé** — les en-têtes HTTP étaient construits une seule fois
  au chargement du module. Après une connexion, les écritures partaient encore
  avec l'ancien jeton (vide au premier chargement). Le jeton est maintenant relu
  à chaque requête.
- **`response.json()` sur une réponse axios** — présent dans chaque `edit` et
  `delete` des 9 modules. La méthode n'existe pas sur une réponse axios : la
  promesse partait en `catch` et l'interface n'était jamais rafraîchie.
- **Navigations en `window.location.href`** — une quinzaine d'occurrences qui
  rechargeaient toute l'application à chaque clic. Remplacées par le routeur.
- **Erreurs silencieuses** — tous les `catch` faisaient un `console.log`.
  L'utilisateur voyait une page vide. Les états de chargement et d'erreur sont
  maintenant affichés.
- **Contrôle d'accès** — l'écran admin testait `user.admin == false in getUser`,
  une expression qui n'évalue pas ce qu'elle prétend. Remplacé par une garde de
  route `<RequireAuth adminOnly />`.
- **Tri par date inopérant** — `b.date - a.date` sur des chaînes `JJ/MM/AAAA`
  donne toujours `NaN`. Les dates sont maintenant analysées avant comparaison.
- **Clé Filestack en dur** dans quatre composants — l'hébergement des fichiers
  passe désormais par Cloudinary, configuré par variables d'environnement.
  Seul le nom du cloud atteint le navigateur : l'envoi utilise un upload
  preset non signé, aucun secret n'est embarqué dans le bundle.
- **Fuite mémoire au téléchargement** — la fiche d'inscription créait un lien et
  un object URL jamais libérés, empilés à chaque clic.
- **Mutation de l'état global depuis un composant** — `getAllContents.splice()`
  modifiait directement le store Vuex.
- **Modales jQuery** — les `data-toggle` de Bootstrap 4 pilotaient le DOM en
  dehors de Vue. Remplacées par les modales contrôlées de React-Bootstrap.
- **Google Analytics actif en développement** — le script était injecté dans
  `index.html`. Il est maintenant chargé à la demande, et jamais en `dev`.

## Différences de comportement assumées

- **Les URL ont été renommées** en français lisible (`/carte` → `/contact`,
  `/reglement_club` → `/reglement`, `/legal` → `/mentions-legales`,
  `/about` → `/a-propos`, `/calendrier_events` → `/calendrier`,
  `/monCompte` → `/mon-compte`). Les anciennes redirigent vers les nouvelles.
- **L'inscription publique a été retirée.** Le formulaire Vue appelait une action
  inexistante (`createForm`) : il n'a jamais fonctionné. La connexion indique
  d'ailleurs « accès réservé à l'administration ». Les comptes se créent depuis
  l'écran d'administration.
- **Le classement du challenge masque les joueurs éliminés.** Le champ `visible`
  existait en base et était modifiable dans l'admin, mais aucune page ne s'en
  servait.
- **Les sets non joués ne sont plus affichés** comme `0/0` dans les résultats.

## Déploiement

Netlify, `npm run build` → `dist/`. La redirection SPA est dans `netlify.toml`.
Les variables d'environnement se règlent dans l'interface Netlify.
