# PR: fix(api): resolve server start issues and stabilize test suite

## Overview

This PR addresses several critical issues that were preventing the API and Web servers from starting, along with stabilizing the unit test suite for the QR generation processing.

## Technical Changes

### API & Database

- **Prisma Integration**: Regenerated the Prisma client to resolve missing property errors on `PrismaService`.
- **Connectivity**: Updated `DATABASE_URL` to `127.0.0.1` for Windows local development reliability.
- **Dependency Management**: Refactored `ImportsModule` and `ImportsService` to use local `PrismaService` and corrected import ordering.
- **Port Conflict Resolution**: Systematically cleared port `3000` and `3001` from legacy processes.

### Testing Suite

- **Vitest Configuration**: Enabled `isolate: true` in `vitest.config.ts` to prevent mock state pollution between test files.
- **Mock Improvements**: Enhanced `QrGenerationProcessor` mocks to handle stream events and promise rejections correctly.
- **Users Service**: Fixed `bcrypt` mock verification by ensuring clean module state.

### Web Application

- **Aesthetics & Performance**: Replaced standard `<img>` tags with Next.js `<Image />` components in `LoginPage` and `DashboardLayout` to resolve ESLint warnings and optimize LCP.

### Mobile Application

- **Linting Cleanup**: Removed unused imports (`router`, `TouchableOpacity`) and moved inline styles to `StyleSheet` in `InventoryScreen`.

## Verification Results

### Turbo Pipeline Execution

`pnpm turbo lint build test --concurrency 1 --force`

| Package              | Status    |
| -------------------- | --------- |
| @assetsally/api      | ✅ Passed |
| @assetsally/web      | ✅ Passed |
| @assetsally/mobile   | ✅ Passed |
| @assetsally/database | ✅ Passed |
| @assetsally/shared   | ✅ Passed |
| @assetsally/ui       | ✅ Passed |

### Test Details

- **Total Tests Run**: 33 (24 API, 9 Web)
- **Results**: All tests passed.
- **Environment**: Local Node.js environment with isolated Vitest/Jest contexts.

---

Validated by Antigravity AI
