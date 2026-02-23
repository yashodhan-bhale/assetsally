# AssetsAlly - Design Decisions

> Captured from brainstorming session on 2026-02-09

## Project Overview

An ecosystem of 2 apps for asset verification (audit) process:

- **Web Dashboard** - A unified Next.js application for Admin management, Client view-only access, and Staff operations.
- **Auditor Mobile App** - Field verification with offline support

---

## Finalized Decisions

### 1. Location Hierarchy

- **Decision**: Variable depth (2-4 levels) with client-configurable labels.
- **Rationale**: Simplified from the initial 5-level proposal to improve user experience while maintaining organizational depth.
- **Implementation**: Materialized Path pattern for efficient descendant queries.

### 2. Mobile Offline Support

- **Decision**: Smart sync with priority queuing
- **Details**:
  - Full offline capability with local database
  - Auto-sync when connectivity returns
  - Priority: Text data syncs before images
- **Rationale**: Remote locations have unreliable network coverage

### 3. Inventory Verification Data

- **Decision**: Hybrid approach (Core fixed fields + Dynamic custom fields)
- **Core fields** (always present):
  - Status: Found / Not Found / Relocated / Damaged / Disposed
  - Condition: Good / Fair / Poor / Non-functional
  - Photos (0-n)
  - Notes (text)
  - Geo-tag (auto-captured)
- **Dynamic fields**: Admin-configurable per asset category
  - Field types: Text, Number, Date, Dropdown, Checkbox, Photo
- **Rationale**: Base project must adapt to any client requirements

### 4. Authentication Strategy

- **Decision**: Unified users table with `app_type`, `role`, and `user_type` fields.
- **Unified Frontend**: Admin, Staff, and Client users now share the same `apps/web` application. Access is controlled via Role-Based Access Control (RBAC) within the unified Next.js dashboard.
- **Mobile session**: Persistent login (refresh token strategy) for Auditors.
- **Rationale**: Consolidating codebases reduces maintenance overhead and ensures consistent UI/UX across all roles.

### 5. Client App Roles

- **Decision**: Configurable roles with permission matrix
- **Details**:
  - Role labels are client-configurable
  - Primarily view-only
  - Admin can enable/disable actions per role: flag, remark, approve, reject
  - Access scoped by location + department

### 6. Report Approval Workflow

- **Decision**: Report-level approval/rejection with item-level comments
- **Flow**: Admin rejects entire report but can mark/comment on specific items
- **Rationale**: Simple workflow, detailed feedback

### 7. Excel Import

- **Decision**: Fixed extensive template
- **Process**: Data received from clients is pre-formatted to match template
- **Empty columns**: Used for non-applicable fields
- **Rationale**: Simplifies import logic, single known schema

### 8. Location Scheduling & Access

- **Decision**: Admin-controlled scheduling
- **Details**:
  - Admin assigns dates to locations
  - Unscheduled = locked by default
  - Admin can manually unlock unscheduled locations
  - Admin can lock scheduled locations (override)
  - Single timezone

### 9. PDF Reports

- **Essential reports**:
  - Location Report
  - Discrepancy Report
  - Department-wise Report
- **Generation**: On-demand only (not scheduled)

### 10. Scale Expectations

- **Locations**: ~500 (variable)
- **Items per location**: 1000+
- **Total items**: 500,000+
- **Concurrent auditors**: 20-50

### 11. Photo Storage

- **Decision**: MinIO (self-hosted S3-compatible storage)
- **Compression**: Max 500KB per photo, aspect ratio preserved
- **Rationale**: No vendor lock-in, full control

### 12. SDK 54 Upgrade & Versioning (Monorepo Compatibility)

- **Decision**: Forced Node 20 LTS + Forced React Version Split
- **Details**:
  - **Node.js**: Must use **v20.x**. Node 22+ causes `Body is unusable` crashes in the Expo/Metro fetch implementation.
  - **React (Web)**: Pin to **v18.2.0**. Required for compatibility with existing UI packages and stable web build.
  - **React (Mobile)**: Pin to **v19.1.0**. Required by Expo SDK 54.
- **Enforcement**:
  - `.npmrc` with `engine-strict=true` (Prevents installs on wrong Node versions)
  - Root `package.json` overrides (Prevents version drift across apps)
  - Custom `metro.config.js` for mobile (Ignores web/api to prevent watcher crashes)
- **Rationale**: This is the only stable configuration that allows the latest Expo SDK 54 feature set while maintaining the reliability of the existing Web/Admin dashboards. **Do not attempt to "unify" these versions until UI packages are React 19 compatible.**

---

## Access Control Model

### Two-Dimensional Permission Matrix

1. **Geographical (Location Tree)**: User assigned to a root location node, can access all descendants
2. **Functional (Department)**: User assigned specific departments OR "All Departments" flag

### Query Logic

```
SELECT items WHERE:
  item.location_path STARTS WITH user.assigned_location_path
  AND (
    user.all_departments = TRUE
    OR item.department_id IN user.allowed_departments
    OR item.department_id IS NULL
  )
```

---

## QR Code Late Binding

- QR codes pre-printed in bulk (not associated with items)
- Status: UNASSIGNED → ASSIGNED → RETIRED
- Binding happens on-site via mobile app
- One active QR tag per item (can replace damaged tags)

---

## Tech Stack Requirements

- **No vendor lock-in** - Self-hosted on VPS
- **Object storage**: MinIO
- **Database**: To be determined (PostgreSQL recommended)
- **Mobile**: Offline-first with local DB

### 13. Expo CLI Stability & Expo Go Compatibility (SDK 54)

- **Problem**: Expo CLI v54.0.23 crashes on Node 20 due to fetch body corruption and generic fetch errors. Additionally, WatermelonDB's top-level native module imports prevent the app from even bundling in Expo Go.
- **Decision**: Permanent pnpm patch for `@expo/cli` + Lazy-loaded database layer via ES Proxy.
- **Details**:
  - **CLI Patch**: Fixed `wrapFetchWithCache.js` (body-buffer fix) and `client.js` (`isNetworkError` fix) in the `@expo/cli` package. This prevents "Body is unusable" and uncaught fetch crashes, allowing graceful offline fallback.
  - **Lazy DB Init**: `db/index.ts` now uses an ES Proxy to defer WatermelonDB initialization until the first collection or database property is accessed.
- **Rationale**:
  - **Stability**: The CLI patch ensures the development environment remains usable even when upstream Expo APIs/connectivity are unreliable.
  - **Accessibility**: Lazy initialization allows the app to bundle and run in the standard **Expo Go** app for UI development. While database features will fail at runtime in Expo Go (missing native modules), developers can still build and test UI screens without needing a custom development build locally. Full offline functionality still requires a custom development client (`npx expo run:android`).
