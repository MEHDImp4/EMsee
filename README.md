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
- README.md, .env.example, package.json

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
