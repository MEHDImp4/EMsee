# Copilot Instructions for ProjetJS (EMSISPHERE)

## Project Context
"EMSISPHERE" is a Twitter-like social network for EMSI students and staff.
- **Stack**: React 18 (Frontend), Node.js/Express (Backend), MySQL (Database).
- **Language**: TypeScript (Strict mode) for both ends.

## Architecture & Code Organization

### Backend (`backend/`)
- **Pattern**: Controller-Service-Layered architecture.
- **Directory Structure**:
  - `src/controllers/`: Handle HTTP requests, validate input, send responses. **No business logic here.**
  - `src/services/`: Implement core business logic and database interactions.
  - `src/routes/`: Define API endpoints and map them to controllers.
  - `src/middlewares/`: Authentication (JWT), error handling, request validation.
  - `src/models/` & `src/types/`: TypeScript interfaces and database models.
- **Key Principles**:
  - Keep controllers "thin".
  - Centralize error handling.

### Frontend (`frontend/`)
- **Directory Structure**:
  - `src/components/`: Reusable UI elements (e.g., `TweetCard`, `Sidebar`, `Composer`).
  - `src/pages/`: Full page views mapped to routes.
  - `src/services/`: Axios instances and API call functions.
  - `src/contexts/`: Global state (AuthContext, ThemeContext).
  - `src/hooks/`: Custom hooks for logic reuse.
- **Design System**:
  - **Colors**: Primary EMSI Green (`#006837`), Accent Orange.
  - **Layout**: 3-column responsive (Sidebar, Feed, Widgets).
  - **Features**: Code highlighting (PrismJS/Highlight.js), Polls, Media support.

## Development Workflow
1. **Environment**:
   - Ensure `.env` exists in both `backend/` and `frontend/` (copied from `.env.example`).
   - Backend runs on port 5000, Frontend on port 3000.
2. **Commands**:
   - `npm run dev`: Start development server (backend).
   - `npm start`: Start React app (frontend).
   - `npm run build`: Compile TypeScript/build for production.
   - `npm run lint` / `npm run format`: Ensure code quality.

## Coding Conventions
- **TypeScript**: Use explicit types for all props, state, and API responses. Avoid `any`.
- **API Integration**:
  - Define types for all API requests and responses in a shared or dedicated types file.
  - Handle loading and error states explicitly in UI components.
- **Styling**: Follow the established pattern (CSS Modules or standard CSS) to maintain the EMSI theme.
- **Comments**: Document complex logic, especially in `services/`.

## Specific Features to Keep in Mind
- **User Roles**: Student (🎓), Professor (👨‍🏫), Admin (🛡️), BDE (⚙️).
- **Feed**: "For You" vs "My Class" filtering.
- **Code Snippets**: Special rendering for code blocks in posts.
