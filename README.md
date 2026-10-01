# EMsee

EMsee is a full-stack social platform for sharing content and communicating in real time. The repository contains a React client, an Express API, and a PostgreSQL database, with Docker-based deployment configuration.

## Technology

- **Frontend:** React, Vite, Nginx
- **Backend:** Node.js, Express, Prisma
- **Database:** PostgreSQL
- **Live communication:** Socket.IO
- **Deployment:** Docker Compose, GitHub Actions, and GitHub Container Registry

## Run the production Compose stack

1. Create a local environment file from the example and replace its placeholder values:

   ```sh
   cp .env.production.example .env
   ```

2. Start the stack:

   ```sh
   docker compose -f docker-compose.prod.yml up -d
   ```

3. Open [http://localhost](http://localhost).

The production Compose file uses the published frontend and backend container images. Review the environment example and deployment configuration before exposing a deployment publicly.

## Local development

Requirements: Node.js and npm.

1. Install the root and service dependencies:

   ```sh
   npm run install:all
   ```

2. Configure the backend environment and start both services:

   ```sh
   npm run dev
   ```

For a local SQLite development database, use `npm run dev:local`. The root development scripts start the backend and frontend together.

## Repository layout

- `frontend/` — React application and Vite configuration
- `backend/` — Express API, Prisma schema, and database scripts
- `docker-compose.prod.yml` — production-oriented container setup
- `scripts/` — deployment helpers

## Security

The backend uses JWT authentication, Helmet, and rate limiting. Keep credentials in local environment files, use unique secrets, and terminate public traffic with HTTPS.
