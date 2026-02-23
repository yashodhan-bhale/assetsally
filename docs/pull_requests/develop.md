# PR: fix(ci/web): resolve react version conflicts and bigint type errors across monorepo

## Overview

This PR resolves critical build and test failures across the monorepo caused by React version mismatches and TypeScript type-checking errors (specifically regarding `bigint` rendering in React 18). It ensures that the web application builds successfully for production while keeping the mobile application compatible with Expo SDK 54.

## Technical Changes

### Core Configuration

- **package.json**: Added `pnpm.overrides` to enforce React 18 for `@assetsally/web`, `@assetsally/ui`, and `@assetsally/shared`, while maintaining React 19 for `@assetsally/mobile`.
- **tsconfig.json**: Updated paths and configurations to ensure correct type resolution across different React versions.

### Web Application (`apps/web`)

- **Type Compatibility**: Applied `any` casts to `LucideIcon` imports across all pages (`Audits`, `Inventory`, `Reports`, `Locations`, `QR Tags`, `Login`) to prevent React 19 types from leaking into a React 18 environment.
- **BigInt Rendering**: Wrapped all count displays in `Number()` to ensure they are valid `ReactNode` children in React 18.
- **ESLint/Prettier**: Fixed import order and indentation issues in `DashboardLayout`, `LoginPage`, and `DataTable`.

### Database & Shared (`packages/`)

- **@assetsally/database**: Triggered fresh Prisma Client generation to resolve exported member conflicts.
- **@assetsally/shared**: Fixed lint warnings and export shadowing issues.

## Verification

### Automated Tests

Ran `pnpm turbo build lint test --concurrency 1 --force` with successful results:

- **@assetsally/web**: Production build successful, all vitest suites passed.
- **@assetsally/api**: Production build successful, health checks passed.
- **@assetsally/mobile**: Linting and TS check passed (`tsc --noEmit`).

### Build Execution

- **Node Version**: 20.19.4 (LTS)
- **Turbo Tasks**: 13 successful, 0 failed.
