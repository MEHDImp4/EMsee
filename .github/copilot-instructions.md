# Copilot Instructions — ProjetJS

Purpose: Give an AI coding agent the exact, actionable repo knowledge needed to be productive quickly.

Overview
- Monorepo split: `frontend/` (Vite + React) and `backend/` (Node/Express + Prisma). The frontend is the primary active workspace for UI work; backend holds API/controllers and a Prisma schema in `backend/prisma/schema.prisma`.

Quick dev commands
- Frontend: from repo root
  - `cd frontend && npm install`
  - `cd frontend && npm run dev` (Vite dev server with HMR)
- Backend: from repo root
  - `cd backend && npm install`
  - `cd backend && npm run dev` (nodemon server)
- DB / Prisma:
  - `cd backend && npx prisma migrate dev`
  - `cd backend && npx prisma generate`
  - `cd backend && npx prisma studio`

Key conventions (follow precisely)
- Use `.jsx` for React components and place component-local CSS next to components (`frontend/src/components/css/` or `frontend/src/pages/css/`).
- UI strings: add to `frontend/public/locales/*/translation.json` and use `frontend/src/i18n.js` for lookups (do not hardcode visible text).
- Centralize HTTP helpers under `frontend/src/services/` (existing files: `api.js`, `auth.service.js`, etc.). If adding new API helpers, keep them here.
- No global state library: prefer local React hooks and the existing `context/` providers (`AuthContext.jsx`, `ModalContext.jsx`, `SocketContext.jsx`).

Important files to inspect
- Frontend routing/bootstrap: `frontend/src/App.jsx`, `frontend/src/main.jsx`
- i18n: `frontend/src/i18n.js` and `frontend/public/locales/`
- Frontend services: `frontend/src/services/api.js`
- Backend entry: `backend/src/server.js` and controllers under `backend/src/controllers/`
- Prisma schema: `backend/prisma/schema.prisma`

Integration & API guidance
- Treat backend changes as out-of-scope unless given a specific API contract. If you must add frontend API calls, add a short API spec in the PR description (endpoint, method, request/response shapes).
- Realtime: sockets are managed in `backend/src/services/socketService.js` and `frontend/src/context/SocketContext.jsx` — follow the existing event names when adding listeners/emitters.

Concrete examples
- Add a page: create `frontend/src/pages/NewPage.jsx`, `frontend/src/pages/css/NewPage.css`, add a route in `frontend/src/App.jsx`, and add locale keys to `frontend/public/locales/en/translation.json` and `fr/translation.json`.
- Add API helper: export functions from `frontend/src/services/newResource.js` and consume via `useEffect` in a page or component; mock responses if backend contract is pending.

When to open issues
- Request an API spec when response shapes, pagination, or auth behavior are unclear.
- Open an issue before making repo-wide tooling changes (linters, formatters, build tools).

If something here is incomplete, tell me which area (frontend build, i18n, Prisma, or API contracts) and I'll expand the guidance.
