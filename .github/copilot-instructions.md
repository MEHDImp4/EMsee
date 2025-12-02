# Copilot Instructions for ProjetJS

## Project Overview
- **ProjetJS** is a fullstack Twitter clone with a React/TypeScript frontend and a Node.js/Express/TypeScript backend.
- The frontend and backend are in separate folders: `frontend/` and `backend/`.
- The app supports user authentication, posting tweets (with optional images), following/unfollowing, likes, retweets, and user profiles.

## Architecture & Data Flow
- **Frontend** (`frontend/src/`):
  - Uses React 18, React Router, and Axios for API calls.
  - Key folders: `components/` (with `common/` and `layout/`), `pages/`, `contexts/`, `hooks/`, `services/` (API logic), `types/`, `utils/`.
  - State management is handled via React Contexts and custom hooks.
  - API endpoints are configured via `REACT_APP_API_URL` in `.env`.
- **Backend** (`backend/src/`):
  - Uses Express.js, TypeScript, and JWT for authentication.
  - Key folders: `controllers/` (route logic), `middlewares/` (auth, validation), `models/` (data models), `routes/`, `services/` (business logic), `types/`, `utils/`.
  - Environment variables are set in `.env` (see `.env.example`).

## Developer Workflows
- **Install dependencies:**
  - `cd frontend && npm install`
  - `cd backend && npm install`
- **Run in development:**
  - Frontend: `npm start` (or `npm run dev`)
  - Backend: `npm run dev`
- **Build for production:**
  - Frontend: `npm run build`
  - Backend: `npm run build`
- **Lint/Format:**
  - `npm run lint` and `npm run format` in both frontend and backend
- **Testing:**
  - Frontend: `npm test`
  - Backend: (add tests if present)

## Project Conventions
- **TypeScript everywhere**: All code is in TypeScript, types are defined in `types/` folders.
- **API communication**: Use Axios in frontend, endpoints are defined in `services/`.
- **Component structure**: Prefer splitting into `common/` (reusable) and `layout/` (structural) components.
- **Environment config**: Always copy `.env.example` to `.env` and fill required values.
- **Backend structure**: Keep business logic in `services/`, route logic in `controllers/`, and validation/auth in `middlewares/`.

## Integration Points
- **Frontend <-> Backend**: Communicate via REST API, base URL from `.env`.
- **Authentication**: JWT-based, handled in backend, token stored in frontend (usually localStorage or context).
- **Real-time features**: If implemented, use WebSocket/Socket.IO (see bonus features in README).

## Examples
- To add a new API call: create a function in `frontend/src/services/`, use Axios, and type responses.
- To add a new backend route: define in `backend/src/routes/`, implement logic in `controllers/`, and business logic in `services/`.

## References
- See `README.md` for more details on structure, scripts, and environment variables.
- Example environment files: `frontend/.env.example`, `backend/.env.example`.

---
For any unclear conventions or missing documentation, consult the `README.md` or ask for clarification.