# AssetsAlly - Tech Stack Proposal

> No vendor lock-in | Self-hosted on VPS | Scalable to 500K+ items

---

## Recommended Stack

### Backend API

| Component      | Technology                          | Rationale                                                                                                                              |
| -------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Runtime**    | Node.js 20 LTS                      | Large ecosystem, excellent for I/O-heavy workloads, shared language with frontend                                                      |
| **Framework**  | NestJS                              | Enterprise-grade, modular architecture, built-in support for guards/interceptors (perfect for our permission system), TypeScript-first |
| **ORM**        | Prisma                              | Type-safe queries, excellent migration system, works great with PostgreSQL                                                             |
| **API Style**  | REST                                | Simpler for mobile offline sync, easier caching, well-suited for CRUD operations                                                       |
| **Validation** | class-validator + class-transformer | NestJS standard, DTO validation                                                                                                        |

**Why NestJS over Express/Fastify directly?**

- Built-in modular architecture suits our multi-app backend
- Guards system is perfect for location+department permission checks
- Excellent TypeScript support
- Mature ecosystem for enterprise apps

---

### Database

| Component              | Technology       | Rationale                                                                                                                   |
| ---------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Primary DB**         | PostgreSQL 16    | Robust, feature-rich, excellent for hierarchical data (ltree extension for location paths), JSON support for dynamic fields |
| **Location Hierarchy** | PostgreSQL ltree | Native extension for materialized path queries, very efficient for "find all descendants"                                   |
| **Caching**            | Redis            | Session storage, rate limiting, optional query caching                                                                      |

**Why PostgreSQL over MySQL/MariaDB?**

- `ltree` extension is purpose-built for our location hierarchy queries
- Better JSON/JSONB support for dynamic custom fields
- More robust for complex queries at scale

---

### Web Frontend (Unified Dashboard)

| Component            | Technology               | Rationale                                              |
| -------------------- | ------------------------ | ------------------------------------------------------ |
| **Framework**        | Next.js 14 (App Router)  | React-based, SSR for performance, excellent DX         |
| **State Management** | TanStack Query           | Server state management, caching, optimistic updates   |
| **UI Library**       | shadcn/ui + Tailwind CSS | Customizable components, consistent design, accessible |
| **Forms**            | React Hook Form + Zod    | Type-safe forms with validation                        |
| **Tables/Data**      | TanStack Table           | Powerful data tables for inventory lists               |
| **PDF Generation**   | React-PDF or jsPDF       | Client-side PDF generation                             |

**Architectural Change**: The separate Admin and Client apps have been unified into a single `apps/web` codebase to simplify deployment and shared states.

---

### Mobile App (Auditor)

| Component             | Technology                       | Rationale                                                                                  |
| --------------------- | -------------------------------- | ------------------------------------------------------------------------------------------ |
| **Framework**         | React Native + Expo              | Cross-platform (iOS + Android), shared knowledge with web team, Expo simplifies builds     |
| **Navigation**        | Expo Router                      | File-based routing, consistent with Next.js patterns                                       |
| **Local DB**          | WatermelonDB                     | Built for offline-first, lazy-loading, excellent sync capabilities, scales to 10K+ records |
| **Camera**            | expo-camera                      | Photo capture with metadata                                                                |
| **Location**          | expo-location                    | Geo-tagging                                                                                |
| **Image Compression** | expo-image-manipulator           | Resize/compress to 500KB before upload                                                     |
| **Background Sync**   | Custom queue + expo-task-manager | Priority sync (text before images)                                                         |

**Why WatermelonDB over SQLite directly?**

- Built-in sync primitives
- Lazy-loading (important for 1000+ items per location)
- Observable queries for reactive UI
- Handles complex relationships well

---

### File Storage

| Component          | Technology | Rationale                                     |
| ------------------ | ---------- | --------------------------------------------- |
| **Object Storage** | MinIO      | S3-compatible, self-hosted, no vendor lock-in |
| **CDN/Proxy**      | Nginx      | Serve static files, reverse proxy             |

---

### Infrastructure

| Component            | Technology              | Rationale                                            |
| -------------------- | ----------------------- | ---------------------------------------------------- |
| **Containerization** | Docker + Docker Compose | Consistent environments, easy deployment             |
| **Reverse Proxy**    | Nginx                   | SSL termination, load balancing, static file serving |
| **Process Manager**  | PM2 (if not Docker)     | Node.js process management                           |
| **SSL**              | Let's Encrypt + Certbot | Free SSL certificates                                |

---

### Authentication

| Component            | Technology                                    | Rationale                                 |
| -------------------- | --------------------------------------------- | ----------------------------------------- |
| **Strategy**         | JWT (Access + Refresh tokens)                 | Stateless, works well with mobile offline |
| **Password Hashing** | bcrypt                                        | Industry standard                         |
| **Token Storage**    | HTTP-only cookies (web), SecureStore (mobile) | Secure storage per platform               |

---

### Development & Quality

| Component           | Technology                                 | Rationale                             |
| ------------------- | ------------------------------------------ | ------------------------------------- |
| **Monorepo**        | Turborepo                                  | Fast builds, shared packages, caching |
| **Package Manager** | pnpm                                       | Fast, disk-efficient                  |
| **Testing**         | Vitest + React Testing Library + Supertest | Fast unit/integration tests           |
| **E2E Testing**     | Playwright (web), Detox (mobile)           | Cross-browser/device testing          |
| **Linting**         | ESLint + Prettier                          | Code consistency                      |
| **Type Safety**     | TypeScript (strict mode)                   | End-to-end type safety                |

---

## Monorepo Structure (Proposed)

```
assetsally/
├── apps/
│   ├── api/                 # NestJS backend
│   ├── web/                 # Next.js unified web app (Admin + Client)
│   └── mobile/              # React Native + Expo auditor app
├── packages/
│   ├── shared/              # Shared types, constants, utilities
│   ├── ui/                  # Shared UI components (web only)
│   ├── database/            # Prisma schema, migrations
│   └── eslint-config/       # Shared ESLint config
├── docs/
│   └── planning/            # Planning documents
├── docker/                  # Docker configurations
└── .agent/                  # AI agent workflows
```

---

## Alternative Considerations

### If You Prefer Different Choices:

| Instead Of   | Alternative                | Trade-off                                                                                    |
| ------------ | -------------------------- | -------------------------------------------------------------------------------------------- |
| NestJS       | Fastify + custom structure | Faster but less structure, more boilerplate for permissions                                  |
| React Native | Flutter                    | Better native performance but Dart instead of TypeScript, different language for mobile team |
| WatermelonDB | SQLite + custom sync       | More control but significantly more work for sync logic                                      |
| PostgreSQL   | MySQL 8                    | Works but loses ltree extension, need custom path queries                                    |
| Turborepo    | Nx                         | More features but steeper learning curve                                                     |

---

## Questions for You

1. **Are you comfortable with this stack?** Any technologies you'd prefer to swap?

2. **Team familiarity**: Is your team already familiar with React/TypeScript, or would a different stack (e.g., Python/Django) be preferable?

3. **Mobile platforms**: Do you need **both iOS and Android**, or just one initially?

4. **Hosting**: Do you have a VPS provider in mind (DigitalOcean, Hetzner, Linode, etc.)?
