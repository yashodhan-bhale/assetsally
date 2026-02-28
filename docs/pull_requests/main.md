# PR: feat(web, mobile): separate user management and handle api health status

## Overview

This pull request implements two major improvements:

1. **User Management Separation**: The single "User Management" page has been split into three specialized pages (Staff, Auditors, Clients) with appropriate default roles and platform filters.
2. **API Health Monitoring**: Implemented real-time API reachability checks in both Web and Mobile applications. Users are now gracefully notified via a banner (Web) or status bar update (Mobile) when the API server is unreachable.

## Technical Changes

### Web Application

- **Components**:
  - Created `UserManagementTable` (`src/components/users/user-management-table.tsx`): A reusable, type-safe table for managing different user pools.
  - Updated `DashboardLayout`: Added `ApiHealthBanner` to the header to show real-time server status.
- **Routing**:
  - New pages for `/staff`, `/auditors`, and `/clients` under `dashboard/users`.
  - Implemented a redirect in the old `/users` page for backward compatibility.
- **API Client**:
  - Enhanced `ApiClient` in `src/lib/api.ts` to detect and throw specific network errors when the fetch fails due to connectivity.

### Mobile Application

- **Context**:
  - Enhanced `ConnectivityProvider` in `contexts/connectivity-context.tsx` to include an `isApiReachable` state, updated via periodic health checks.
- **UI**:
  - Updated `SyncStatusBar` component to reflect "Server Down" state when the API is unreachable.
- **Library**:
  - Exported `API_BASE` from `lib/api.ts` to allow shared usage of the base URL for health checks.

## Verification

- **Test Suite**: Fresh run of `turbo lint build test` passed across all packages.
  - **API Tests**: 24 tests passed (Health, Users, QR Tags).
  - **Web Tests**: 9 tests passed (Inventory, Reports, Login).
- **Linting**: All ESLint and Prettier warnings/errors were resolved, including missing dependency warnings in new components.
- **Manual Verification**: Verified navigation flow and API error reporting logic.

## Verification Proof

- Web Tests pass (Vitest)
- API Tests pass (Vitest)
- Linting (ESLint/Prettier) passed for `@assetsally/web` and `@assetsally/mobile`.
