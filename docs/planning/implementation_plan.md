# AssetsAlly Implementation Plan

## Overview

Building an asset verification ecosystem with 2 primary apps:

- **Web Dashboard** - Unified management (users, data, reports) and client-facing roles.
- **Auditor Mobile App** - Offline-first field verification.

> [!IMPORTANT]
> This is a comprehensive base project. Implementation is modular - each phase produces a working increment.

---

## Phase 1: Project Scaffolding & Monorepo Setup

### Objective

Set up the Turborepo monorepo structure with all apps and shared packages.

---

#### [NEW] Root Configuration Files

| File                  | Purpose                   |
| --------------------- | ------------------------- |
| `package.json`        | Root workspace config     |
| `turbo.json`          | Turborepo pipeline config |
| `pnpm-workspace.yaml` | pnpm workspace definition |
| `.gitignore`          | Git ignore patterns       |
| `.nvmrc`              | Node version (20 LTS)     |
| `tsconfig.base.json`  | Shared TypeScript config  |

---

#### [NEW] Shared Packages (`packages/`)

##### `packages/shared/`

- Common types, constants, enums
- Shared utilities (date formatting, validation helpers)
- API response types

##### `packages/database/`

- Prisma schema
- Database migrations
- Seed scripts

##### `packages/ui/`

- Shared React components (web only)
- Design tokens
- Component exports

##### `packages/eslint-config/`

- Shared ESLint configuration

---

#### [NEW] App Scaffolds (`apps/`)

##### `apps/api/`

- NestJS application scaffold
- Basic health check endpoint
- Docker configuration

##### `apps/web/`

- Next.js 14 App Router scaffold
- Unified layout for Admin, Staff, and Client roles
- Authentication integration

##### `apps/mobile/`

- Expo + React Native scaffold
- Basic navigation structure

---

#### [NEW] Docker Configuration (`docker/`)

| File                             | Purpose                 |
| -------------------------------- | ----------------------- |
| `docker/docker-compose.yml`      | Local development stack |
| `docker/docker-compose.prod.yml` | Production stack        |
| `docker/api.Dockerfile`          | API container           |
| `docker/admin.Dockerfile`        | Admin app container     |
| `docker/client.Dockerfile`       | Client app container    |
| `docker/nginx/nginx.conf`        | Reverse proxy config    |

---

### Verification - Phase 1

1. **All apps start successfully:**

```bash
pnpm dev
# Verify: API on :3001, Admin on :3000, Client on :3002
```

2. **Mobile app starts:**

```bash
cd apps/mobile && npx expo start
```

3. **Docker stack runs:**

```bash
docker-compose -f docker/docker-compose.yml up -d
```

---

## Phase 2: Database Schema & Migrations

### Objective

Design and implement the complete PostgreSQL schema with Prisma.

> [!NOTE]
> Uses `ltree` extension for efficient location hierarchy queries.

---

#### [NEW] [schema.prisma](file:///d:/PROJECTS/assetsally/packages/database/prisma/schema.prisma)

**Core Entities:**

| Entity                  | Key Fields                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `User`                  | id, email, passwordHash, appType, role, status, assignedLocationId, departmentIds, allDepartmentsAccess |
| `Location`              | id, code, name, path (ltree), parentId, depth, levelLabel, isLocked, scheduledDate                      |
| `Department`            | id, code, name                                                                                          |
| `InventoryItem`         | id, code, name, locationId, departmentId, customFields (JSON), qrTagId                                  |
| `QRCodeTag`             | id, code, status (UNASSIGNED/ASSIGNED/RETIRED), linkedItemId                                            |
| `AuditReport`           | id, locationId, auditorId, status (DRAFT/SUBMITTED/APPROVED/REJECTED), submittedAt                      |
| `AuditFinding`          | id, reportId, itemId, status, condition, notes, geoLat, geoLng, customFieldValues (JSON)                |
| `AuditPhoto`            | id, findingId, storagePath, originalFilename, sizeBytes                                                 |
| `ReportComment`         | id, reportId, itemId, authorId, content, createdAt                                                      |
| `CustomFieldDefinition` | id, name, type, categoryId, required, options (JSON)                                                    |
| `AssetCategory`         | id, name, code                                                                                          |
| `ClientRole`            | id, name, clientId, locationScope, departmentScope, permissions (JSON)                                  |
| `LocationSchedule`      | id, locationId, scheduledDate, isOverrideLocked                                                         |
| `SyncQueue`             | id, userId, entityType, entityId, action, priority, status, payload (JSON)                              |

