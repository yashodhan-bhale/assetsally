# Pull Request: Refactor Schema and Implement 4-Level Location Hierarchy

## Overview
This PR introduces significant updates to the core data structures and import mechanisms for AssetsAlly. The goal was to align the database with more descriptive business terminology and support a revised 4-level location hierarchy (reduced from 5).

## Technical Changes

### 🗄️ Database & Schema (packages/database)
- **Descriptive Naming**: Renamed fields in `Location` (e.g., `code` -> `locationCode`) and `InventoryItem` (e.g., `code` -> `assetNumber`, `cost` -> `acquisitionCost`).
- **Hierarchy Model**: Added `HierarchyConfig` to store custom labels (e.g., "Zone", "Branch") for each hierarchy level.
- **Migration**: Generated and applied migration `20260220082736_update_descriptive_fields`.

### ⚙️ Backend Services (apps/api)
- **Locations Service**: Updated `MAX_DEPTH` to 4 and adjusted `bulkImport` for new field names.
- **Inventory Service**: Updated `bulkImport` header mapping to match the "Inventory Report" Excel sheet format.
- **Imports Service**: Refactored to delegate specialized logic to domain services, improving maintainability.
- **Auth Service**: Fixed admin user creation logic to ensure persistence after database resets.

### 💻 Frontend (apps/web)
- **Inventory Dashboard**: Updated table columns and data fetching to use `assetNumber`, `assetName`, and financial fields.
- **Locations View**: Updated to display `locationCode` and generic level labels.
- **Audits & Stats**: Adjusted relation lookups to match the new schema names.

### 🛠️ Utilities & Scripts
- **Re-import Utility**: Added `scripts/re-import-fix.ts` to automate data resets and imports from the new Excel files.
- **Linting**: Fixed various formatting and unused variable warnings across the monorepo.

## Verification
- **Build**: `pnpm build` passed for all packages.
- **Lint**: `pnpm lint` passed with zero errors.
- **Test**: `pnpm test` passed for web and api (no tests in mobile).
- **Manual Proof**:
  - Successfully imported 27 locations across 4 levels.
  - Successfully imported 34 inventory items with full field mapping.
  - Verified Admin Login works post-reset.
