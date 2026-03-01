# Offline-First Architecture Implementation Plan

**Goal:** Transform the Auditor mobile app into an offline-first application using WatermelonDB so auditors can perform audits with zero connectivity.

**Architecture:** WatermelonDB local database mirrors the server-side Prisma schema for auditor-relevant tables (locations, inventory items, audit reports, audit findings). A sync engine pulls data on login/connectivity and pushes locally-created findings via an outbox queue. A connectivity context wraps the app to expose online/offline state and "last synced" timestamps.

**Tech Stack:** WatermelonDB `^0.28.0` (already installed), Expo SDK 54, React 19, AsyncStorage, `@react-native-community/netinfo`

---

## User Review Required

> [!IMPORTANT]
> **New API endpoint needed:** A `POST /audits/sync/push` bulk endpoint is proposed on the API to accept an array of findings in a single request, rather than calling `POST /audits/:id/findings` N times. This is critical for efficient sync. See Task 3 below.

> [!WARNING]
> **WatermelonDB JSI requirement:** WatermelonDB v0.28+ uses JSI (native modules). This means it **will not work in Expo Go**. You'll need to use a **development build** (`npx expo run:android` / `npx expo run:ios`) or an EAS development build. The current `expo start` workflow will need to switch to `npx expo start --dev-client`.

> [!IMPORTANT]
> **`@react-native-community/netinfo`** needs to be installed for connectivity detection. This is a native module and also requires a development build.

---

## Proposed Changes

### Component 1: Database Layer (WatermelonDB Schema + Initialization)

Set up WatermelonDB with a local schema that mirrors the server-side Prisma models relevant to auditing.

#### [NEW] [schema.ts](file:///d:/PROJECTS/assetsally/apps/mobile/db/schema.ts)

WatermelonDB table definitions for: `locations`, `inventory_items`, `audit_reports`, `audit_findings`, `sync_metadata`. Key design decisions:

- Use server UUIDs as the primary `id` for pulled records (set via `_raw.id`)
- `audit_findings` and `audit_reports` that are created locally get a `_locallyCreated` flag
- `sync_metadata` table stores `lastPulledAt` timestamp

#### [NEW] [models/Location.ts](file:///d:/PROJECTS/assetsally/apps/mobile/db/models/Location.ts)

WatermelonDB Model class for locations with fields: `server_id`, `location_code`, `location_name`, `description`, `path`, `depth`, `level_label`, `parent_id`.

#### [NEW] [models/InventoryItem.ts](file:///d:/PROJECTS/assetsally/apps/mobile/db/models/InventoryItem.ts)

Model for inventory items with fields: `server_id`, `asset_number`, `asset_name`, `asset_description`, `location_id`, `department_name`, `category_name`, `acquisition_cost`, `net_book_value`, `quantity_as_per_books`, `inventory_status`, `custom_fields`.

#### [NEW] [models/AuditReport.ts](file:///d:/PROJECTS/assetsally/apps/mobile/db/models/AuditReport.ts)

Model for audit reports with fields: `server_id`, `location_id`, `auditor_id`, `status`, `submitted_at`, `is_locally_created`, `needs_sync`.

#### [NEW] [models/AuditFinding.ts](file:///d:/PROJECTS/assetsally/apps/mobile/db/models/AuditFinding.ts)

Model for audit findings with fields: `server_id`, `report_id`, `item_id`, `status`, `condition`, `notes`, `geo_lat`, `geo_lng`, `geo_accuracy`, `custom_field_values`, `is_locally_created`, `needs_sync`.

#### [NEW] [models/SyncMeta.ts](file:///d:/PROJECTS/assetsally/apps/mobile/db/models/SyncMeta.ts)

Single-row metadata table storing: `last_pulled_at`, `last_pushed_at`.

#### [NEW] [index.ts](file:///d:/PROJECTS/assetsally/apps/mobile/db/index.ts)

Database initialization: creates the WatermelonDB `Database` instance with the schema and model classes. Exports the singleton `database` object.

---

### Component 2: Connectivity Context

