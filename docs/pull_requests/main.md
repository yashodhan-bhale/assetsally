# Pull Request: chore(mobile): update dependencies and fix linting errors

## Overview
This PR updates core mobile dependencies to ensure compatibility and stability, and resolves minor linting issues in the `apps/mobile` workspace.

## Technical Changes
- **Mobile (`apps/mobile`)**:
    - Updated `react-native` to `0.73.6`.
    - Updated `expo-camera` to `14.1.3`.
    - Updated `expo-image-manipulator` to `11.8.0`.
    - Adjusted `jest-expo` to `50.0.4` to align with the Expo SDK.
    - Fixed Prettier formatting in `expo-env.d.ts`.
- **Global**:
    - Synchronized `pnpm-lock.yaml`.

## Verification
Full verification suite executed via Turbo:
- **Lint**: All packages passed (linting fixed in mobile).
- **Build**: All packages built successfully.
- **Test**: 
    - Web: 5 tests passed.
    - API: 2 tests passed.
    - Mobile: 0 tests found (dependency updates only).

Status: **PASSING**
