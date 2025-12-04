# Copilot Instructions for ProjetJS

## Project Context
"ProjetJS" is a Twitter-like social network project for EMSI.
- **Current Status**: Frontend-focused development (React 19 + Vite). Backend is planned but currently empty.
- **Goal**: Educational fullstack project (Social features, Auth, Feed).

## Tech Stack & Dependencies
- **Frontend**: 
  - React 19 (Vite)
  - JavaScript (JSX) - *Note: Project is currently JS, not TS.*
  - `react-router-dom` v7
  - `lucide-react` (Icons)
  - `framer-motion` (Animations)
- **Backend (Planned)**: Node.js, Express, MySQL.

## Architecture & Code Organization

### Frontend (`frontend/`)
- **Entry Point**: `src/main.jsx` mounts `App.jsx`.
- **Routing**: `src/App.jsx` handles `BrowserRouter` and routes (`/`, `/login`, `/register`).
- **Directory Structure**:
  - `src/components/`: Reusable UI elements (e.g., `Header.jsx`, `Footer.jsx`).
  - `src/pages/`: Full page views (e.g., `Landing.jsx`, `Login.jsx`).
  - `src/assets/`: Static assets.
- **Styling**:
  - **Global Variables**: Defined in `src/index.css` (e.g., `--primary`, `--bg-soft`).
  - **Theming**: Dark/Light mode supported via `data-theme` attribute on `<html>`.
  - **Pattern**: Mix of global CSS classes (e.g., `.btn`, `.container`) and inline styles for specific layout tweaks.

### Backend (`backend/`)
- *Currently empty/under construction.*
- **Target Architecture**: Controller-Service-Layered pattern (Node.js/Express).

## Development Workflow
- **Frontend**:
  - Run: `npm run dev` (in `frontend/` directory).
  - Build: `npm run build`.
  - Lint: `npm run lint`.

## Coding Conventions
- **Language**: JavaScript (JSX). Use `.jsx` extension for components.
- **Components**: Functional components with Hooks (`useState`, `useEffect`).
- **Icons**: Always use `lucide-react` for icons (e.g., `import { Menu, X } from 'lucide-react'`).
- **Styling**: 
  - Use CSS variables for colors to ensure theme compatibility.
  - Example: `background: 'var(--card-bg)', color: 'var(--text-main)'`.
- **Routing**: Use `Link` from `react-router-dom` for internal navigation.

## Key Features to Maintain
- **Responsive Design**: Mobile-first approach (visible in `Header.jsx` media queries).
- **Theme Awareness**: Components should respect system color preference (handled in `App.jsx`).
