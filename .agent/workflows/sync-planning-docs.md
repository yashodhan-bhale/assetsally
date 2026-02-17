---
description: Sync planning documents between project and conversation artifacts
---

# Sync Planning Documents

This workflow ensures planning documents stay synchronized between:
- **Project docs** (`docs/planning/`) - Source of truth, version controlled
- **Conversation artifacts** (brain directory) - Working copies for current session

## When to Sync

### Project → Artifacts (Start of Session)
Run at the **start of a new conversation** to load existing context:

1. Copy `docs/planning/task.md` content to artifact `task.md`
2. Copy `docs/planning/implementation_plan.md` to artifact `implementation_plan.md`
3. Review `docs/planning/decisions.md` for context

### Artifacts → Project (During/End of Session)
Run **after making changes** to planning documents:

// turbo
1. Copy artifact `task.md` to `docs/planning/task.md`

// turbo
2. Copy artifact `implementation_plan.md` to `docs/planning/implementation_plan.md`

// turbo
3. Update `docs/planning/decisions.md` if new decisions were made

## Files to Keep in Sync

| Project File | Artifact File | Purpose |
|--------------|---------------|---------|
| `docs/planning/task.md` | `brain/<id>/task.md` | Task checklist |
| `docs/planning/implementation_plan.md` | `brain/<id>/implementation_plan.md` | Technical plan |
| `docs/planning/decisions.md` | N/A (project only) | Design decisions log |
| `docs/planning/skills-needed.md` | N/A (project only) | Skills to create |

## Important Notes

- **Project docs are the source of truth** for persistence across conversations
- **Artifacts are working copies** that may be more current during active work
- Always sync artifacts → project before ending a significant work session
