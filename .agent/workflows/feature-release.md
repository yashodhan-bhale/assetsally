---
description: Automated feature release workflow with local verification, conventional commits, and PR documentation.
---

# Feature Release Workflow

This workflow ensures that every feature or bugfix pushed to the repository is fully verified, documented, and follows established standards.

## Phase 1: Local Verification // turbo

1. Run full verification suite (use `--concurrency 1` if encountering memory/OOM errors):

```bash
pnpm turbo lint build test --concurrency 1
```

_Wait for this to pass. If it fails, fix the errors before proceeding._ 2. **Test Transparency**:

- Display a list of all tests that were executed.
- For any **newly added or modified test files**, show the code content or a detailed summary of the test cases to the user.
- Note: The project uses a hybrid testing setup: **Jest** for Mobile (Expo) and **Vitest** for Web/API.

## Phase 2: Conventional Staging

1. Audit the changes for testing:
   - Check if new logic has corresponding test files.
   - If missing, prompt the user to add tests or explain why they are not needed.
2. Confirm the **Testing proof** with the user (show which tests cover which logic).
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

1. Generate a rich Markdown summary of the changes:
   - **Title**: Detailed title including the commit message.
   - **Overview**: What this change achieves.
   - **Technical Changes**: List of modified modules and their impact.
   - **Verification**: Proof that tests were run and passed.
2. Save this summary to `docs/pull_requests/<branch_name>.md`.

## Phase 5: Remote Sync

1. Check current branch name and push to origin:

```bash
# Workflow will automatically identify branch name and push
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

Run this workflow BEFORE opening a PR to ensure 100% build stability.
