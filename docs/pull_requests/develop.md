# Pull Request: feat(api): implement background QR generation and binding history

## Overview
Implemented a robust background QR generation system and a binding history tracking mechanism. This allows for high-volume QR production without blocking the API and provides an audit trail for asset bindings.

## Technical Changes
- **API**: 
  - Added `QrGenerationProcessor` using `pdfkit` and `qrcode` for asynchronous PDF creation.
  - Updated `QrTagsService` to handle `QRGenerationJob` and `QRBatch` entities.
  - Implemented transaction-based binding and retirement logic with `QRBindingRecord` for auditability.
  - Added CSV export for asset-tag bindings.
  - Resolved build-time namespace issues (`fs`).
- **Web**: 
  - Completely redesigned QR Generator dashboard with "Tags" and "Jobs" tabs.
  - Added support for batch downloads and manual PDF regeneration triggering.
  - Fixed React 18/19 type compatibility issues for Lucide icons.
- **Shared**: 
  - Updated `JobStatus` and `QRTagStatus` enums.
  - Added types for QR jobs and batches.
- **Database**: 
  - Added `QRGenerationJob`, `QRBatch`, and `QRBindingRecord` models to Prisma schema.
- **DX/Linting**:
  - Configured `.eslintignore` to handle workspace-wide TypeScript parsing issues.
  - Fixed multiple linting errors in API and Web packages.

## Verification
- **New Tests**: 11 unit tests covering `QrTagsService` and `QrGenerationProcessor`.
- **Test Suite**: Run successfully using `pnpm turbo lint build test --concurrency 1 --force`.
- **Test Count**:
  - API: 24 tests passed.
  - Web: 9 tests passed.
  - Mobile: Verified build stability.
- **Build Status**: Verified all packages build successfully in production mode.
