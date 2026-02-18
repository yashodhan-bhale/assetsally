# Skills to Create

> Skills that will be created at the appropriate implementation phase

## Phase 3: Authentication & Authorization

### Skill: Auth & Permissions Patterns

- **Create before**: Implementing JWT authentication
- **Topics to cover**:
  - JWT access + refresh token strategy
  - Persistent mobile sessions
  - RBAC implementation with location + department scoping
  - Multi-app, single-role user model
  - Permission matrix for Client app roles

---

## Phase 5: Mobile App Core

### Skill: Offline-First Mobile

- **Create before**: Setting up WatermelonDB/SQLite
- **Topics to cover**:
  - Local database schema design
  - Sync queue with priority levels (text before images)
  - Conflict resolution strategies
  - Background sync implementation
  - Handling unreliable connectivity

---

## As Needed

### Skill: Database Schema Design

- **Create if**: Complex schema decisions arise
- **Topics to cover**:
  - Materialized Path for location hierarchy
  - Indexing strategies for 500K+ items
  - Dynamic custom fields storage (EAV vs JSON)

### Skill: PDF Generation

- **Create if**: Complex report templates needed
- **Topics to cover**:
  - Template design patterns
  - Dynamic content rendering
  - Large report optimization

---

## Checklist

- [ ] Auth & Permissions Patterns (Phase 3)
- [ ] Offline-First Mobile (Phase 5)
- [ ] Database Schema Design (if needed)
- [ ] PDF Generation (if needed)