---

#### [NEW] [seed.ts](file:///d:/PROJECTS/assetsally/packages/database/prisma/seed.ts)

- Seed departments lookup table
- Seed sample location hierarchy (3 levels)
- Seed admin user
- Seed sample inventory items

---

### Verification - Phase 2

1. **Migrations run successfully:**

```bash
cd packages/database && pnpm prisma migrate dev
```

2. **Seed data inserted:**

```bash
pnpm prisma db seed
```

3. **Prisma Studio shows data:**

```bash
pnpm prisma studio
```

---

## Phase 3: Authentication & Authorization

### Objective

Implement JWT auth with role-based access control for all three apps.

> [!IMPORTANT]
> **SKILL CREATION REQUIRED**: Create "Auth & Permissions Patterns" skill before this phase.

---

#### [MODIFY] [apps/api/](file:///d:/PROJECTS/assetsally/apps/api/)

##### Auth Module (`src/auth/`)

- `auth.controller.ts` - Login, refresh, logout endpoints
- `auth.service.ts` - JWT generation, validation, password hashing
- `jwt.strategy.ts` - Passport JWT strategy
- `refresh.strategy.ts` - Refresh token handling
- `guards/jwt-auth.guard.ts` - Protect routes
- `guards/app-type.guard.ts` - Restrict by app type
- `guards/roles.guard.ts` - Role-based access

##### Users Module (`src/users/`)

- `users.controller.ts` - CRUD for all user types
- `users.service.ts` - User management logic
- `dto/` - Create/Update DTOs

##### Permission Logic (`src/common/`)

- `decorators/roles.decorator.ts` - @Roles() decorator
- `decorators/app-type.decorator.ts` - @AppType() decorator
- `guards/location-access.guard.ts` - Check location hierarchy access
- `guards/department-access.guard.ts` - Check department access
- `interceptors/permission-filter.interceptor.ts` - Filter query results by permissions

---

### Verification - Phase 3

1. **Auth endpoints work:**

```bash
# Test login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'

# Should return: { accessToken, refreshToken }
```

2. **Protected routes require auth:**

```bash
curl http://localhost:3001/users
# Should return: 401 Unauthorized

curl http://localhost:3001/users \
  -H "Authorization: Bearer <token>"
# Should return: user list
```

3. **Unit tests pass:**

```bash
cd apps/api && pnpm test
```

---

## Phase 4: Core API - Locations, Inventory, Imports

### Objective

Implement core domain logic for locations, inventory, and Excel imports.

---

#### [MODIFY] [apps/api/](file:///d:/PROJECTS/assetsally/apps/api/)

##### Locations Module (`src/locations/`)

- `locations.controller.ts` - CRUD + tree operations
- `locations.service.ts` - Location management with ltree queries
- `dto/` - Location DTOs

##### Departments Module (`src/departments/`)

- `departments.controller.ts` - CRUD
- `departments.service.ts` - Simple lookup management

##### Inventory Module (`src/inventory/`)

- `inventory.controller.ts` - CRUD with permission filtering
- `inventory.service.ts` - Inventory with location+department scoping
- `dto/` - Inventory DTOs

##### Imports Module (`src/imports/`)

- `imports.controller.ts` - File upload endpoints
- `imports.service.ts` - Parse and validate Excel files
- `parsers/locations.parser.ts` - Location Excel parsing
- `parsers/inventory.parser.ts` - Inventory Excel parsing
- `validators/` - Field validation logic

##### QR Codes Module (`src/qr-codes/`)

- `qr-codes.controller.ts` - Generate batch, lookup, bind/unbind
- `qr-codes.service.ts` - QR code lifecycle management

##### Custom Fields Module (`src/custom-fields/`)

- `custom-fields.controller.ts` - Define fields per category
- `custom-fields.service.ts` - Field definition management

---

### Verification - Phase 4

1. **Location hierarchy queries work:**

```bash
# Get all descendants of a location
curl http://localhost:3001/locations/:id/descendants
```

2. **Permission filtering applied:**

```bash
# User with Transport dept should only see Transport items
curl http://localhost:3001/inventory \
  -H "Authorization: Bearer <transport_user_token>"
```

3. **Excel import works:**

```bash
# Upload test Excel file
curl -X POST http://localhost:3001/imports/locations \
  -H "Authorization: Bearer <admin_token>" \
  -F "file=@test-locations.xlsx"
```

