# Copilot Instructions — ProjetJS

Purpose: give an AI coding agent exactly the repository knowledge needed to be productive.

Architecture (big picture)
- Frontend: `frontend/` — Vite + React app. Entrypoints: `frontend/src/main.jsx` and `frontend/src/App.jsx` (routing). UI split into `frontend/src/components/` and `frontend/src/pages/`.
- i18n: translations live in `frontend/public/locales/{en,fr}/translation.json` and are wired by `frontend/src/i18n.js`.
- Backend & DB: `backend/` and `database/` exist but are not integrated; treat backend changes as outside-scope unless given API contracts.

Developer workflows & concrete commands
- Typical dev flow (from repo root):
  - `cd frontend`
  - `npm install`
  - `npm run dev`  # starts Vite dev server with HMR
- Build: `cd frontend && npm run build`
- Lint/format: run whatever scripts exist in `frontend/package.json` — do not add global tooling without PR discussion.

Project-specific conventions (follow these precisely)
- Use `.jsx` for React components. Keep file naming consistent with existing components.
- Keep component-local CSS: component styles live next to components (e.g., `components/css/Hero.css`) and pages under `pages/css/`.
- No global state manager observed — prefer local React hooks/contexts; follow patterns in existing pages.
- Always add UI strings to `public/locales/*/translation.json` and reference them via i18n (do not hardcode visible text).

Key files to inspect when working on features
- Routing and page structure: `frontend/src/App.jsx`
- App bootstrap: `frontend/src/main.jsx`
- i18n init: `frontend/src/i18n.js` and `frontend/public/locales/*`
- Example pages: `frontend/src/pages/{Landing,Login,Register,About,Contact}.jsx`

Integration guidance
- If you add API calls, centralize them in `frontend/src/api/` (create that folder) and document expected endpoints in PR description.
- Static assets: use `frontend/public/` for images and locales.

When to open issues / ask for guidance
- If a backend contract is required (response shape, pagination, auth), request an API spec before implementing.
- For dependency upgrades or repo-wide tooling changes, open an issue first and outline migration steps.

Examples (concrete, copyable patterns)
- Add a new page:
  - Create `frontend/src/pages/NewPage.jsx` and `frontend/src/pages/css/NewPage.css`.
  - Add route in `frontend/src/App.jsx`.
  - Add translation keys to `public/locales/en/translation.json` and `public/locales/fr/translation.json`.
- Add an API helper:
  - Create `frontend/src/api/resource.js` with exported functions `getResource`, `createResource`, etc.
  - Use `fetch`/`axios` from components; wrap calls in `useEffect` or event handlers.

Don'ts (explicit)
- Don't change `backend/` or `database/` structure without owner approval.
- Don't convert CSS architecture or add a global CSS framework without PR discussion.

If anything here is unclear, tell me what extra details you want (example responses for API endpoints, specific lint rules, or preferred testing setup) and I will update this file.

-- End of Copilot guidance
