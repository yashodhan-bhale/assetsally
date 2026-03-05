# PR Summary: feat(multi): Extract Mobile App and Fix Stack Stability

## Detailed Title
`feat(multi): Complete Mobile App Extraction and Full-Stack Cleanup`

## Overview
This PR decouples the **Mobile Application** (`apps/mobile`) from the **pnpm monorepo** into a standalone **npm** project (Expo SDK 54, React 19). It also addresses critical linting errors and React Hook violations in the Web and API apps, ensures structural integrity for the React 18 frontend components, and prunes 50+ obsolete debugging artifacts.

## Technical Changes

### Mobile App Extraction
- **Standalone Conversion**: Separated `apps/mobile` into a native npm project.
- **Node 20 Compatibility**: Created `scripts/patch-expo-cli.js` to handle original Expo CLI `stream.tee()` bugs on modern Node versions.
- **Dependency Clean**: Pinned `@expo/metro` to `54.0.0` to avoid terminal reporting structural breaks.

### Monorepo Core Cleanup
- **React Version Isolation**: Removed root `pnpm.overrides` for React 19 (which were previously required by the mobile app). The Monorepo now strictly follows React 18 for Web/UI.
- **Config Pruning**: Removed `eslint-plugin-react-native` and `react-native.js` config from the shared workspace packages.
- **Patch Removal**: Deleted the monorepo-level Expo CLI patch file.

### Bug Fixes & Quality
- **React Hooks**: Corrected conditional `useQuery` and `useEffect` hook usage in `AuditorsPage` (Web), resolving illegal hook execution orders.
- **Lint Audit**: Resolved 600+ auto-fixable linting errors and 50+ manual warnings across the codebase.
- **Artifact Cleanup**: Deleted 58 `migration_dump_*.xml` and `migration_verify_*.png` files generated during previous debugging sessions.

## Verification
- **Monorepo**: Successfully ran `pnpm turbo lint test --force`. (All 35 API tests and 9 Web tests passed).
- **Mobile**: Successfully ran `npm test` on the standalone mobile app (Jest verified).
- **Manual**: Verified that the Web (Next.js), API (Nest.js), and Mobile (Expo) dev servers can all run concurrently without port collisions.

## Testing Proof
- **API (Vitest)**: 35 tests passed
- **Web (Vitest)**: 9 tests passed
- **Mobile (Jest)**: 1 test passed
