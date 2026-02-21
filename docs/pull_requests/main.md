# Pull Request: fix(mobile): resolve login failure by correcting appType and adding dynamic API base URL detection

## Overview
This change resolves a critical issue where auditors were unable to log into the mobile application. The failure was caused by two main factors: an incorrect application type identifier and a hardcoded API endpoint that didn't account for varying network environments (physical devices vs. emulators).

## Technical Changes
### `@assetsally/mobile`
- **Logic Correction**: Updated the login payload to use `appType: "MOBILE"` instead of `"AUDITOR"`, aligning with the backend authentication service expectations.
- **Dynamic Configuration**: Integrated `expo-constants` to dynamically detect the host's IP address. This allows the app to connect to the computer's local API (port 3001) effortlessly from physical devices (Expo Go), iOS simulators, and Android emulators without manual code changes.
- **Network Resilience**: Enhanced the fetch wrapper with descriptive error messages for "Network request failed" scenarios to aid in troubleshooting.
- **Code Quality**: Applied ESLint and Prettier fixes to ensure compliance with project standards.

### `packages/database`
- **Data Integrity**: Re-verified and re-seeded the database to ensure test credentials (`auditor@demo.com` / `admin123`) are active and correctly configured.

## Verification
- **Test Suite**: Ran `pnpm turbo lint build test --concurrency 1`. 
- **Mobile Linting**: Corrected 5 errors and 104 warnings (fixable).
- **Manual Verification**: Confirmed that the mobile application now successfully communicates with the NestJS backend and processes the login flow for the auditor role.
- **Environment Tests**: Verified connectivity across Android Emulator and host machine.
