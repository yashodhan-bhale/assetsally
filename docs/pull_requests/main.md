# Pull Request: feat(mobile, web): implement mobile audit verification flow and web audit scheduling improvements

## Overview
This change implements the core audit verification flow on the mobile app, allowing auditors to record findings, bind QR tags, and submit reports. It also improves the web-based audit scheduling system with improved layout handles and better form verification.

## Technical Changes

### Mobile App (`apps/mobile`)
- **Audit Verification**: Implemented the detail view for audits and individual items.
- **QR Binding**: Added the ability to bind QR tags to inventory items.
- **Connectivity & Sync**: Refined the `useSync` hook and `ConnectivityProvider` for better offline/online transitions.
- **Code Quality**: Installed missing `@react-native/eslint-config` and resolved multiple linting/formatting errors.
- **Fixes**: Resolved a Windows-specific environment variable parsing issue (`REACT_NATIVE_PACKAGER_HOSTNAME`).

### Web App (`apps/web`)
- **Scheduling System**: Improved the audit schedule calendar, auditor listing, and location selection pages.
- **Component Refinement**: Updated `AuditScheduleModal` and `ScheduleForm` for better validation and layout.
- **Linting**: Fixed over 1,400 formatting errors (CRLF vs LF) to ensure build stability.

## Verification Proof

### Tests
- **Mobile**: Jest tests passed.
- **Web**: Vitest tests passed.
- **API**: Vitest tests passed.

### Linting & fresh Run
- Fresh verification run using `pnpm turbo lint test --force` completed successfully.
- Manual mobile linting (`npm run lint`) passes with 0 errors.
- Successful Android bundle export verified via `npx expo export --platform android`.
