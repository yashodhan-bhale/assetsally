# AssetsAlly Branching & Git Standards

## 1. Branching Model

We follow a structured branching strategy to maintain stability:

| Branch     | Purpose                                      | Stability |
| :--------- | :------------------------------------------- | :-------- |
| `main`     | Production-ready code only. Tagged releases. | HIGH      |
| `develop`  | Integration branch for upcoming features.    | MEDIUM    |
| `feat/*`   | Individual feature development.              | LOW       |
| `fix/*`    | Bug fixes for existing features.             | LOW       |
| `hotfix/*` | Emergency fixes directly for production.     | LOW       |

## 2. Commit Standards (Conventional)

Messages should follow the format: `<type>(<scope>): <description>`

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries

**Example**: `feat(api): add location tree endpoint`

## 3. Workflow Automation

Use the `/feature-release` slash command to automate your deployment safety checks. It will:

1. Verify linting, testing, and building locally.
2. Ensure commit messages are conventional.
3. Auto-generate PR documentation.
4. Push and sync with `develop`.