4. **Integration tests pass:**

```bash
cd apps/api && pnpm test:e2e
```

---

## Phase 5: Admin Web App

### Objective

Build the Admin web application for complete system management.

---

#### [MODIFY] [apps/admin/](file:///d:/PROJECTS/assetsally/apps/admin/)

##### Layout & Navigation

- `app/layout.tsx` - Root layout with sidebar
- `app/(dashboard)/layout.tsx` - Dashboard layout
- `components/sidebar/` - Navigation sidebar
- `components/header/` - Top header with user menu

##### Authentication Pages

- `app/login/page.tsx` - Login form
- `app/logout/page.tsx` - Logout handler

##### Dashboard

- `app/(dashboard)/page.tsx` - Overview stats
- `components/dashboard/stats-cards.tsx` - Key metrics

##### Users Management

- `app/(dashboard)/users/` - User CRUD pages
  - `page.tsx` - User list with filters
  - `[id]/page.tsx` - User details/edit
  - `new/page.tsx` - Create user form

##### Locations Management

- `app/(dashboard)/locations/` - Location CRUD
  - `page.tsx` - Tree view of locations
  - `[id]/page.tsx` - Location details
  - `schedule/page.tsx` - Location scheduling

##### Inventory Management

- `app/(dashboard)/inventory/` - Inventory views
  - `page.tsx` - Searchable inventory table
  - `[id]/page.tsx` - Item details

##### Imports

- `app/(dashboard)/imports/` - Excel import UI
  - `page.tsx` - Upload interface
  - `history/page.tsx` - Import history

##### QR Codes

- `app/(dashboard)/qr-codes/` - QR management
  - `page.tsx` - Generate batches, view status
  - `export/page.tsx` - Export for printing

##### Reports & Audits

- `app/(dashboard)/audits/` - Audit oversight
  - `page.tsx` - All audit reports
  - `[id]/page.tsx` - Review, approve/reject
- `app/(dashboard)/reports/` - Generate PDF reports

##### Settings

- `app/(dashboard)/settings/` - System configuration
  - `departments/page.tsx` - Manage departments
  - `custom-fields/page.tsx` - Define custom fields
  - `client-roles/page.tsx` - Configure client roles

---

### Verification - Phase 5

1. **Manual testing:**
   - Navigate to http://localhost:3000
   - Login as admin
   - Test all CRUD operations
   - Import sample Excel file
   - Approve/reject an audit report

2. **Component tests:**

```bash
cd apps/admin && pnpm test
```

---

## Phase 6: Auditor Mobile App

### Objective

Build offline-first mobile app for auditors.

> [!IMPORTANT]  
> **SKILL CREATION REQUIRED**: Create "Offline-First Mobile" skill before this phase.

---

#### [MODIFY] [apps/mobile/](file:///d:/PROJECTS/assetsally/apps/mobile/)

##### Database Setup

- `src/db/schema.ts` - WatermelonDB models
- `src/db/sync.ts` - Sync logic with server
- `src/db/queue.ts` - Priority sync queue (text before images)

##### Authentication

- `app/(auth)/login.tsx` - Login screen
- `src/services/auth.ts` - Token storage (SecureStore)

##### Main Navigation

- `app/(tabs)/_layout.tsx` - Bottom tab navigator
- `app/(tabs)/locations.tsx` - Assigned locations list
- `app/(tabs)/profile.tsx` - User profile

##### Location & Audit Flow

- `app/location/[id]/index.tsx` - Location details
- `app/location/[id]/audit.tsx` - Start/continue audit
- `app/location/[id]/items.tsx` - Item list for location
- `app/location/[id]/submit.tsx` - Submit completed audit

##### Item Verification

- `app/item/[id]/verify.tsx` - Verification form
  - Core fields (status, condition, notes)
  - Dynamic custom fields
  - Photo capture
  - Geo-tagging

##### QR Scanning

- `app/scan.tsx` - QR scanner
- `src/components/qr-scanner.tsx` - Camera-based scanner
- `app/scan/result.tsx` - Show item or bind flow

##### Sync & Offline

- `src/services/sync.service.ts` - Background sync
- `src/services/image-queue.ts` - Image upload queue
- `src/hooks/useOfflineStatus.ts` - Connectivity hook

---

### Verification - Phase 6

1. **Run on device/simulator:**

```bash
cd apps/mobile && npx expo start
# Scan QR code with Expo Go, or run on emulator
```

