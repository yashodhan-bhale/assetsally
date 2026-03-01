# PR: feat(admin): enhance inventory with QR unbinding and fix verification suite

## Overview

This pull request enhances the Admin Inventory experience by allowing admins to unbind QR codes from items. This ensures flexibility during the inventory setup phase while maintaining data integrity by locking bindings once an audit report is submitted. It also addresses critical test suite failures and linting issues.

## Technical Changes

### API Package (`apps/api`)

- **Services**:
    - **QrTagsService**: Implemented `unassignFromItem` which deletes the `QRBindingRecord` and resets the `QRTagStatus` to `UNASSIGNED`.
    - **Logic Guard**: Added a check to prevent unbinding if an `AuditReport` for the item's location is already `SUBMITTED` or `APPROVED`.
- **Tests**:
    - Fixed `qr-tags.service.spec.ts` failure by mocking `systemSettings.upsert` to support the new unique serial number generation logic.
- **Linting**:
    - Resolved 11 Prettier and `prefer-const` errors across `qr-tags.service.ts` and related files.

### Web Package (`apps/web`)

- **Inventory Page**:
    - Added `QrCell` component to display assigned QR codes in the data table.
    - Implemented "Unbind QR Code" action with a confirmation dialog.
    - Added loading states and hover transitions for a premium UI feel.
- **Tests**:
    - Fixed `inventory/page.spec.tsx` crashes by properly wrapping the test component in `QueryClientProvider` and `QueryClient`.

### Shared Package (`packages/shared`)

- Resolved minor unused variable warning in `utils/index.ts`.

## Verification

- **Full Verification Suite**: Executed `pnpm turbo lint build test --concurrency 1` successfully across all packages.
- **API Tests**: 24 tests passed (Health, Users, QR Tags).
- **Web Tests**: 9 tests passed (Inventory, Reports, Login).
- **Mobile Tests**: Linting and build verified (167 warnings, 0 errors).
- **Database**: Prisma build and sync verified.

## Verification Proof

- [x] Web Tests pass (Vitest)
- [x] API Tests pass (Vitest)
- [x] Full build successful
- [x] Linting passed (0 errors)
