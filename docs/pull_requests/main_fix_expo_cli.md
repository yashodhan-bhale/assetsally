# PR: fix(mobile): resolve expo cli fetch crash and support expo go via lazy db init

## Title

`fix(mobile): resolve expo cli fetch crash and support expo go via lazy db init`

## Overview

This change resolves two major blockers for mobile development:

1. **Expo CLI Startup Crash**: Fixed a critical bug in `@expo/cli` where network caches corrupted the response body on Node 20, and a failure to handle undici fetch errors.
2. **Expo Go Compatibility**: Refactored the database layer to be lazy-loaded. This allows the app to bundle and run in the standard Expo Go app without crashing on missing native JSI modules, facilitating UI development even when a custom development build is not active.

## Technical Changes

- **Updated Patch**: `patches/@expo__cli@54.0.23.patch` now includes fixes for:
  - Buffering response bodies before caching to prevent stream corruption.
  - Catching undici's `TypeError: fetch failed` to allow graceful offline fallback.
- **Lazy Database Layer**:
  - `apps/mobile/db/index.ts`: Replaced immediate `Database` instantiation with a lazy `Proxy` pattern. Collections are now only initialized when first accessed.
  - `apps/mobile/services/sync-engine.ts`: Updated to use the `getDatabase()` getter.
- **Asset Sanitization**:
  - `apps/mobile/app.json`: Removed references to non-existent icon and splash screen assets to clean up bundle warnings.
- **Knowledge Base**:
  - `docs/planning/agent_knowledge_sdk54.md`: Added **Section #4** documenting the CLI bugs, root causes, and the pnpm patch strategy.

## Verification Results

### Local Verification

Run via: `pnpm turbo lint build test --concurrency 1 --force`

| Package              | Lint | Build | Test   | Result |
| -------------------- | ---- | ----- | ------ | ------ |
| @assetsally/api      | ✅   | ✅    | ✅ (2) | PASS   |
| @assetsally/web      | ✅   | ✅    | ✅ (9) | PASS   |
| @assetsally/mobile   | ✅   | ✅    | ✅ (0) | PASS   |
| @assetsally/shared   | ✅   | ✅    | -      | PASS   |
| @assetsally/ui       | ✅   | ✅    | -      | PASS   |
| @assetsally/database | -    | ✅    | -      | PASS   |

### Manual Verification

- Verified `expo start` correctly detects network issues and provides the "Networking has been disabled" fallback instead of crashing.
- Verified the mobile app bundles successfully without the "Body is unusable" error.
- Verified that top-level imports of the database layer are safe for Expo Go.
