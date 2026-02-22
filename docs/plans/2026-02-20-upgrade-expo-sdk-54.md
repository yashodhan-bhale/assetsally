# Upgrade Expo SDK to 54 Implementation Plan

**Goal:** Upgrade the mobile app from Expo SDK 50 to SDK 54 to resolve compatibility issues with the latest Expo Go version.

**Architecture:** We will use `npx expo install` to handle the dependency version management automatically. This ensures all Expo-related packages are compatible with SDK 54.

**Tech Stack:** Expo SDK 54, React Native 0.81, React 19.

---

### Task 1: Update Expo and Core Dependencies

Update the main `expo` package and use the interactive fix tool.

**Files:**

- Modify: `apps/mobile/package.json`

**Step 1: Update expo version**
Run: `pnpm --filter @assetsally/mobile add expo@^54.0.0`

**Step 2: Run automated dependency fix**
Run: `npx expo install --fix`
_Expected: This will update react-native, react, expo-router, and other expo-_ packages.\*

**Step 3: Commit initial upgrade**

```bash
git add apps/mobile/package.json
git commit -m "chore: upgrade expo to sdk 54"
```

### Task 2: Fix Peer Dependency Mismatches

The upgrade to React 19 and RN 0.81 often requires manual updates for peer dependencies.

**Step 1: Check for WatermelonDB updates**
Run: `pnpm --filter @assetsally/mobile add @nozbe/watermelondb@latest`

**Step 2: Update testing libraries**
Update `react-test-renderer` to match React 19.
Run: `pnpm --filter @assetsally/mobile add -D react-test-renderer@19.1.0`

### Task 3: Clean and Restart

Clear old caches to avoid build errors.

**Step 1: Clean build artifacts**
Run: `pnpm clean` (from root)

**Step 2: Install dependencies**
Run: `pnpm install`

**Step 3: Start with cache clear**
Run: `pnpm --filter @assetsally/mobile dev --clear`

---

## Plan complete. Ready to start implementation?
