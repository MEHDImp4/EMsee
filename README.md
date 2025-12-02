# Clône de Twitter

## Description
Application web inspirée de Twitter permettant aux utilisateurs de publier des messages, suivre d'autres profils et interagir avec les publications (likes, retweets). Conçue pour être simple, extensible et servir de projet d'apprentissage sur React, TypeScript et gestion d'état.

## Fonctionnalités principales
- Publication de tweets (texte, images en option)
- Fil d'actualité avec posts des utilisateurs suivis
- Suivre / se désabonner d'un utilisateur
- Likes et retweets
- Profils utilisateur (bio, avatar, liste de tweets)
- Authentification (inscription, connexion, déconnexion)

## Fonctionnalités bonus
- Hashtags et mentions
- Notifications en temps réel (WebSockets)
- Mode "vacances" pour suspendre les notifications
- Intégration facultative avec Spotify pour partager la musique écoutée

## Technologies
- Frontend : React, TypeScript, CSS/SCSS
- Backend (optionnel) : Node.js, Express, ou tout backend REST/GraphQL
- Stockage : Base de données (ex. PostgreSQL, MongoDB) ou mock local
- Auth : JWT/session
- Temps réel : WebSocket / Socket.IO

## Installation (exemple)
1. Cloner le dépôt :
    git clone <url-du-dépôt>
2. Installer les dépendances :
    cd projet
    npm install
    (ou `yarn install`)

## Configuration
- Copier le fichier d'exemple d'environnement :
  cp .env.example .env
- Remplir les variables : URL_API, JWT_SECRET, DATABASE_URL, etc.

## Lancer le projet (développement)
- Frontend :
  npm run dev
  (ou `npm start` selon le template)
- Backend (si présent) :
  npm run dev:server

## Structure suggérée
- /src : code source React
- /server : backend (si inclus)
- /public : ressources statiques
- # ProjetJS

Projet fullstack avec frontend React TypeScript et backend Node.js TypeScript

## Structure du projet

```
ProjetJS/
├── backend/                    # Backend Node.js TypeScript
│   ├── src/
│   │   ├── config/            # Configuration (database, env)
│   │   ├── controllers/       # Contrôleurs des routes
│   │   ├── middlewares/       # Middlewares (auth, validation, etc.)
│   │   ├── models/            # Modèles de données
│   │   ├── routes/            # Définition des routes
│   │   ├── services/          # Logique métier
│   │   ├── types/             # Types TypeScript
│   │   ├── utils/             # Fonctions utilitaires
│   │   └── index.ts           # Point d'entrée du serveur
│   ├── .env.example           # Variables d'environnement exemple
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Frontend React TypeScript
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── assets/            # Images, styles, fonts
│   │   │   ├── images/
│   │   │   └── styles/
│   │   ├── components/        # Composants React
│   │   │   ├── common/        # Composants réutilisables
│   │   │   └── layout/        # Layout (Header, Footer, etc.)
│   │   ├── contexts/          # React Contexts
│   │   ├── hooks/             # Hooks personnalisés
│   │   ├── pages/             # Pages de l'application
│   │   ├── services/          # Services API
│   │   ├── types/             # Types TypeScript
│   │   ├── utils/             # Fonctions utilitaires
│   │   ├── App.tsx            # Composant principal
│   │   └── index.tsx          # Point d'entrée
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## Installation

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement dans .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configurer les variables d'environnement dans .env
npm start
```

## Scripts disponibles

### Backend
- `npm run dev` - Démarre le serveur en mode développement
- `npm run build` - Compile le TypeScript
- `npm start` - Démarre le serveur en production
- `npm run lint` - Vérifie le code avec ESLint
- `npm run format` - Formate le code avec Prettier

### Frontend
- `npm start` - Démarre l'application en mode développement
- `npm run build` - Crée une version de production
- `npm test` - Lance les tests
- `npm run lint` - Vérifie le code avec ESLint
- `npm run format` - Formate le code avec Prettier

## Technologies utilisées

### Backend
- Node.js
- Express.js
- TypeScript
- CORS
- dotenv

### Frontend
- React 18
- TypeScript
- React Router
- Axios

## Configuration

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DATABASE_URL=
JWT_SECRET=
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```, .env.example, package.json

## Tests et build
- Lancer les tests :
  npm test
- Construire pour production :
  npm run build

## Contribution
Contributions bienvenues : ouvrir une issue pour discuter des fonctionnalités, proposer des pull requests claires et documentées.

## Licence
Indiquer la licence choisie (ex. MIT). Voir le fichier LICENSE pour les détails.

---  
Pour commencer rapidement : définir un backend (ou utiliser des mocks), configurer l'authentification et implémenter le fil d'actualité, les tweets et le profil utilisateur.  
