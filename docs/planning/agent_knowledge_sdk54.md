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

### 4. The `@expo/cli` Fetch Bugs on Node 20 (pnpm patched)

Two bugs in `@expo/cli@54.0.23` cause crashes during `expo start` on Node 20. Both are fixed by the pnpm patch at `patches/@expo__cli@54.0.23.patch`.

**Bug A: `Body is unusable: Body has already been read`**

- **Crash location**: `getNativeModuleVersions.ts:47` — `response.json()` on a corrupted response
- **Root cause**: `wrapFetchWithCache.js` passes `response.body` (a ReadableStream) to `FileSystemResponseCache.set()`, which calls `.tee()` and partially reads one fork. On Node 20's undici, this corrupts the other fork.
- **Fix**: Buffer `response.body` into a `Buffer` first, then create independent streams for caching and the returned `Response`.

**Bug B: `TypeError: fetch failed` (uncaught)**

- **Crash location**: `client.ts:98` → `wrapFetchWithCredentials` catch block re-throws
- **Root cause**: `isNetworkError()` in `client.js` only checks 3 error codes (`ENOTFOUND`, `EAI_AGAIN`, `UND_ERR_CONNECT_TIMEOUT`). Node 20's undici throws a generic `TypeError: fetch failed` with no error code when the connection fails — this is not caught, so Expo crashes instead of gracefully entering offline mode.
- **Fix**: Extended `isNetworkError()` to also match `TypeError: fetch failed` and added `ECONNREFUSED`, `ECONNRESET`, `ETIMEDOUT` to the code list.

**Result**: With both patches, when the network is unreliable, Expo CLI outputs `Networking has been disabled` and continues to start Metro normally.

## Troubleshooting

- If Metro hangs: Run `taskkill /F /IM node.exe /T` and restart with `npx expo start --clear`.
- If peer dependency errors appear: The `pnpm` overrides are working as intended. Use `--no-frozen-lockfile` if necessary but do not remove the overrides.
- If `Body is unusable` returns after `pnpm install`:
  1. Verify the patch exists: `patches/@expo__cli@54.0.23.patch`
  2. Verify `package.json` has `pnpm.patchedDependencies` referencing it
  3. If the patch was lost, re-apply: `pnpm patch @expo/cli@54.0.23`, fix `wrapFetchWithCache.js` per section #4, then `pnpm patch-commit`
  4. Quick workaround: `Remove-Item -Recurse "$env:USERPROFILE\.expo\native-modules-cache"` and use `expo start --offline`
