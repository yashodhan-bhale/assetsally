# PR: fix(ci): resolve build errors and test runner configuration

## Overview
This pull request addresses several critical build and infrastructure issues that were preventing the development environment and CI from running smoothly. The primary focus was on resolving module resolution errors, fixing the API test runner, and cleaning up linting/formatting issues in the newly unified web application.

## Technical Changes
- **API (`apps/api`)**:
    - Added `unplugin-swc` as a dev dependency.
    - Updated `vitest.config.ts` to use SWC for faster and more reliable TypeScript compilation in tests.
- **Web (`apps/web`)**:
    - Unified `admin` and `client` into a single `web` application.
    - Fixed ESLint `import/order` violations across multiple components (`role-guard.tsx`, `admin-stats.tsx`, `client-stats.tsx`).
    - Standardized formatting with Prettier to resolve build-time linting errors.
- **Database (`packages/database`)**:
    - Regenerated the Prisma client to resolve `ERR_MODULE_NOT_FOUND` issues when starting the API.
- **CI/Build**:
    - Verified full workspace stability using `turbo lint build test --concurrency 1`.

## Verification
Full verification suite passed locally:
- **Lint**: All packages consistent.
- **Build**: Successful production builds for all apps and packages.
- **Test**: Vitest suites for API and Web passed successfully.

```bash
Tasks:    13 successful, 13 total
Time:    6m32.223s 
```
