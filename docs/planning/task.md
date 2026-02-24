# Offline-First Architecture for Auditor Mobile App

## Phase 1: Foundation

- [x] Audit existing codebase (Prisma schema, API, mobile screens)
- [x] Write implementation plan
- [x] Get user approval on plan

## Phase 2: Database Layer

- [x] Install `@react-native-community/netinfo`
- [x] Create WatermelonDB schema (`db/schema.ts`)
- [x] Create model classes (Location, InventoryItem, AuditReport, AuditFinding, SyncMeta)
- [x] Create database initialization (`db/index.ts`)

## Phase 3: Connectivity Context

- [x] Create `ConnectivityProvider` context
- [x] Integrate into root `_layout.tsx`

## Phase 4: Sync Engine

- [x] Implement `pullData()` — fetches and seeds local DB
- [x] Implement `pushData()` — pushes dirty records to API
- [x] Create `useSync` hook

## Phase 5: API Additions

- [~] Deferred — using existing per-finding endpoint instead
- [~] Deferred — using existing per-finding endpoint instead

## Phase 6: UI Updates

- [x] Refactor `(tabs)/audits.tsx` to read from WatermelonDB
- [x] Refactor `audit/[id].tsx` to read/write from WatermelonDB
- [x] Add inventory view screen (`audit/inventory.tsx`)
- [x] Update dashboard (`(tabs)/index.tsx`) with sync status
- [x] Update profile tab with sync info
- [x] Create `SyncStatusBar` component

## Phase 7: Verification

- [x] Run all tests (API, Web, Mobile)
- [x] Manual testing on dev build
- [x] Document results in walkthrough

## Phase 8: User Management Dashboard

- [x] Create API `UsersModule`, `UsersService`, and `UsersController`
- [x] Implement password hashing and JWT protection for user routes
- [x] Create `apps/web/src/app/dashboard/users/page.tsx` with CRUD UI
- [x] Implement role-based filtering and user creation modal
- [x] Generate unit tests for Users API (Vitest)
