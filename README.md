# ProjetJS — Clône de Twitter

> Projet fullstack : Frontend React/TypeScript & Backend Node.js/Express/TypeScript

## 📋 Présentation

ProjetJS est une application web inspirée de Twitter permettant aux utilisateurs de publier des tweets (texte et images), de suivre d'autres profils, d'aimer et de retweeter des publications, et de gérer leur profil. Ce projet vise à illustrer une architecture moderne fullstack avec React, TypeScript et Node.js.

## ✨ Fonctionnalités principales

- 🔐 Authentification (inscription, connexion, déconnexion) via JWT
- 📝 Publication de tweets (texte, image optionnelle)
- 📰 Fil d'actualité personnalisé (posts des utilisateurs suivis)
- 👥 Système de follow/unfollow
- ❤️ Likes et retweets
- 👤 Profils utilisateurs (bio, avatar, liste de tweets)

### 🎁 Fonctionnalités bonus

- #️⃣ Hashtags et mentions
- 🔔 Notifications en temps réel (WebSocket/Socket.IO)
- 🏖️ Mode « vacances » (désactivation notifications)
- 🎵 Intégration Spotify (partage de musique)

## 🛠️ Technologies utilisées

### Frontend
- React 18, TypeScript
- React Router
- Axios (requêtes API)
- Context API & hooks personnalisés

### Backend
- Node.js, Express.js, TypeScript
- JWT (authentification)
- CORS, dotenv
- Base de données (PostgreSQL, MongoDB, etc.)

## 📁 Structure du projet

```
ProjetJS/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration (DB, env)
│   │   ├── controllers/    # Logique des routes
│   │   ├── middlewares/    # Auth, validation, etc.
│   │   ├── models/         # Modèles de données
│   │   ├── routes/         # Définition des routes
│   │   ├── services/       # Logique métier
│   │   ├── types/          # Types TypeScript
│   │   ├── utils/          # Fonctions utilitaires
│   │   └── index.ts        # Entrée serveur
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── styles/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── layout/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🚀 Installation & Lancement

### 1. Cloner le dépôt
```bash
git clone <url-du-dépôt>
cd ProjetJS
```

### 2. Installer les dépendances

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Remplir les variables d'environnement dans .env
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Remplir les variables d'environnement dans .env
```

### 3. Lancer en développement

#### Backend
```bash
npm run dev
```

#### Frontend
```bash
npm start
```

### 4. Accès
- Frontend : http://localhost:3000
- Backend : http://localhost:5000 (modifiable dans .env)

## 📜 Scripts disponibles

### Backend
- `npm run dev` : Démarre le serveur en mode développement
- `npm run build` : Compile le TypeScript
- `npm start` : Démarre le serveur en production
- `npm run lint` : Lint du code avec ESLint
- `npm run format` : Formatage avec Prettier

### Frontend
- `npm start` : Démarre l'application en développement
- `npm run build` : Build de production
- `npm test` : Lance les tests
- `npm run lint` : Lint du code
- `npm run format` : Formatage du code

## ⚙️ Configuration des variables d'environnement

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=    # URL de la base de données
JWT_SECRET=      # Clé secrète JWT
```

### Frontend (`frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:5000
```

## 🧪 Tests & Build

### Lancer les tests frontend
```bash
cd frontend
npm test
```

### Build de production

#### Frontend
```bash
cd frontend
npm run build
```

#### Backend
```bash
cd backend
npm run build
```

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Ouvrir une issue pour discuter d'une fonctionnalité ou d'un bug
2. Proposer une pull request claire et documentée

## 📄 Licence

Ce projet est sous licence MIT (voir fichier LICENSE).

---

## 🧩 Design UI/UX — EMSISPHERE (EMSI)

> Objectif: un clone Twitter adapté à l’EMSI, équilibrant social (étudiants) et professionnel (administration/profs).

### 1) Identité visuelle (Look & Feel)
- Couleurs:
	- Primaire: Vert EMSI `#006837` (alternatif `#009540`) pour CTA, liens actifs et accents.
	- Secondaire: Orange pour notifications/alertes importantes (ex. examen reporté).
	- Fond: Light (blanc cassé) et Dark (gris foncé bleuté) — support du thème système + toggle.
- Typographie: Inter, Roboto ou Open Sans (sans-serif, lisible pour contenu académique).

### 2) Layout 3 colonnes
- Barre latérale gauche (fixe au scroll):
	- Logo EMSI en haut.
	- Menu: Accueil, Officiel (annonces admin/profs), Emploi du temps (ENT/aperçu), Clubs, Notifications, Messages, Profil.
	- CTA: gros bouton vert « Publier ».
- Colonne centrale (feed):
	- Header avec titre (ex. « Accueil ») + effet glassmorphism.
	- Zone de création: placeholder « Quoi de neuf, futur ingénieur ? » avec actions Image, Sondage, Bloc de code (coloration syntaxique).
	- Carte Post: avatar, nom + badge (voir « Badges »), contenu texte + média, actions: J’aime (cœur vert), Commenter, Reposter.
