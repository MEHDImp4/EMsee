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

### 🎯 Pour démarrer rapidement :

1. Configurer le backend et la base de données
2. Mettre en place l'authentification JWT
3. Implémenter le fil d'actualité, la publication de tweets et la gestion de profil utilisateur
4. Ajouter les interactions sociales (likes, retweets, follow)  
