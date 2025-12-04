# ProjetJS — Clone Twitter (EMSI) 🐦⚙️

> Fullstack éducatif : Frontend React + TypeScript et Backend Node.js/Express + TypeScript. Démo fonctionnelle d’un réseau social léger (posts texte/images, likes, retweets, follow, profils). 🚀

## Présentation 📚
ProjetJS illustre une architecture moderne fullstack pour des besoins pédagogiques : authentification JWT, création/affichage de posts, interactions sociales et séparation frontend/backend. 🧩

## Fonctionnalités principales ✨
- 🔐 Authentification (inscription / connexion / JWT)
- 📝 Publication de tweets : texte, image optionnelle, bloc code, sondage
- 🧾 Fil d’actualité personnalisé (posts des personnes suivies)
- ➕/➖ Follow / unfollow
- ❤️ Likes, 🔁 retweets, 💬 commentaires
- 👤 Profils utilisateurs (avatar, bio, liste de posts)
- #️⃣ Hashtags, @️⃣ mentions
- 🔔 Notifications temps réel (Socket.IO) — optionnel
- 🌴 Mode « vacances » (désactivation notifications)
- 🎵 Intégration Spotify (partage musique) — optionnel
- 💻 Partage de snippet code avec coloration syntaxique

## Technologies 🛠️
- Frontend : React 18, React Router, Axios ⚛️
- Backend : Node.js, Express, JWT 🔐
- DB : MySQL (configurable selon besoin) 🗄️

## Structure du dépôt 📂
ProjetJS/
- backend/ — serveur Express (controllers, routes, services, middlewares, models, types)
- frontend/ — application React (components, pages, services, contexts, hooks, types)
- README.md, LICENSE

Arborescence (extrait)
```
ProjetJS/
├─ backend/
│  ├─ src/
│  ├─ .env.example
│  └─ package.json
├─ frontend/
│  ├─ src/
│  ├─ .env.example
│  └─ package.json
└─ README.md
```

## Installation & Lancement (développement) ⚙️

1. Cloner le dépôt
```bash
git clone https://github.com/MEHDImp4/ProjetJS.git
cd ProjetJS
```

2. Backend
```bash
cd backend
npm install
# Linux/macOS
cp .env.example .env
# Windows PowerShell
copy .env.example .env
# remplir backend/.env
npm run dev
```

3. Frontend
```bash
cd frontend
npm install
cp .env.example .env     # ou `copy .env.example .env` sous PowerShell
# remplir frontend/.env
npm start
```

Accès :
- Frontend : http://localhost:3000 🖥️
- Backend : http://localhost:5000 (modifiable via .env) 🔁

## Scripts utiles 🧩
Backend (dans backend/)
- npm run dev — démarre en dev (ts-node / nodemon) 🛠️
- npm run build — compile TypeScript 📦
- npm start — start production 🚀
- npm run lint — ESLint ✅
- npm run format — Prettier 🎨

Frontend (dans frontend/)
- npm start — dev 🏃
- npm run build — build production 📦
- npm test — tests ✅
- npm run lint / npm run format 🧹

## Configuration des variables d’environnement 🔑

backend/.env (exemple)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=mysql://user:pass@host:port/dbname
JWT_SECRET=your_jwt_secret
```

frontend/.env (exemple)
```env
REACT_APP_API_URL=http://localhost:5000
```

## Tests & build 🧪
- Frontend : cd frontend && npm test
- Build production :
	- Frontend : cd frontend && npm run build
	- Backend : cd backend && npm run build

## Design UI/UX — EMSISPHERE 🎨
Objectif : clone Twitter adapté EMSI (étudiants, profs, admins)
- Palette : primaire vert EMSI (#006837), accent orange pour alertes, thèmes light/dark 🌗
- Layout : 3 colonnes (sidebar gauche, feed central, widgets droite) 🧭
- Composants clés : Sidebar, Composer (texte/image/sondage/code), TweetCard, Rightbar (recherche, tendances, suggestions) 🧩
- Spécificités scolaires : badges (🎓 étudiant, 👨‍🏫 prof, 🛡️ admin, ⚙️ BDE), filtrage « Pour vous » / « Ma Classe », affichage de code (PrismJS/Highlight.js) 💡

Backlog priorisé 🔜 :
1. Thème global + typographie
2. Layout responsive 3→2→1 colonnes
3. Routes et Sidebar de base
4. Composer (UI d’abord)
5. TweetCard (UI puis API)
6. Rightbar (mock → API)
7. Tabs « Pour vous » / « Ma Classe »

## Contribution 🤝
- Copier .env.example dans chaque dossier et remplir les variables.
- Respecter TypeScript partout, organiser la logique métier dans services/, routes dans controllers/, validations/middlewares séparés.
- Voir README.md racine pour conventions et workflows (install, lint, format).

## Licence 📜
MIT — voir fichier LICENSE.

--- 
Pour toute précision sur une section (API, modèles, endpoints, contrats TypeScript), indiquer la partie à détailler. ✉️
