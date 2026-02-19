# PR: Feature Release - Authentication & Dashboard

## Title
`feat(app): implement dual-tab auth and dashboard shell`

## Overview
This PR introduces the core authentication system and the main dashboard application shell for AssetsAlly. It implements a dual-tab login for Administrators and Clients, ensuring role-based access control from the start. Additionally, it establishes the responsive dashboard layout with navigation logic.

## Technical Changes

### Backend (`@assetsally/api`, `@assetsally/database`)
- **Database Exports**: Fixed `ERR_MODULE_NOT_FOUND` by updating `packages/database/package.json` to correctly export the Prisma client (`./client`).
- **Auth Service**: Validated logic for `appType` based authentication.

### Frontend (`apps/web`)
- **Dependencies**: Added `framer-motion`, `@tanstack/react-table`, `clsx`, `tailwind-merge`.
- **Login Page**: Implemented `src/app/login/page.tsx` with Admin/Client tabs.
- **Dashboard Layout**: Created `src/components/layout/dashboard-layout.tsx` for responsive sidebar/header.
- **Navigation**: Implemented `src/lib/nav-config.ts` for role-based menu filtering.
- **Data Tables**: Added reusable `DataTable` component.
- **New Pages**:
    - `src/app/dashboard/page.tsx` (Overview)
    - `src/app/dashboard/inventory/page.tsx` (Asset List)
    - `src/app/dashboard/locations/page.tsx` (Flat Location View)

## Verification
**Status**: PASSED

- **Command**: `pnpm turbo lint build test`
- **Results**:
    - Linting: Passed.
    - Build: All packages built successfully.
    - Tests: All tests passed (including updated `login/page.spec.tsx`).

## Screenshots
Refer to `walkthrough.md` in the artifacts for visual proof.
