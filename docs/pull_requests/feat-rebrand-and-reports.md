# Pull Request Summary: feat(shared): rebrand to Ratan Rathi & Co. and add reports engine

## Overview

This PR implements the rebranding of the application from "AssetsAlly" to "Ratan Rathi & Co." across all platforms (Web, Mobile, and API). It also introduces a new "Reports Engine" module in the web dashboard and applies several functional enhancements and UI polishes.

## Technical Changes

### Rebranding

- **Global Constants**: Updated `packages/shared/src/constants/index.ts` with the new application name.
- **Logos**: Added `client-logo.png` to `apps/web/public` and `apps/mobile/assets`.
- **Web UI**: Updated `apps/web/src/app/layout.tsx`, `apps/web/src/components/layout/dashboard-layout.tsx`, and `apps/web/src/app/login/page.tsx` with the new name and logo.
- **Mobile UI**: Updated `apps/mobile/app.json`, `apps/mobile/app/_layout.tsx`, and `apps/mobile/app/(tabs)/_layout.tsx` for branding parity.

### New Features

- **Reports Engine**: Created `apps/web/src/app/dashboard/reports/page.tsx` offering a modern, parameters-driven reporting interface for asset verification summaries.
- **Location Depth**: Adjusted maximum location depth from 5 to 4 in `packages/shared/src/constants/index.ts`.
- **Database**: Updated `packages/database/prisma/seed.ts` to reflect the new company branding in the initial data.

### Mobile Enhancements

- **Safe Area Support**: Applied `SafeAreaView` and padding adjustments across mobile screens (`index.tsx`, `_layout.tsx`) to prevent UI overlap with device notches.
- **Dashboard UI**: Removed redundant QR scanning options from the auditor dashboard as requested.
- **API**: Hardened `apps/mobile/lib/api.ts` error handling for session expiration.

## Verification

- **Build**: Successfully ran `pnpm turbo build` across all packages.
- **Linting**: Fixed Prettier and ESLint errors in `apps/mobile` and `apps/web`.
- **Tests**:
  - Updated `apps/web/src/app/login/page.spec.tsx` branding assertions.
  - Added comprehensive unit tests for the Reports Engine in `apps/web/src/app/dashboard/reports/page.spec.tsx`.
  - Total tests passed: 9 tests across 3 suites in the web package.

## Next Steps

- Review and merge into `main`.
- Deploy the web application to staging for client review.
- Trigger mobile build for internal testing.
