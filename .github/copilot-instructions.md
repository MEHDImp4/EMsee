# Copilot Instructions — ProjetJS (EMsee)

Purpose: Essential knowledge for AI agents to be immediately productive in this social media platform codebase.

## Architecture Overview

**Monorepo structure:** `frontend/` (React 19 + Vite) and `backend/` (Node/Express + Prisma + Socket.IO)
- Frontend is primary workspace for UI; backend provides REST API + realtime events
- MySQL database accessed via Prisma ORM (`backend/prisma/schema.prisma`)
- Authentication: JWT tokens stored in localStorage, verified via `authMiddleware.js`
- Realtime: Socket.IO with JWT auth (handshake token verification in `backend/src/services/socketService.js`)

**Context providers chain** (in `frontend/src/App.jsx`):
```jsx
ThemeProvider → AuthProvider → SocketProvider → ModalProvider → Router
```
Socket connection auto-initializes when user is authenticated.

## Development Workflow

**Start dev servers:**
```bash
# Terminal 1 - Backend (port 5000)
cd backend && npm install && npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend && npm install && npm run dev
```

**Database operations (run from backend/):**
```bash
npm run db:migrate    # Apply migrations (wrapper around prisma migrate dev)
npm run db:generate   # Generate Prisma Client
npm run db:studio     # Open Prisma Studio GUI
```

**Testing:**
```bash
cd backend && npm test  # Jest tests (see backend/src/tests/)
```

**i18n audit:** Run `node scripts/i18n-audit.js` to check for missing keys/placeholder mismatches across `en/fr/es` locales.

## Testing Strategy

**Backend Testing** (Jest + Supertest in `backend/src/tests/`)

**What to test:**
- **API endpoints:** Request/response contracts, auth requirements, validation
- **Service layer logic:** Business rules, data transformations, edge cases
- **Integration tests:** Multi-step flows (create → like → repost)

**Test pattern (from `post.test.js`):**
```js
// 1. Mock Prisma BEFORE importing app
const mockPrisma = {
  post: { findMany: jest.fn(), create: jest.fn() },
  user: { findUnique: jest.fn() }
};
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

// 2. Mock auth middleware to inject test user
## Copilot Instructions — ProjetJS (EMsee)

Purpose: essential, actionable guidance for AI coding agents working on this monorepo.

Highlights
- Monorepo: `frontend/` (React + Vite) and `backend/` (Node + Express + Prisma + Socket.IO).
- DB: Prisma schema at `backend/prisma/schema.prisma` (MySQL by default).
- Auth: JWT stored client-side; middleware at `backend/src/middlewares/authMiddleware.js`.
- Realtime: Socket.IO; server emits via `getIo().emit(...)` and the client uses `SocketContext`.

Quick dev commands
- Backend dev: `cd backend && npm install && npm run dev` (nodemon).
- Frontend dev: `cd frontend && npm install && npm run dev` (Vite on 5173).
- Prisma: `cd backend && npx prisma migrate dev` then `npx prisma generate`.
- Tests: `cd backend && npm test` (Jest + Supertest).

Key patterns agents must follow
- i18n: Never hardcode user-facing strings. Add keys to all three locales under `frontend/public/locales/{en,fr,es}/translation.json`. Run `node scripts/i18n-audit.js` to validate.
- API calls: Use service modules in `frontend/src/services/` (see `api.js`). `api.js` attaches `Authorization: Bearer <token>` and handles 401 centrally.
- State: No Redux — prefer React Context + custom hooks in `frontend/src/hooks/`.
- Validation: Backend uses Zod validators in `backend/src/validators/`. Use `validate.middleware.js` to surface `{ error, details, message }`.

Testing specifics (must follow)
- Mock Prisma in backend tests to avoid DB access. Example pattern (before importing app):

```js
const mockPrisma = { post: { findMany: jest.fn(), create: jest.fn() }, user: { findUnique: jest.fn() } };
jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn(() => mockPrisma) }));
// mock auth middleware to inject req.user
jest.mock('../middlewares/authMiddleware', () => ({ verifyToken: (req,res,next)=>{ req.user={id:1}; next(); }}));
const { app } = require('../app');
```

- Call `jest.clearAllMocks()` in `afterEach()`.
- Test pagination with `limit`/`page` and verify Zod 400 responses.

Integration points & important files
- Backend server: [backend/src/server.js](backend/src/server.js)
- Prisma schema: [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
- Frontend bootstrap: [frontend/src/main.jsx](frontend/src/main.jsx) and [frontend/src/App.jsx](frontend/src/App.jsx)
- Base API client: [frontend/src/services/api.js](frontend/src/services/api.js)
- Socket helpers: backend `socketService.js`, frontend `SocketContext` in `frontend/src/context/`.

Conventions to respect when editing code
- Preserve i18n keys across `en/fr/es` when adding UI text.
- Add backend Zod validators alongside new routes in `backend/src/validators/`.
- Place new service logic in `backend/src/services/` and controller entry in `backend/src/controllers/`, register route in `backend/src/routes/`.
- For uploads, follow `backend/config/multer.js` configuration.

Environment
- Backend expects `.env` with `DATABASE_URL` and `JWT_SECRET` (see `backend/README.md`).
- Frontend uses `VITE_API_URL` pointing to the API base.

If something is unclear, ask for the missing env values, desired behavior, or which locale translations to add. After changes, run `cd backend && npm test` and `cd frontend && npm run dev` to smoke-test.

---
Request: review this brief guide and tell me if you want additional examples (route template, validator snippet, or a test harness) to include.
- **All HTTP calls** go through `frontend/src/services/` modules (never inline fetch in components)
