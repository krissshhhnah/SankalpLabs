# API SPECIFICATION

## 1. REST Endpoints

### Authentication
- `POST /api/auth/register` — Create account (`email`, `password`, `name`)
- `POST /api/auth/login` — Login (`email`, `password`) -> JWT Token
- `GET /api/auth/me` — Get current logged-in user profile

### Boards
- `POST /api/boards` — Create board (`name`)
- `GET /api/boards` — List user's boards
- `GET /api/boards/:id` — Get board metadata & authorization check
- `PATCH /api/boards/:id` — Update board details (`name`, `isPublic`)
- `DELETE /api/boards/:id` — Delete board (Owner only)

### Board Members & Invites
- `GET /api/boards/:id/members` — List board members
- `POST /api/boards/:id/invites` — Generate invite code link
- `POST /api/invites/join` — Join board using invite code

### File Uploads
- `POST /api/uploads` — Upload image file (multipart/form-data) -> returns `{ url, width, height }`

---

## 2. WebSocket Endpoint

- `/ws/boards/:boardId?token=<JWT>` — Real-time binary Yjs sync & awareness stream.
