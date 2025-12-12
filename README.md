# EMsee

[![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white)](https://react.dev) 
[![Vite](https://img.shields.io/badge/-Vite-646cff?logo=vite&logoColor=white)](https://vitejs.dev) 
[![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org) 
[![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white)](https://expressjs.com) 
[![Prisma](https://img.shields.io/badge/-Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io) 
[![Socket.IO](https://img.shields.io/badge/-Socket.IO-010101?logo=socket.io&logoColor=white)](https://socket.io) 
[![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) 
[![MySQL](https://img.shields.io/badge/-MySQL-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com)

EMsee est un projet web full‑stack de type « réseau social » léger (posts, commentaires, profils, notifications). L'objectif est de fournir une plateforme moderne de partage et de communication en temps réel.

**Résumé court**

EMsee combine un front‑end React (Vite) et un back‑end Node/Express avec Prisma pour la persistance. Il permet la création et l'interaction autour de contenus (posts, commentaires) avec des notifications et du temps réel.

**Technologies principales**

- **Frontend:** React + Vite, JSX, CSS
- **Backend:** Node.js, Express
- **Base de données & ORM:** Prisma (schema dans `backend/prisma/schema.prisma`)
- **Realtime:** Socket.IO (ou service socket intégré)
- **Langage:** JavaScript

**Public cible & contexte**

Ce README vise deux lecteurs :
- vos camarades de projet — instructions claires pour démarrer et contribuer
- la prof — rapport synthétique expliquant le but, l'architecture, les choix techniques et les pistes d'amélioration

**Fonctionnalités clés**

- Création, lecture, mise à jour et suppression des posts
- Commentaires et interactions (likes, réponses)
- Profils utilisateurs et authentification
- Notifications et événements temps réel
- Pages publiques: landing, explore, profil, post, feed

**Structure du dépôt (vue rapide)**

- `frontend/` – application React (Vite)
  - points d'entrée: `frontend/src/main.jsx`, `frontend/src/App.jsx`
  - pages: `frontend/src/pages/`
  - composants: `frontend/src/components/`
  - services API: `frontend/src/services/` (ex: `api.js`, `post.service.js`)
- `backend/` – API Node/Express
  - entrée: `backend/src/server.js`
  - routes: `backend/src/routes/`
  - controllers: `backend/src/controllers/`
  - Prisma: `backend/prisma/schema.prisma`

Consultez le code pour les détails (exemples : `frontend/src/App.jsx`, `backend/src/server.js`).

**Installation et démarrage (développement)**

Prerequis: Node.js (>=16), npm, une base MySQL (ou autre SGBD supporté par Prisma).

1) Installer les dépendances frontend et backend

```bash
cd frontend
npm install

cd ../backend
npm install
```

2) Configurer la base de données (fichier d'environnement)

Créez un fichier `.env` dans `backend/` (ou adaptez) contenant la variable `DATABASE_URL` pointant vers votre instance PostgreSQL. Exemple :

```bash
DATABASE_URL="mysql://user:password@localhost:3306/nom_de_la_db"
```

3) Générer/Exécuter les migrations Prisma

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

4) Lancer les serveurs en développement

Terminal 1 — backend

```bash
cd backend
npm run dev
```

Terminal 2 — frontend

```bash
cd frontend
npm run dev
```

Après ces étapes, ouvrez l'URL fournie par Vite (généralement `http://localhost:5173`).

**API & points d'entrée importants**

- `backend/src/server.js` — serveur Express et configuration globale
- Routes principales: `backend/src/routes/post.routes.js`, `backend/src/routes/comment.routes.js`, `backend/src/routes/auth.routes.js`
- Contrôleurs: `backend/src/controllers/` gèrent la logique métier
- Prisma schema: `backend/prisma/schema.prisma` définit les modèles (User, Post, Comment, etc.)

Si vous devez ajouter un nouvel endpoint frontal, ajoutez le helper dans `frontend/src/services/`.

**Guide de contribution rapide**

- Branche feature: `git checkout -b feat/ma-fonctionnalite`
- Petites tâches: commit atomique avec message clair
- Tests & lint: respecter les conventions du dépôt
- Ouvrir une Pull Request avec description et captures d'écran

**Rapport synthétique (pour la prof)**

Objectif: concevoir et implémenter une application web collaborative permettant le partage de contenu et la communication en temps réel. Le projet illustre l'application d'un stack moderne JS (React + Node + Prisma) et couvre les notions suivantes:

- Conception d'une API REST organisée selon controllers/routes
- Persistance via Prisma et migrations gérées
- Authentification et protection des routes
- Intégration temps réel (notifications) via sockets
- UI réactive avec React et architecture par composants

Choix techniques et justifications:

- React + Vite: démarrage rapide, HMR, compatibilité moderne
- Prisma: ORM type-safe, migrations simples et productivité accrue
- Express: minimaliste et adapté aux API REST

Sécurité et qualité:

- Authentification JWT pour sécuriser les endpoints privés
- Validation d'entrées côté serveur
- Middleware d'authentification dans `backend/src/middlewares/authMiddleware.js`

Limites et pistes d'amélioration:

- Ajouter tests automatisés (unitaires & e2e)
- Déployer CI/CD et staging
- Support multi-tenant / montée en charge (caching, pagination)
- Améliorer accessibilité et internationalisation (i18n déjà partiellement en place)

**Fichiers utiles à consulter**

- Point d'entrée frontend: [frontend/src/main.jsx](frontend/src/main.jsx)
- Routing et bootstrapping: [frontend/src/App.jsx](frontend/src/App.jsx)
- Services API: [frontend/src/services/api.js](frontend/src/services/api.js)
- Serveur backend: [backend/src/server.js](backend/src/server.js)
- Schema Prisma: [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

**Licence & crédits**

Indiquez ici la licence choisie (ex: MIT) et les crédits pour les librairies principales.

---

Si vous voulez, je peux :
- ajouter des badges CI/coverage
- générer un CHANGELOG.md et un modèle de Pull Request

Bon travail à toute l'équipe !