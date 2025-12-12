# ProjetJS — Clone Twitter (EMSI) 🐦⚙️

> Projet fullstack éducatif : React + TypeScript côté frontend, Node.js/Express + TypeScript côté backend. Une mini-plateforme sociale avec posts texte/images, likes, retweets, follows, profils, notifications… le tout pensé pour l’apprentissage. 🚀

## Présentation 📚
ProjetJS propose une architecture moderne et claire : authentification JWT, fil d’actualité personnalisé, interactions sociales et séparation nette frontend/backend. Le tout sert de support à des travaux pratiques pour étudiants.

## Fonctionnalités ✨

## Stack technique 🛠️

## Structure du dépôt 📂

```
ProjetJS/
├─ backend/
│  ├─ src/                 # Code source du backend (controllers, services, models, routes...)
│  ├─ dist/                # Fichiers compilés TypeScript
│  ├─ node_modules/        # Dépendances du backend
│  ├─ .env.example         # Exemple de variables d'environnement pour le backend
│  ├─ package.json         # Dépendances et scripts du backend
│  ├─ tsconfig.json        # Configuration TypeScript pour le backend
│  └─ ...                  # Autres fichiers de configuration ou utilitaires
├─ frontend/
│  ├─ public/              # Fichiers statiques (index.html, assets)
│  ├─ src/                 # Code source du frontend (composants, pages, services, styles...)
│  ├─ build/               # Fichiers de production compilés
│  ├─ node_modules/        # Dépendances du frontend
│  ├─ .env.example         # Exemple de variables d'environnement pour le frontend
│  ├─ package.json         # Dépendances et scripts du frontend
│  ├─ tsconfig.json        # Configuration TypeScript pour le frontend
│  └─ ...                  # Autres fichiers de configuration ou utilitaires
├─ .gitignore              # Fichiers et dossiers à ignorer par Git
├─ README.md               # Ce fichier
└─ ...                     # Autres fichiers à la racine (ex: .git, LICENSE)
```

## Installation & Lancement ⚙️

### 1. Cloner
```bash
git clone https://github.com/MEHDImp4/ProjetJS.git
cd ProjetJS
````

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # ou 'copy .env.example .env' sous Windows
npm run dev
```

Remplir les variables dans `backend/.env`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

Remplir `frontend/.env`.

Accès :

* Frontend : [http://localhost:3000](http://localhost:3000)
* Backend : [http://localhost:5000](http://localhost:5000) (modifiable dans `.env`)

## Scripts utiles 🧩

### Backend

* `npm run dev` — développement (nodemon + ts-node)
* `npm run build` — compilation TypeScript
* `npm start` — mode production
* `npm run lint` / `npm run format` — qualité du code

### Frontend

* `npm start` — développement
* `npm run build` — build production
* `npm test` — tests unitaires
* `npm run lint` / `npm run format` — qualité du code

## Variables d’environnement 🔑

### backend/.env

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=mysql://user:pass@host:port/dbname
JWT_SECRET=your_jwt_secret
```

### frontend/.env

```env
REACT_APP_API_URL=http://localhost:5000
```

## Tests & Build 🧪

* Tests frontend : `cd frontend && npm test`
* Build production :

  * `cd frontend && npm run build`
  * `cd backend && npm run build`

## UI/UX 🎨

Objectif graphique : un Twitter version EMSI, sobre et académique.

* Couleurs : vert EMSI (#006837) + orange pour les alertes.
* Thèmes light/dark.
* Arrangement 3 colonnes (sidebar, feed, widgets).
* Composants principaux : Sidebar, Composer, TweetCard, Rightbar.
* Fonctions scolaires : badges (étudiant, prof, admin, BDE), onglets « Pour vous » / « Ma Classe », affichage code (PrismJS/Highlight.js).

### Backlog priorisé

1. Thème & typographie
2. Responsive (3 → 2 → 1 colonnes)
3. Routing + Sidebar
4. Composer (UI d’abord)
5. TweetCard
6. Rightbar
7. Tabs « Pour vous » / « Ma Classe »

## Contribution 🤝

* Copier `.env.example` dans chaque dossier.
* Respecter TypeScript, séparer logique métier (services), contrôleurs (routes), middlewares et validations.
* Voir le README racine pour workflow complet (lint, format, conventions).

## Licence 📜

MIT — voir fichier LICENSE.

```

Si tu veux une version encore plus courte, ou avec des badges GitHub (build, licence, tech stack), je peux t’en préparer une autre.
```
