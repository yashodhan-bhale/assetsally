# PR Summary: fix(mobile): resolve android build failures by disabling new architecture and jsi for watermelondb

## Overview

This pull request addresses critical Android build failures encountered when integrating WatermelonDB with Expo SDK 54 (React Native 0.81). The failures were related to Kotlin version mismatches, incompatibilities with the React Native New Architecture, and path resolution issues in the `watermelondb-jsi` module.

## Technical Changes

- **Mobile Configuration (`apps/mobile/app.json`)**:
  - Renamed the app to `RatanRathi` to avoid Gradle naming conflicts.
  - Added `expo-build-properties` to explicitly disable `newArchEnabled` for both Android and iOS, as WatermelonDB JSI is currently incompatible with React Native 0.76+ C++ paths.
  - Configured `@morrowdigital/watermelondb-expo-plugin` with `disableJsi: true` to fall back to the stable legacy bridge.
- **Android Native Project**:
  - Re-generated the `android` directory using `npx expo prebuild --clean` to ensure a consistent state.
- **Linting**:
  - Applied `eslint --fix` across the mobile app to resolve Prettier and other minor linting issues.

## Verification

- **Local Verification**: Ran `pnpm turbo lint build test --concurrency 1`. All 13 tasks completed successfully (9 cached, 4 fresh).
- **Cloud Build**: Successfully triggered and verified an EAS Build (Development Client) with these changes.
- **Live Testing**: The development client was successfully installed and connected to the local Metro server.

## PR Link

[Create Pull Request](https://github.com/yashodhan-bhale/assetsally/compare/main)
