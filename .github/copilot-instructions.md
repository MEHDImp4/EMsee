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
jest.mock('../middlewares/authMiddleware', () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 1 };
    next();
  }
}));

// 3. Import app AFTER mocks
const { app } = require('../app');

// 4. Write tests with supertest
describe('POST /api/posts', () => {
  it('should create post with authenticated user', async () => {
    mockPrisma.post.create.mockResolvedValue({ id: 1, content: 'Test' });
    
    const res = await request(app)
      .post('/api/posts')
      .send({ content: 'Test post' });
    
    expect(res.statusCode).toBe(201);
    expect(mockPrisma.post.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Object) })
    );
  });
});
```

**Key testing rules:**
- Mock Prisma to avoid DB dependency (`jest.mock('@prisma/client')`)
- Always call `jest.clearAllMocks()` in `afterEach()`
- Test pagination with `limit` and `page` query params
- Verify auth-protected routes return 401 when mocking auth is disabled
- Check Zod validation errors return 400 with `{ error, details, message }` structure

**Frontend Testing:**
- Currently minimal — prefer integration tests on backend API layer
- If adding frontend tests, focus on custom hooks logic (`useFeed`, `useCommentPage`)

**Don't test:**
- Trivial getters/setters
- Third-party library behavior (Prisma, Express middleware)
- UI snapshot tests (no testing library configured)

## Critical Conventions (Non-Negotiable)

### Frontend File Structure
- **Components:** `.jsx` extension, co-located CSS in `frontend/src/components/css/` or `frontend/src/pages/css/`
- **Example:** `CommentCard.jsx` uses `frontend/src/components/css/CommentCard.css`
- **Custom hooks:** Extract stateful logic to `frontend/src/hooks/use*.js` (see `useCommentPage.js`, `useFeed.js`)

### i18n (Internationalization)
- **NEVER hardcode user-facing strings** — all text goes in `frontend/public/locales/{en,fr,es}/translation.json`
- Access via `useTranslation()` hook: `const { t } = useTranslation(); t('key.path')`
- Config: `frontend/src/i18n.js` (i18next with HTTP backend, language detector)
- **Add new keys to ALL THREE locales** (en, fr, es) or i18n-audit will fail

### API Services Pattern
- **All HTTP calls** go through `frontend/src/services/` modules (never inline fetch in components)
- **Base API client:** `frontend/src/services/api.js` exports `{ get, post, put, patch, delete }`
  - Auto-adds `Authorization: Bearer <token>` header
  - Handles 401 by clearing localStorage and reloading
  - Supports FormData (removes Content-Type for multipart)
- **Resource services:** `auth.service.js`, `post.service.js`, `comment.service.js`, `user.service.js`
- **Example:** To add notifications API, create `frontend/src/services/notification.service.js`:
  ```js
  import api from './api';
  export const getNotifications = () => api.get('/notifications');
  export const markAsRead = (id) => api.patch(`/notifications/${id}/read`);
  ```

### State Management
- **NO Redux/Zustand** — use React Context + local hooks
- **Existing contexts:** `AuthContext` (user, login/logout), `SocketContext` (socket instance), `ModalContext` (global modals), `ThemeContext`
- For local state, prefer custom hooks (see `frontend/src/hooks/`)

### Backend Validation & Error Handling
- **Validation:** Zod schemas in `backend/src/validators/` (see `auth.validator.js`, `post.schema.js`)
- **Middleware:** `validate.middleware.js` parses Zod errors to `{ error, details: [{field, message}], message }`
- **Controllers:** Wrap async logic with `asyncHandler` middleware (auto-catches errors)
- **Example route:**
  ```js
  router.post('/posts', authenticateToken, validate(createPostSchema), postController.createPost);
  ```

### Socket.IO Events
- **Backend:** Events emitted via `getIo().emit('event', data)` (see `socketService.js`)
- **Frontend:** Listen in components via `const { socket } = useSocket()` then `socket.on('event', handler)`
- **Authentication:** Socket handshake requires `{ auth: { token } }` — handled by `SocketContext`

## Key Integration Points

### Prisma Schema Relationships
- **User** → Posts, Comments, Likes, Reposts, Follows (self-referential `Follow` model)
- **Post** → Comments (nested), Likes, Reposts, `replyPermission` enum
- **Comment** → Self-referential replies (`parent`/`replies`), CommentLikes, CommentReposts, CommentSaves

### Frontend → Backend Auth Flow
1. User logs in via `AuthContext.login()` → calls `AuthService.login()`
2. Backend returns `{ token, user }` → stored in localStorage
3. `api.js` auto-includes token in all requests
4. Protected routes use `<ProtectedRoute>` (checks `isAuthenticated` from `AuthContext`)

### Role-Based Features
- Roles: `student`, `professor`, `admin` (defined in `backend/src/validators/auth.validator.js`)
- **Email validation:** Students must use `@emsi-edu.ma`, professors/admins `@emsi.ma`
- **Student-specific fields:** `filiere`, `year`, `studentClass` (required during registration)
- **Professor-specific:** `subjects` array (min 1 subject required)

## Common Tasks

### Add a new page
1. Create `frontend/src/pages/NewPage.jsx` and `frontend/src/pages/css/NewPage.css`
2. Add route in `frontend/src/App.jsx` under appropriate layout (PublicLayout or DashboardLayout)
3. Add i18n keys to `frontend/public/locales/{en,fr,es}/translation.json`

### Add a backend endpoint
1. Define Zod schema in `backend/src/validators/` (if needed)
2. Add service logic in `backend/src/services/` or directly in controller
3. Create controller function in `backend/src/controllers/` (use `asyncHandler`)
4. Register route in `backend/src/routes/` with auth + validation middleware
5. Document with JSDoc for Swagger (see `backend/src/routes/post.routes.js`)

### Add realtime notification
1. **Backend:** Emit event in controller: `getIo().emit('newNotification', { userId, data })`
2. **Frontend:** Listen in component:
   ```jsx
   const { socket } = useSocket();
   useEffect(() => {
     if (!socket) return;
     const handler = (data) => { /* update state */ };
     socket.on('newNotification', handler);
     return () => socket.off('newNotification', handler);
   }, [socket]);
   ```

## Environment Setup

**Backend .env required variables:**
```ini
DATABASE_URL="mysql://user:pass@localhost:3306/db_name"
JWT_SECRET=your_secret_here
PORT=5000
```
**Frontend .env:**
```ini
VITE_API_URL=http://localhost:5000/api
```

## Known Patterns & Anti-Patterns

**✅ DO:**
- Extract pagination logic to custom hooks (`useFeed`, `useExplore`)
- Use lazy loading for pages (`React.lazy()` in `App.jsx`)
- Validate all inputs with Zod on backend before DB operations
- Use Prisma `include` for eager loading relations (avoid N+1 queries)

**❌ DON'T:**
- Hardcode strings visible to users (use i18n)
- Call API directly in components (use service modules)
- Store sensitive data in frontend state (JWTs in localStorage only)
- Skip Zod validation on backend routes (security risk)

## Debugging Tips

- **Frontend API errors:** Check Network tab, verify token in localStorage
- **Backend crashes:** Check for missing `JWT_SECRET` in `.env`
- **Prisma issues:** Run `npm run db:generate` after schema changes
- **Socket not connecting:** Verify `BASE_URL` in `SocketContext.jsx` matches backend origin
- **i18n missing keys:** Run `node scripts/i18n-audit.js` for detailed report

## Questions?

If unclear on: 
- **Pagination patterns** → inspect `backend/src/services/post.service.js` and `frontend/src/hooks/useFeed.js`
- **File uploads** → see `multer` config (not yet fully implemented)
- **Testing patterns** → check `backend/src/tests/post.test.js` for Jest+Supertest examples
