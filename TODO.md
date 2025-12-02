# EMSISPHERE — TODO List

> Roadmap priorisée: Frontend → Base de données → Backend → Raccordement
> Référence design: voir section « Design UI/UX — EMSISPHERE (EMSI) » dans `README.md`.

## Phase 1 — Frontend

- [ ] Theme + Global Styles
  - Mettre en place thème clair/sombre (variables CSS), typographie, espacements de base dans `frontend/src/assets/styles/` (`index.css`, `App.css`). Ajouter un contexte de thème + toggle.
- [ ] Responsive 3-Column Layout
  - Grille avec Sidebar (gauche), Feed (centre), Rightbar (droite) dans `components/layout/`. Repli en 2/1 colonnes < 1024px.
- [ ] Sidebar Navigation
  - Logo EMSI, routes: Accueil, Officiel, Emploi du temps, Clubs, Notifications, Messages, Profil. CTA vert « Publier ».
- [ ] Header With Glassmorphism
  - Header central sticky avec titre (ex. « Accueil ») et effet glassmorphism.
- [ ] Rightbar Widgets
  - `SearchBar`, Tendances EMSI (`#PFE`, `#Rattrapage`, `#Hackathon`, `#3IIR`), Suggestions (profs, clubs).
- [ ] Feed Tabs Filters
  - Onglets « Pour vous » (algo placeholder) et « Ma Classe » (promo). État via context/hook.
- [ ] Composer Component (UI)
  - Saisie texte, bouton upload d’image, bouton sondage, insertion bloc de code (coloration syntaxique). UI uniquement d’abord.
- [ ] TweetCard Component (UI)
  - Avatar, nom + badge, contenu (texte/média), actions (like/comment/repost) non-fonctionnelles au début.
- [ ] Badge Component + Roles
  - Badges: 🎓 Étudiant, 👨‍🏫 Professeur (vert), 🛡️ Administration (doré), ⚙️ BDE/Clubs (bleu).
- [ ] Mock Services & Fixtures
  - Données factices dans `frontend/src/services/` pour feed, tendances, suggestions. Brancher les composants aux mocks.
- [ ] Auth UI + Context
  - Pages Login/Register et contexte d’auth (stockage token) avec protections de routes.
- [ ] Routing & Guards
  - Routes: Accueil, Officiel, Clubs, Notifications, Messages, Profil; protéger si nécessaire.
- [ ] Accessibility & Keyboard
  - Focus visible, rôles sémantiques, navigation clavier (tabs/actions).
- [ ] Frontend Tests & Lint
  - Tests unitaires pour TweetCard, Composer, Tabs. ESLint/Prettier scripts si manquants.
- [ ] Connect Real API Later
  - Préserver un seam clair pour remplacer les mocks par l’API (services typés TS).

## Phase 2 — Base de données

- [ ] DB Schema Design
  - Modéliser: Users, Profiles, Roles/Badges, Classes, Clubs, Tweets, Media, Polls, Comments, Likes, Retweets, Follows, Hashtags, Notifications, Messages.
- [ ] Migrations Setup
  - Outil: Prisma/Knex/TypeORM. Écrire migrations et config `.env` DB dans `backend/.env`.
- [ ] Seed Baseline Data
  - Rôles/badges, utilisateurs de test, classes, clubs.
- [ ] Indexes & Constraints
  - Index sur follows, likes, retweets, hashtags. Clés étrangères avec cascades; contraintes d’unicité.
- [ ] Media Storage Decision
  - Choisir stockage local dev vs cloud (S3…). Ajouter champs pour métadonnées médias.

## Phase 3 — Backend (Node/Express/TS)

- [ ] Express TS Scaffold Check
  - Vérifier `backend/src`: bootstrap serveur, env, CORS, Helmet, logging, gestion d’erreurs.
- [ ] Auth Endpoints + JWT
  - Register/Login/Logout, hash mots de passe, JWT access/refresh, rotation.
- [ ] Profiles & Badges API
  - Récupération/mise à jour profil, attribution badges par rôle; listes par rôle (profs, clubs).
- [ ] Tweets CRUD + Media
  - Créer/lire/supprimer tweets avec upload média; sondages et blocs de code (Markdown sécurisé).
- [ ] Feeds API
  - « Pour vous » (placeholder algo), « Ma Classe », Officiel-only, Clubs avec pagination.
- [ ] Social Actions API
  - Follow/Unfollow, Like/Unlike, Retweet/Unretweet, commentaires (threads).
- [ ] Trends & Suggestions API
  - Tendances hashtags et suggestions (profs/clubs) via heuristiques de graphe.
- [ ] Notifications & Realtime
  - Endpoints notifications; Socket.IO optionnel pour temps réel.
- [ ] Validation & Security
  - Validation (Zod/Joi), rate limiting, sanitisation input, CORS, limites taille/type de fichiers.
- [ ] Backend Tests & Docs
  - Tests services/controllers; docs API (README/OpenAPI).

## Phase 4 — Raccordement Frontend ↔ Backend

- [ ] Wire Frontend to API
  - Remplacer les mocks dans `frontend/src/services/` par les endpoints réels. Vérifier les flux: auth, feed, post.

---

### Conseils
- Commencer par les mocks pour fluidifier l’UI et l’UX, puis brancher l’API.
- Garder des composants « dumb » (UI) et séparer la logique (services/hooks) pour faciliter les tests.
- Tester et lint petit à petit pour éviter la dette.
