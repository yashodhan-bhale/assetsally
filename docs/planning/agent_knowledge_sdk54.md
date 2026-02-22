# Knowledge Item: Expo SDK 54 & Monorepo Stability

## Context

This project was upgraded to Expo SDK 54 in February 2026. During this process, significant stability issues were encountered regarding Node.js versions and React version conflicts.

## CRITICAL: Environment Constraints

If you are an agent tasked with fixing "version mismatches", **read this first**.

### 1. The "Body is unusable" Bug

- **Symptom**: Metro bundler or Expo CLI crashes with `TypeError: Body is unusable`.
- **Root Cause**: Node.js v21 and v22 have changes to the global `fetch` / `undici` implementation that conflict with Expo's internal networking code.
- **Fix**: **MUST** use Node **v20.x (LTS)**.
- **Enforcement**: Check `.npmrc` (`engine-strict`) and `.nvmrc`.

### 2. The React Version Split

- **Constraint**: Expo SDK 54 **requires** React 19.1.0+. However, the Web application (`apps/web`) and shared UI components are currently only stable on React 18.2.0.
- **Architecture**: We have intentionally split the versions:
  - `apps/web` -> React 18.2.0
  - `apps/mobile` -> React 19.1.0
- **Enforcement**: Root `package.json` has `pnpm.overrides` to lock these.
- **Warning**: Do **NOT** attempt to "unify" these versions. It will break the Web dashboard build or cause React Native runtime errors.

### 3. File System Watcher Crashes

- **Symptom**: Metro crashes with `ENOENT` or `Unable to deserialize cloned data` when web files change.
- **Fix**: The `apps/mobile/metro.config.js` is configured to **ignore** the `apps/web` and `apps/api` directories.
- **Warning**: If you modify Metro config, ensure `blockList` includes the other apps in the monorepo.

## Troubleshooting

- If Metro hangs: Run `taskkill /F /IM node.exe /T` and restart with `npx expo start --clear`.
- If peer dependency errors appear: The `pnpm` overrides are working as intended. Use `--no-frozen-lockfile` if necessary but do not remove the overrides.
