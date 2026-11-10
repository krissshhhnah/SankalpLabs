# DEVELOPMENT GUIDE

## 1. Environment Setup

Copy `.env.example` to `.env`:

```env
PORT=4000
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-jwt-key-change-in-production"
WEBSOCKET_URL="ws://localhost:4000"
STORAGE_PROVIDER="local" # 'local' or 's3'
```

---

## 2. Installation & Scripts

```bash
# Install dependencies across all packages and apps
npm install

# Run database migrations / prisma sync
npm run db:push

# Seed database with sample data
npm run db:seed

# Start development servers (frontend + backend)
npm run dev

# Run unit tests
npm test

# Run type check
npm run typecheck
```
