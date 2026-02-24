# PR: feat(all): implement user management and stabilize mobile offline sync

## Overview
This pull request introduces a full-stack User Management feature and critical stability fixes for the mobile application's offline-first synchronization engine.

## Technical Changes
### Web & API (User Management)
- **API**: Created `UsersModule`, `UsersService`, and `UsersController` to handle CRUD operations for system users.
- **API**: Implemented password hashing using `bcrypt` and secured endpoints with `JwtAuthGuard`.
- **Web**: Added a new `/dashboard/users` page with a dedicated UI for managing users, including filtering by roles and a modal for adding new users.
- **Database**: Updated Prisma schema to optimize `assignedLocation` relationships.

### Mobile (Offline-First Stability)
- **Sync Engine**: Refactored the `SyncEngine` to handle concurrent sync operations and network state changes more robustly.
- **WatermelonDB**: Optimized database initialization and schema migrations.
- **UI**: Added a `SyncStatusBar` to provide real-time feedback on synchronization status.

## Verification
### Automated Tests
- **API**: Generated and passed unit tests for `UsersService` and `UsersController` using Vitest (13 tests total).
- **Web**: Verified dashboard components with existing spec files (9 tests total).
- **Turbo Suite**: Successfully ran `pnpm turbo lint build test --concurrency 1 --force` across the entire monorepo.

### Local Verification
- Verified user creation and deletion flow in the Admin Dashboard.
- Confirmed mobile app bundling and sync behavior on Expo SDK 54.
