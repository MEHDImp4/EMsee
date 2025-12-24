# EMsee

[![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/-Vite-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/-Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![GitHub Actions](https://img.shields.io/badge/-GitHub_Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)

EMsee est une plateforme sociale moderne permettant le partage de contenu et la communication en temps réel. Cette application full-stack utilise une architecture robuste et conteneurisée, prête pour la production.

## 🚀 Architecture

L'application est divisée en services conteneurisés (Docker) :

*   **Frontend** : React + Vite, servi par **Nginx** (image `ghcr.io/mehdimp4/projetjs-frontend`). Nginx gère aussi le reverse-proxy vers l'API (`/api`) et les websockets (`/socket.io`).
*   **Backend** : Node.js + Express (image `ghcr.io/mehdimp4/projetjs-backend`). Persistance via **Prisma**.
*   **Base de données** : **PostgreSQL** 15 avec optimisations de performance.
*   **Mises à jour auto** : **Watchtower** surveille le registre d'images et met à jour les conteneurs automatiquement.

## 🛠️ Installation & Développement

### Pré-requis
*   Docker & Docker Compose
*   Node.js 20+ (pour le dev local hors Docker)

### Démarrage rapide (Local avec Docker)
Le moyen le plus simple de lancer l'application est via Docker Compose.

1.  Créez un fichier `.env` à la racine (voir `.env.production.example` pour les variables).
2.  Lancez le stack :
    ```bash
    docker compose -f docker-compose.prod.yml up -d
    ```
3.  L'application est accessible sur `http://localhost:80`.

### Développement sans Docker
1.  **Backend** :
    ```bash
    cd backend
    npm install
    # Configurer .env avec DATABASE_URL
    npm run dev
    ```
2.  **Frontend** :
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## 📦 Déploiement (Production / Unraid)

Le déploiement est automatisé via **GitHub Actions** et conçu pour s'exécuter facilement sur un serveur **Unraid** (ou tout VPS Docker).

### 1. CI/CD Pipeline
À chaque `push` sur la branche `main` :
1.  GitHub Actions construit les images Docker (Backend & Frontend).
2.  Les images sont poussées sur le **GitHub Container Registry (GHCR)**.

### 2. Déploiement sur Unraid
Un script automatisé est fourni pour déployer le stack sur Unraid.

1.  Sur votre serveur, créez un dossier (ex: `/mnt/user/appdata/emsee`).
2.  Copiez-y :
    *   `docker-compose.prod.yml`
    *   Le dossier `scripts/`
    *   Un fichier `.env` (basé sur `.env.production.example`)
3.  Exécutez le script :
    ```bash
    chmod +x scripts/deploy_unraid.sh
    ./scripts/deploy_unraid.sh
    ```
    Cela va pull les images, configurer les permissions et lancer les conteneurs.

## 🔑 Variables d'Environnement

*   **Backend** : Gérées dans le fichier `.env` racine (secrets, DB creds, JWT).
*   **Frontend** : Gérées dans `frontend/.env.production` pour les variables publiques (`VITE_API_URL`).

## 🛡️ Sécurité
*   **Helmet** & **Rate Limiting** sur le backend.
*   **Nginx** configuré comme reverse proxy sécurisé.
*   Authentification **JWT**.
*   Scan de vulnérabilités via GitHub Actions (SonarCloud/CodeQL recommandés).

---
*Projet réalisé par Mehdi MP4 et l'équipe.*