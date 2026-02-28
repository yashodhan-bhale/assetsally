# PR Summary: Fix Test Health Check & Enable Mobile Tests

## Overview

This PR addresses several issues identified during a comprehensive test health check. It restores missing test configurations, enables previously skipped mobile tests, and addresses environment-specific challenges in the monorepo setup.

## Technical Changes

### API

- Added `vitest.config.e2e.ts` to allow E2E tests to run without configuration errors.

### Mobile (Expo)

- Enabled `login.spec.tsx` by renaming it from `.skip`.
- Added `babel.config.js` to support transformation of React Native modules in tests.
- Refined `jest.config.js` to correctly handle `pnpm` monorepo dependency paths.
- Migrated mobile tests from Vitest-like syntax to Jest syntax (as per project configuration).
- Fixed a priority lint warning in `lib/api.ts` by renaming the default `Constants` import.

## Verification

- Successfully ran `pnpm turbo lint build test --concurrency 1 --force` across the entire monorepo.
- Verified that `apps/mobile` tests now pass with 1 rendered test case.
- All 13 turbo tasks (including `next build` for the web app) completed successfully.