#### [NEW] [contexts/connectivity-context.tsx](file:///d:/PROJECTS/assetsally/apps/mobile/contexts/connectivity-context.tsx)

React context + provider using `@react-native-community/netinfo` to expose:

- `isOnline: boolean`
- `lastSyncedAt: Date | null`
- `isSyncing: boolean`

#### [MODIFY] [\_layout.tsx](file:///d:/PROJECTS/assetsally/apps/mobile/app/_layout.tsx)

Wrap the app in `<ConnectivityProvider>` (alongside existing `<AuthProvider>`).

---

### Component 3: Sync Engine

#### [NEW] [services/sync-engine.ts](file:///d:/PROJECTS/assetsally/apps/mobile/services/sync-engine.ts)

Core sync service with two main functions:

1. **`pullData(token, userId)`** — Called on login and when connectivity is restored:
   - Fetch user profile to get `assignedLocationId`
   - `GET /locations?parentId=...` recursively for the subtree → upsert into WatermelonDB `locations`
   - `GET /inventory?locationId=...` for each location → upsert into `inventory_items`
   - `GET /audits?auditorId=...` → upsert into `audit_reports` and `audit_findings`
   - Update `sync_metadata.last_pulled_at`

2. **`pushData(token)`** — Called automatically when online and there are dirty records:
   - Query WatermelonDB for `audit_findings` where `needs_sync = true`
   - Query WatermelonDB for `audit_reports` where `needs_sync = true`
   - POST each to the API (findings via `POST /audits/:id/findings`, reports via `POST /audits`)
   - On success, clear `needs_sync` flag
   - Update `sync_metadata.last_pushed_at`

#### [NEW] [hooks/useSync.ts](file:///d:/PROJECTS/assetsally/apps/mobile/hooks/useSync.ts)

Custom hook that:

- Triggers `pullData` on mount (after login)
- Sets up an interval to attempt `pushData` when online
- Exposes `syncNow()`, `isSyncing`, `lastSyncedAt`

---

### Component 4: API Additions (Minimal)

#### [MODIFY] [audits.controller.ts](file:///d:/PROJECTS/assetsally/apps/api/src/audits/audits.controller.ts)

Add a `POST /audits/sync/push` endpoint that accepts a batch of findings:

```typescript
@Post('sync/push')
@Roles('AUDITOR', 'ADMIN', 'SUPER_ADMIN')
async syncPush(@Body() dto: SyncPushDto, @Req() req: any) {
  return this.auditsService.syncPush(dto, req.user.id);
}
```

#### [MODIFY] [audits.service.ts](file:///d:/PROJECTS/assetsally/apps/api/src/audits/audits.service.ts)

Add `syncPush` method that processes a batch: creates reports if needed, then upserts findings in a transaction.

#### [NEW] [dto/sync-push.dto.ts](file:///d:/PROJECTS/assetsally/apps/api/src/audits/dto/sync-push.dto.ts)

DTO for the batch sync push payload.

---

### Component 5: UI Updates

#### [MODIFY] [app/(tabs)/audits.tsx](<file:///d:/PROJECTS/assetsally/apps/mobile/app/(tabs)/audits.tsx>)

- Read audit reports from WatermelonDB instead of `mobileApi.getMyAudits()`
- Use WatermelonDB's `observe()` for reactive updates
- Show sync status indicator (🟢 synced, 🟡 pending, 🔴 offline)

#### [MODIFY] [app/audit/[id].tsx](file:///d:/PROJECTS/assetsally/apps/mobile/app/audit/[id].tsx)

- Read report + findings from WatermelonDB
- Write findings to WatermelonDB with `needs_sync = true`
- Add an inventory item list with ability to record findings inline
- Show "Offline Mode" badge when disconnected

#### [MODIFY] [app/(tabs)/index.tsx](<file:///d:/PROJECTS/assetsally/apps/mobile/app/(tabs)/index.tsx>)

- Add connectivity status card ("Online ✓ | Last synced 2 min ago" or "Offline Mode")
- Add pending sync count indicator
- Trigger initial sync after login

#### [NEW] [app/audit/inventory.tsx](file:///d:/PROJECTS/assetsally/apps/mobile/app/audit/inventory.tsx)