- Barre latérale droite (widgets):
	- Recherche: « Rechercher un cours, un prof… »
	- Tendances EMSI: `#PFE`, `#Rattrapage`, `#Hackathon`, `#3IIR` (ou classe active).
	- À suivre: suggestions de profs et présidents de clubs.

### 3) Spécificités « École »
- Badges de vérification:
	- 🎓 Étudiant
	- 👨‍🏫 Professeur (badge vert)
	- 🛡️ Administration (badge doré)
	- ⚙️ BDE / Clubs (badge bleu)
- Affichage de code: blocs de code avec coloration syntaxique (ex. PrismJS/Highlight.js côté frontend).
- Filtres de feed: onglets « Pour vous » (algo) et « Ma Classe » (promo seulement).

### 4) Découpage technique (frontend)
- `components/layout/`: Sidebar gauche, Header central, Rightbar widgets.
- `components/common/`: TweetCard, Composer, Badge, IconButton, Tabs, SearchBar.
- `pages/`: Accueil (feed), Officiel, Clubs, Notifications, Messages, Profil.
- `services/`: tendances, suggestions, sondages, uploads images.
- `contexts/` + `hooks/`: thème (light/dark), auth, onglets feed, badges.

### 5) Backlog initial UI/UX (priorisé)
1. Thème + variables couleur (light/dark) et typographie globale.
2. Layout 3 colonnes responsive (≥1024px: 3 colonnes; <1024px: 2/1 colonne).
3. Sidebar gauche + routes de base (Accueil, Officiel, Clubs, Profil).
4. Composer (texte, image, sondage, bloc code — UI, sans logique d’envoi d’abord).
5. TweetCard avec badges et actions (non-fonctionnelles d’abord, puis wiring API).
6. Rightbar: Recherche, Tendances EMSI, À suivre (mock, puis données API).
7. Tabs « Pour vous » / « Ma Classe » (état + placeholder de contenus).

```markdown
# ProjetJS — Clone Twitter léger

> Fullstack demo: `React` + `TypeScript` (frontend) et `Node.js` + `Express` + `TypeScript` (backend).

**Courte description**: ProjetJS est un clone éducatif de Twitter — posts (texte & images), likes, retweets, follow/unfollow, et profils utilisateurs — conçu pour illustrer une architecture moderne fullstack.

**Table des matières**
- **Présentation**
- **Fonctionnalités**
- **Technologies**
- **Structure**
- **Installation & démarrage**
- **Scripts utiles**
- **Configuration**
- **Contribution**
- **Licence**

## **Présentation**

ProjetJS est une application web didactique qui démontre les patterns communs d'une application sociale : authentification, gestion de posts, interactions sociales et architecture client-serveur claire.

## **Fonctionnalités**

- **Authentification**: inscription / connexion / JWT
- **Publications**: texte + image optionnelle
- **Fil d'actualité**: posts des personnes suivies
- **Interactions**: likes, retweets, commentaires
- **Profils**: avatar, bio, liste des posts
- **(Optionnel)**: hashtags, mentions, notifications temps réel

## **Technologies**

- **Frontend**: `React 18`, `TypeScript`, `React Router`, `Axios`
- **Backend**: `Node.js`, `Express`, `TypeScript`, `JWT`
- **DB**: adaptable (Postgres / MongoDB / autre)

## **Structure du projet**

- `backend/`: serveur Express, routes, contrôleurs, services
- `frontend/`: app React, composants, pages, services
- `database/`: scripts ou fichiers liés à la base de données

Arborescence (extrait):

```
ProjetJS/
├─ backend/
├─ frontend/
└─ README.md
```

## **Installation & démarrage**

1. Cloner le dépôt et se placer dans le dossier:

```pwsh
git clone <url-du-dépôt>
cd ProjetJS
```

2. Installer et configurer chaque package:

```pwsh
# Backend
cd backend
npm install
copy .env.example .env
# remplir `backend/.env`

# Frontend
cd ../frontend
npm install
copy .env.example .env
# remplir `frontend/.env`
```

3. Lancer en développement (depuis les dossiers respectifs):

```pwsh
# backend
npm run dev

# frontend
npm start
```

Par défaut:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000` (modifiable via `.env`)

## **Scripts utiles**

- `npm start` : démarre (frontend)
- `npm run dev` : démarre en mode développement (backend)
- `npm run build` : build production
- `npm test` : lancer les tests (frontend)
- `npm run lint` / `npm run format` : qualité du code

## **Configuration**

- Backend (`backend/.env`):

```
PORT=5000
NODE_ENV=development
DATABASE_URL=...
JWT_SECRET=...
```

- Frontend (`frontend/.env`):

```
REACT_APP_API_URL=http://localhost:5000
```

## **Contribution**

- Ouvrir une issue pour discuter d'une fonctionnalité ou d'un bug.
- Envoyer une pull request claire et ciblée.

## **Licence**

Ce projet est sous licence **MIT**.

---

## **Notes UI/UX (EMSISPHERE)**

Un cahier de style détaillé est inclus ci-dessous dans le dépôt pour guider la conception (couleurs EMSI, layout 3-colonnes, badges, etc.). Il sert de base pour l'interface et la priorisation des tâches UI.

``` 
Pour toute modification majeure du README, préférez des PR séparées et une issue associée.
```

```
