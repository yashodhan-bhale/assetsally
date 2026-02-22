# AssetsAlly — Asset Verification System

A three-app ecosystem for managing and verifying physical assets across locations using QR codes, mobile auditing, and admin dashboards.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Nginx (Port 80/443)                     │
│            admin.domain   api.domain   app.domain                │
└───────┬──────────────┬───────────────┬──────────────────────────┘
        │              │               │
   ┌────▼────┐   ┌─────▼─────┐   ┌────▼────┐   ┌─────────────┐
   │  Admin  │   │  NestJS   │   │  Client │   │   Mobile    │
   │ Next.js │   │   API     │   │ Next.js │   │ Expo (RN)   │
   │  :3000  │   │  :3001    │   │  :3002  │   │  Auditor    │
   └─────────┘   └─────┬─────┘   └─────────┘   └─────────────┘
                        │
        ┌───────────────┼───────────────┐
   ┌────▼────┐   ┌──────▼──────┐   ┌───▼────┐
   │ Postgres│   │    Redis    │   │ MinIO  │
   │  :5432  │   │   :6379     │   │ :9000  │
   └─────────┘   └─────────────┘   └────────┘
```

## Tech Stack

| Layer    | Technology                           |
| -------- | ------------------------------------ |
| Backend  | NestJS + PostgreSQL + Prisma ORM     |
| Web Apps | Next.js 14 + React + Tailwind CSS    |
| Mobile   | React Native (Expo) with expo-router |
| Auth     | JWT (access + refresh tokens)        |
| Storage  | MinIO (S3-compatible)                |
| Cache    | Redis                                |
| Monorepo | pnpm workspaces                      |

## Development Requirements

### Node.js Version

**IMPORTANT**: This project requires **Node.js 20 (LTS)**.

- Higher versions (like Node 22) are currently incompatible with Expo SDK 54 and will cause `Body is unusable` crashes in the Metro bundler.
- An `.nvmrc` and strict `.npmrc` are included to enforce this.

### React Version Split Architecture

This monorepo uses a **Version Split Architecture** to maintain compatibility between Web and Mobile:

- **`apps/web`**: Uses **React 18.2.0**. This is strictly required for stability with the current UI packages.
- **`apps/mobile`**: Uses **React 19.1.0**. This is required by Expo SDK 54.

**Do not update React in the root without checking these constraints.** Version locks are enforced via root `pnpm` overrides.

## Quick Start

### Prerequisites

- Node.js 20.x (Check with `node -v`)
- pnpm 9.x
- Docker & Docker Compose

### 1. Setup

```bash
# Clone and install
pnpm install

# Start infrastructure (Postgres, Redis, MinIO)
docker compose -f docker/docker-compose.yml up -d

# Setup database
pnpm db:migrate
pnpm db:seed
```

### 2. Run Development

```bash
# Start API
pnpm --filter @assetsally/api dev          # http://localhost:3001

# Start Admin dashboard
pnpm --filter @assetsally/admin dev        # http://localhost:3000

# Start Client portal
pnpm --filter @assetsally/client dev       # http://localhost:3002

# Start Mobile (requires Expo CLI)
cd apps/mobile && npx expo start
```

### 3. Test Credentials

| User    | Email                | Password | App              |
| ------- | -------------------- | -------- | ---------------- |
| Admin   | admin@assetsally.com | admin123 | Admin (`:3000`)  |
| Client  | client@demo.com      | admin123 | Client (`:3002`) |
| Auditor | auditor@demo.com     | admin123 | Mobile           |

## Project Structure

```
assetsally/
├── apps/
│   ├── api/              # NestJS backend (27 API routes)
│   ├── admin/            # Admin dashboard (Next.js, blue theme)
│   ├── client/           # Client portal (Next.js, emerald theme)
│   └── mobile/           # Auditor app (Expo/React Native)
├── packages/
│   ├── database/         # Prisma schema (16 models) & migrations
│   ├── shared/           # Shared TypeScript types & utilities
│   ├── ui/               # Shared React component library
│   └── eslint-config/    # Shared ESLint configuration
├── docker/
│   ├── docker-compose.yml        # Dev infrastructure
│   ├── docker-compose.prod.yml   # Production (full stack + nginx)
│   ├── api.Dockerfile            # API production build
│   ├── admin.Dockerfile          # Admin production build
│   ├── client.Dockerfile         # Client production build
│   └── nginx/                    # Nginx configs (dev + prod)
└── docs/                         # Planning & architecture docs
```

## API Overview

| Module    | Routes                                     | Description                        |
| --------- | ------------------------------------------ | ---------------------------------- |
| Auth      | `POST /login`, `/logout`, `/refresh`       | JWT authentication                 |
| Locations | CRUD + `/tree`                             | Hierarchical location management   |
| Inventory | CRUD + `/import` + `/stats`                | Asset management with Excel import |
| Audits    | CRUD + `/submit` + `/review` + `/findings` | Audit report workflow              |
| QR Tags   | CRUD + `/generate` + `/assign`             | QR code lifecycle                  |
| Health    | `GET /health`                              | Readiness check                    |

Full Swagger docs: `http://localhost:3001/api/docs`

## Deployment

### Production (Docker)

```bash
# Create your .env from the template
cp .env.example .env
# Edit .env with production values (especially JWT_SECRET!)

# Build and start all services
docker compose -f docker/docker-compose.prod.yml up -d --build

# Run migrations in the container
docker exec assetsally-api-prod npx prisma migrate deploy
docker exec assetsally-api-prod npx prisma db seed
```

### Environment Variables

See [`.env.example`](.env.example) for all configuration options.

> **Production checklist:**
>
> - [ ] Set a strong `JWT_SECRET` (64+ random chars)
> - [ ] Set `DB_PASSWORD` to a secure password
> - [ ] Set `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY`
> - [ ] Place SSL certs in `docker/nginx/ssl/`
> - [ ] Update domain names in `docker/nginx/nginx.prod.conf`

## Database

```bash
pnpm db:migrate      # Run pending migrations
pnpm db:seed         # Seed sample data
pnpm db:studio       # Open Prisma Studio GUI
pnpm db:generate     # Regenerate Prisma client
```

## Documentation

- [Implementation Plan](./docs/planning/implementation_plan.md)
- [Tech Stack](./docs/planning/tech-stack.md)
- [Decision Log](./docs/planning/decisions.md)

## License

Private — All rights reserved.