New screen showing inventory items for a location, read from WatermelonDB.

#### [MODIFY] [app/(tabs)/profile.tsx](<file:///d:/PROJECTS/assetsally/apps/mobile/app/(tabs)/profile.tsx>)

Add "Last Synced" info and a "Force Sync" button.

---

### Component 6: Offline Status Bar Component

#### [NEW] [components/SyncStatusBar.tsx](file:///d:/PROJECTS/assetsally/apps/mobile/components/SyncStatusBar.tsx)

Reusable component that shows a thin bar at the top:

- Green: "Online — All synced"
- Yellow: "Online — Syncing X items..."
- Red: "Offline — Changes saved locally"

---

### Component 7: User Management (API & Web)

#### [NEW] [Users API](file:///d:/PROJECTS/assetsally/apps/api/src/users/)

Standard NestJS module to manage system users:

- **UsersService**: Handles hashing (bcrypt), deduplication, and CRUD.
- **UsersController**: REST endpoints protected by `JwtAuthGuard`.

#### [NEW] [Management UI](file:///d:/PROJECTS/assetsally/apps/web/src/app/dashboard/users/page.tsx)

Sleek management page:

- **Data View**: `DataTable` with name, contact, and role info.
- **Filtering**: By role (ADMIN/AUDITOR/CLIENT).
- **Creation**: Validation-backed modal for adding users.

---

## Verification Plan

### Automated Tests

WatermelonDB doesn't work well in Jest (requires native modules). We'll test the **pure logic** parts:

1. **Sync engine unit tests** (`apps/mobile/services/__tests__/sync-engine.test.ts`):
   - Mock the WatermelonDB database and `mobileApi`
   - Test that `pullData` correctly calls API endpoints and writes to DB
   - Test that `pushData` reads dirty records and posts them
   - Test error handling (network failure mid-sync)
   - **Run:** `cd apps/mobile && npx jest services/__tests__/sync-engine.test.ts`

2. **Connectivity context tests** (`apps/mobile/contexts/__tests__/connectivity-context.test.tsx`):
   - Mock `@react-native-community/netinfo`
   - Verify context provides correct `isOnline` state
   - **Run:** `cd apps/mobile && npx jest contexts/__tests__/connectivity-context.test.tsx`

3. **API sync endpoint tests** (`apps/api/src/audits/audits.service.spec.ts`):
   - Test `syncPush` method with mocked Prisma
   - Test batch creation + upsert logic
   - **Run:** `cd apps/api && npx jest --testPathPattern audits`

### Manual Verification

Since WatermelonDB requires native modules (no Expo Go), manual testing needs a development build:

1. **Build the dev client**: `cd apps/mobile && npx expo run:android` (or iOS)
2. **Login flow**: Login as an Auditor user → verify inventory data is pulled into local DB (check React DevTools or add a debug screen showing WatermelonDB record counts)
3. **Offline audit**: Turn on airplane mode → Create a finding for an inventory item → Verify the finding is visible in the audit detail screen
4. **Sync on reconnect**: Turn off airplane mode → Verify the finding syncs to the API (check API logs or database) → Verify sync status indicator updates
5. **App restart persistence**: Record a finding offline → Force-close the app → Reopen → Verify the finding is still there

> [!NOTE]

---

## Phase 9: Admin Web App Enhancements (Completed)

This phase focuses on refining the Audit Schedule logic and improving the UI/UX across all its views.

### 1. Backend Logic
- Remove auditor concurrently-scheduled restriction.
- Filter for leaf locations only in `AuditScheduleService`.

### 2. Side Menu Cleanup
- Remove "Inventory" from `nav-config.ts`.

### 3. Layout & Sidebar Refinements
- Reduce layout gap by 50% across all Audit Schedule pages.
- Group sidebar assignments and support scrolling for overflow.
- Replace icons (Edit -> Pencil).

### 4. Advanced Pre-filling
- Update `ScheduleForm` and `AuditScheduleModal` to support `initialEndDate` and `initialAuditorIds`.
- Implement clicking sidebar items to open the modal in "edit mode" with pre-filled state.
