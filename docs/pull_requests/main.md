# PR: fix(web): improve navigation active state and auth error reporting

## Overview
This PR addresses UI navigation issues and enhances user feedback during authentication. It also resolves numerous linting and formatting inconsistencies across the web and API applications.

## Technical Changes
- **Navigation Logic (`apps/web/src/components/layout/dashboard-layout.tsx`)**:
  - Implemented prefix-based path matching for active state detection. This ensures that sub-routes (like specific inventory item pages) keep their parent navigation item highlighted.
- **API Error Handling (`apps/web/src/lib/api.ts`)**:
  - Refined the `401 Unauthorized` interceptor to prevent redirect loops on the login page itself.
  - Added specific error messaging for login failures ("Invalid email or password").
- **Navigation Config (`apps/web/src/lib/nav-config.ts`)**:
  - Corrected the Audit Schedule base route to `/dashboard/audit-schedule` to match development intentions.
- **Code Quality & Maintenance**:
  - Resolved 60+ linting warnings and errors across `apps/api` and `apps/web`.
  - Standardized formatting (Prettier) and import ordering to maintain codebase consistency.

## Verification
- **Automated Tests**: Ran `pnpm turbo lint test --concurrency 4`.
  - **API**: 35/35 passed (including auth and QR generation logic).
  - **Web**: 9/9 passed (Inventory, Reports, and Login pages).
  - **Linting**: All packages now pass linting checks cleanly.
- **Manual Verification**: Confirmed that sub-navigation routes correctly highlight parent icons in the dashboard.
