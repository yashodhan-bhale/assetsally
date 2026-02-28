# PR Summary: Mobile Layout Fixes & Web Build Stability

## Overview

This PR addresses several visual and structural issues in the mobile application related to Safe Area insets and stabilizes the web production build by resolving React 18/19 type conflicts.

## Technical Changes

### Mobile (Expo)

- **Safe Area Integration**: Wrapped root layouts and individual screens (`login.tsx`, `index.tsx`, `audits.tsx`, `profile.tsx`, `scan.tsx`) in `SafeAreaView` or used `useSafeAreaInsets` to prevent overlap with status bars and home indicators.
- **Style Fixes**: Corrected invalid style property `flex1` (changed to `flex: 1`) in `inventory.tsx` and `[id].tsx`.
- **UI Consistency**: Standardized background colors to `#0f172a` across all mobile screens for a cohesive brand identity.

### Web (Next.js)

- **Build Compatibility**: Added `any` casts to `NextImage` (from `next/image`) to bypass build-time type errors caused by React 18 vs 19 mismatch in the monorepo.
- **Dependency Alignment**: Downgraded `framer-motion` to `v11.18.2` and `@testing-library/react` to `v14.3.1` to ensure strict compatibility with React 18.
- **Linting**: Fixed import ordering in `login/page.tsx` and `dashboard-layout.tsx`.

## Verification

- **Build**: `pnpm build` passed for all packages.
- **Testing**:
  - API: 24 tests passed.
  - Web: 9 tests passed.
- **Linting**: All packages passed with 0 errors.
