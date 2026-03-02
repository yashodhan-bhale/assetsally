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

## Phase 9: Audit Schedule Enhancements (Completed)

- [x] Backend: Remove auditor same-day assignment restriction in `AuditScheduleService`
- [x] Sidebar layout: Reduce content-to-sidebar gap across all audit views
- [x] Calendar View: Compress location items and remove auditor names
- [x] Calendar View: Limit display to 3 schedules + "x more" note
- [x] Auditors View: Remove Workload Heatmap
- [x] Auditors View Sidebar: Add scrollbar and group locations by date-range
- [x] Auditors View Sidebar: Open pre-filled modal on clicking assignment
- [x] Locations View: Filter for leaf-level locations only
- [x] Locations View Sidebar: Change Edit icon to Pencil
- [x] Locations View Sidebar: Enable full pre-filling of existing schedule data
- [x] App Core: Remove "Inventory" from side navigation

## Phase 10: Test Health Check (Completed)

- [x] Fix failing Web Inventory tests (data-testid & auth mocking)
- [x] Add API unit tests for `AuthService` and `InventoryService`
- [x] Refine Inventory Page UI with mono fonts and right alignment
- [x] Optimize API tests with `isolate: false`
- [x] Verify full project build/test stability