2. **Test offline mode:**
   - Disable network on device
   - Verify items, take photos
   - Re-enable network
   - Confirm data syncs (text first, then images)

3. **Manual testing checklist:**
   - [ ] Login persists after app restart
   - [ ] Assigned locations appear
   - [ ] Can verify items offline
   - [ ] Photos compress to <500KB
   - [ ] Geo-tag captured
   - [ ] QR scan works for assigned/unassigned codes
   - [ ] Sync queue prioritizes text over images

---

## Phase 7: Client Web App

### Objective

Build client-facing web app with role-based views.

---

#### [MODIFY] [apps/client/](file:///d:/PROJECTS/assetsally/apps/client/)

##### Layout & Navigation

- `app/layout.tsx` - Root layout
- `app/(dashboard)/layout.tsx` - Dashboard layout

##### Authentication

- `app/login/page.tsx` - Login
- Permissioned by client role

##### Dashboard

- `app/(dashboard)/page.tsx` - Overview for their scope

##### Inventory Views

- `app/(dashboard)/inventory/page.tsx` - Filtered by their permissions
- `app/(dashboard)/inventory/[id]/page.tsx` - Item details (view-only unless action enabled)

##### Audit Reports

- `app/(dashboard)/reports/page.tsx` - View reports for their scope
- `app/(dashboard)/reports/[id]/page.tsx` - Report details
  - Flag/remark actions (if enabled for their role)
  - Approve/reject (if enabled for their role)

##### PDF Downloads

- `app/(dashboard)/downloads/page.tsx` - Generate and download reports

---

### Verification - Phase 7

1. **Role-based access test:**
   - Login with different client roles
   - Verify correct location/department filtering
   - Confirm enabled/disabled actions match role permissions

2. **Component tests:**

```bash
cd apps/client && pnpm test
```

---

## Phase 8: Production Deployment & Polish

### Objective

Production-ready deployment with documentation.

---

#### [NEW] Deployment Configuration

| File                             | Purpose                                        |
| -------------------------------- | ---------------------------------------------- |
| `docker/docker-compose.prod.yml` | Production stack with MinIO, Redis, PostgreSQL |
| `docker/nginx/nginx.prod.conf`   | Production Nginx config with SSL               |
| `.env.example`                   | Environment variable template                  |
| `scripts/deploy.sh`              | Deployment automation                          |
| `scripts/backup.sh`              | Database backup script                         |

---

#### [NEW] Documentation

| File                    | Purpose                          |
| ----------------------- | -------------------------------- |
| `README.md`             | Project overview and quick start |
| `docs/deployment.md`    | Deployment guide                 |
| `docs/api.md`           | API documentation                |
| `docs/excel-templates/` | Sample Excel import templates    |

---

### Verification - Phase 8

1. **Production stack starts:**

```bash
docker-compose -f docker/docker-compose.prod.yml up -d
```

2. **SSL configured correctly:**

```bash
curl https://admin.yourdomain.com
# Should load without certificate errors
```

3. **Full end-to-end test:**
   - Import sample data via Admin
   - Create auditor user
   - Login on mobile, perform audit
   - Submit audit, approve in Admin
   - View results in Client app
   - Generate PDF report

---

## Summary of Skills to Create

| Phase   | Skill                       | Trigger                          |
| ------- | --------------------------- | -------------------------------- |
| Phase 3 | Auth & Permissions Patterns | Before implementing JWT + guards |
| Phase 6 | Offline-First Mobile        | Before WatermelonDB + sync queue |

---

## Estimated Timeline

| Phase   | Effort    | Dependencies          |
| ------- | --------- | --------------------- |
| Phase 1 | 2-3 days  | None                  |
| Phase 2 | 2-3 days  | Phase 1               |
| Phase 3 | 3-4 days  | Phase 2, Auth skill   |
| Phase 4 | 4-5 days  | Phase 3               |
| Phase 5 | 5-7 days  | Phase 4               |
| Phase 6 | 7-10 days | Phase 4, Mobile skill |
| Phase 7 | 3-4 days  | Phase 4               |
| Phase 8 | 2-3 days  | All                   |

**Total estimated: 4-6 weeks**

---

## User Review Required

> [!CAUTION]
> Please review and confirm:
>
> 1. Does this phase breakdown align with your priorities?
> 2. Should any phases be reordered (e.g., Mobile before Admin)?
> 3. Any missing features that should be in the base project?
