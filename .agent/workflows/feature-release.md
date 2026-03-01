---
description: Automated feature release workflow with local verification, conventional commits, and PR documentation.
---

# Feature Release Workflow

Ensures every feature or bugfix pushed to the repository is verified, documented, and follows established standards.

## Phase 1: Local Verification

// turbo
1. Run the verification suite (lint + tests only — no build required):
   ```bash
   pnpm turbo lint test --concurrency 4
   ```
   - Use `--force` to bypass turbo cache for a true fresh run (e.g. before a staging release):
     ```bash
     pnpm turbo lint test --concurrency 4 --force
     ```
   - Only add `build` to the command if you are doing a **production release** and want to validate the build output:
     ```bash
     pnpm turbo lint build test --concurrency 4
     ```

   _Wait for all checks to pass. If anything fails, fix the errors before proceeding._

2. **Test Transparency**:
   - Display the list of all tests that were executed.
   - For any **newly added or modified test files**, show the code content or a detailed summary of the test cases.
   - Note: The project uses a hybrid testing setup: **Jest** for Mobile (Expo) and **Vitest** for Web/API.

## Phase 2: Conventional Staging

1. Audit the changes for test coverage:
   - Check if new logic has corresponding test files.
   - If missing, prompt the user to add tests or explain why they are not needed.
2. Confirm the **testing proof** with the user (which tests cover which logic).
3. Stage all verified changes:
   ```bash
   git add .
   ```

## Phase 3: Conventional Commits

1. Prompt the user for:
   - **Type**: (feat, fix, docs, chore, etc.)
   - **Scope**: (api, admin, client, mobile, shared, db, ci)
   - **Description**: A short, imperative summary.
2. Formulate the commit message: `<type>(<scope>): <description>`
3. Execute commit:
   ```bash
   git commit -m "<type>(<scope>): <description>"
   ```

## Phase 4: PR Documentation

1. Generate a Markdown summary of the changes:
   - **Title**: Detailed title including the commit message.
   - **Overview**: What this change achieves.
   - **Technical Changes**: List of modified modules and their impact.
   - **Verification**: Proof that tests were run and passed.
2. Save this summary to `docs/pull_requests/<branch_name>.md`.

## Phase 5: Remote Sync

1. Check current branch name and push to origin:
   ```bash
   git push -u origin $(git rev-parse --abbrev-ref HEAD)
   ```
2. Provide the user with the link to create a Pull Request based on the output.

## Phase 6: Main Alignment

1. Switch back to the development baseline:
   ```bash
   git checkout main
   git pull origin main
   ```
   _(Or `develop` depending on the current active base)_

---

### Usage Note:

Run this workflow **before** opening a PR to ensure full stability and traceability.
