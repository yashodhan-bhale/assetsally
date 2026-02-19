# PR: Feature Release - Authentication & Dashboard

## Title
`feat(web): implement dual-tab login and dashboard shell with location table fixes`

## Overview
This PR introduces the core authentication system and the main dashboard application shell for AssetsAlly. It implements a dual-tab login for Administrators and Clients, ensuring role-based access control. Critical stability fixes were applied to the database package and environment setup to ensure a reliable development baseline.

## Technical Changes

### Backend (`@assetsally/database`, `@assetsally/api`)
- **CommonJS Standardization**: Converted `@assetsally/database` to CommonJS and standardized its `tsconfig.json` to resolve ESM resolution errors (`ERR_MODULE_NOT_FOUND`) during API startup.
- **Maintenance Script**: Added `scripts/check-db.ts` for standalone database user and connection verification.
- **Docker Integration**: Verified and started `postgres`, `redis`, and `minio` containers.

### Frontend (`apps/web`)
- **Dependencies**: Added `framer-motion`, `@tanstack/react-table`, `clsx`, `tailwind-merge`.
- **Login Page**: Implemented `src/app/login/page.tsx` with Admin/Client tabs.
- **Dashboard Layout**: Created `src/components/layout/dashboard-layout.tsx` for responsive sidebar/header.
- **Navigation**: Implemented `src/lib/nav-config.ts` for role-based menu filtering.
- **Data Views**:
    - `src/app/dashboard/inventory/page.tsx` (Asset List with custom columns)
    - `src/app/dashboard/locations/page.tsx` (Flat Table View for leaf-level locations)

## Verification
**Status**: PASSED (22/22 Tasks)

- **Command**: `pnpm turbo lint build test --concurrency 1`
- **Validation**:
    - Dual-tab login flow verified via browser subagent.
    - Database seeding and password hashing verified.
    - Production build (`next build`) passed without errors.

## Screenshots & Media
Refer to the [walkthrough.md](file:///C:/Users/Ecstatech/.gemini/antigravity/brain/03c9185c-e18e-4acd-8320-0273fe9f8c25/walkthrough.md) for recording of the login flow and dashboard screenshots.
