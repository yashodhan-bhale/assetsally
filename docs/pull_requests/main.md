# Pull Request Summary: fix(web/ui): resolve typescript inference errors and align react 19 types

## Overview
This PR addresses several critical TypeScript and build stability issues across the `@assetsally/web` and `@assetsally/ui` packages. The primary goal was to resolve "Cannot find namespace 'JSX'" errors and align React types across the monorepo following dependencies updates.

## Technical Changes
- **Web App**: 
  - Added explicit `React.ReactNode` return types to all core pages and layouts.
  - Ensured correct `React` imports for type definitions.
  - Fixed Prettier and ESLint formatting issues workspace-wide.
- **UI Package**: 
  - Updated `package.json` to use React 19 types to match the mobile environment.
  - Aligned peer dependencies to ensure workspace consistency.
- **Mobile app**: 
  - Fixed linting and formatting issues.

## Verification Proof
Full workspace verification passed with `--concurrency 1`:
- **Linting**: Passed for all packages.
- **Build**: Successfully built `@assetsally/web`, `@assetsally/api`, `@assetsally/ui`, and `@assetsally/database`.
- **Tests**:
  - Web: 5 tests passed (Inventory and Login pages).
  - API: 2 tests passed (Health controller).
  - Mobile: Verified stable with fix for formatting.
