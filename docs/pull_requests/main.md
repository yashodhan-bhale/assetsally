# PR: feat(mobile): enhance audit functionality and implement inventory item binding

## Overview
This feature update streamlines the mobile audit workflow and introduces robust inventory item management. Key highlights include the removal of legacy audit options, the introduction of a dedicated inventory item screen with QR code association ("Binding"), and improved data visibility on the web dashboard.

## Technical Changes

### Mobile App (`apps/mobile`)
- **Audit Workflow**: Removed "Found", "Missing", and "Damaged" legacy options to simplify the user interface.
- **Inventory Item Screen**: Created a new screen to display imported item data.
- **QR Binding**: Integrated camera functionality to allow auditors to bind physical QR codes to system inventory items.
- **Database**: Added/Updated migrations to track QR associations.
- **Code Quality**: Resolved several high-priority linting issues including `import/order` and `react-native/no-unused-styles`.

### Web Dashboard (`apps/web`)
- **Data Presentation**: Updated `inventory` and `reports` pages to use standardized date (MM/DD/YYYY) and currency (right-aligned, no symbols) formatting.
- **Testing**: Added comprehensive Vitest suites for the new formatting logic.

### API & Shared (`apps/api`, `packages/shared`)
- **QR Logical Refinement**: Updated services to handle new binding metadata.
- **Constants**: Centralized status and type definitions for consistency across platforms.

## Verification
Verification was performed using the standard suite (`pnpm turbo lint test`).

### Test Results
- **Mobile Tests**: `login.spec.tsx` passed. Manual verification of QR camera binding performed.
- **Web Tests**: 9 tests passed across 3 suites (`inventory/page.spec.tsx`, `reports/page.spec.tsx`, `login/page.spec.tsx`).
- **API Tests**: all service and processor tests passed.

### Linting
Successfully ran `pnpm turbo lint` with zero errors.
