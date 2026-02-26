# PR: fix(qr-tags): resolve 404 on qr-generator and prisma type errors

## Overview
This PR addresses several critical issues in the AssetsAlly platform relating to the QR management workflow. It fixes a routing 404 error in the web application and resolves TypeScript errors in the API service caused by an out-of-sync Prisma client.

## Technical Changes

### Web App (`apps/web`)
- **Renamed Directory**: `app/dashboard/qr-tags` -> `app/dashboard/qr-generator` to align with the navigation configuration.
- **UI Updates**: Updated page titles and descriptions in the QR Generator page to match the new route name.

### API (`apps/api`)
- **Prisma Synchronization**: Regenerated the Prisma Client types using `prisma generate`. This resolved `TS2353` errors in `qr-tags.service.ts` where `linkedItemId` and `linkedItem` were incorrectly flagged as unknown properties.

### Formatting (`global`)
- **Code Consistency**: Applied project-wide formatting via `pnpm format` to resolve Prettier/ESLint discrepancies discovered during the verification phase.

## Verification
- **Build Status**: `pnpm turbo build` verified successfully for all packages.
- **Linting**: 0 errors found across the workspace (excluding known mobile project warnings).
- **Testing**: Vitest suites for API and Web passed successfully.

## Verification Proof
- `pnpm turbo build` passed at 2026-02-26 09:30 AM local time.
- `src/health/health.controller.spec.ts` (API) passed with 2 tests.
