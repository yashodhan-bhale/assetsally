# PR: fix(web): add RoleGuard to dashboard layout and sync planning docs

## Title

`fix(web): add RoleGuard to dashboard layout and sync planning docs`

## Overview

This PR implements role-based access control for the web dashboard by introducing a `RoleGuard` in the main layout. It also synchronizes planning documents that track the recent offline-first mobile implementation milestones.

## Technical Changes

- **Web**: Added `RoleGuard` to `apps/web/src/app/dashboard/layout.tsx` to restrict access to `ADMIN` and `CLIENT` roles.
- **Documentation**: Synchronized `docs/pull_requests/main_sync_planning.md` which documents the technical decisions for the mobile offline-first architecture (Expo CLI patching and lazy DB initialization).
- **Compliance**: Verified build and lint stability across the monorepo after applying auto-fixes for mobile lint errors.

## Verification Result

- Full local verification run via `pnpm turbo lint build test --concurrency 1 --force` completed successfully.
- Web dashboard routes are now protected by the defined roles.
- All 13 turbo tasks (build, lint, test) passed across the workspace.
