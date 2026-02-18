# AssetsAlly - Design Decisions

> Captured from brainstorming session on 2026-02-09

## Project Overview

An ecosystem of 3 apps for asset verification (audit) process:

- **Admin Web App** - Manages everything (data, users, reports)
- **Client Web App** - View-only with configurable permissions per role
- **Auditor Mobile App** - Field verification with offline support

---

## Finalized Decisions

### 1. Location Hierarchy

- **Decision**: Variable depth (2-5 levels) with client-configurable labels
- **Rationale**: Different clients have different organizational structures
- **Implementation**: Materialized Path pattern for efficient descendant queries

### 2. Mobile Offline Support

- **Decision**: Smart sync with priority queuing
- **Details**:
  - Full offline capability with local database
  - Auto-sync when connectivity returns
  - Priority: Text data syncs before images
- **Rationale**: Remote locations have unreliable network coverage

### 3. Inventory Verification Data

- **Decision**: Hybrid approach (Core fixed fields + Dynamic custom fields)
- **Core fields** (always present):
  - Status: Found / Not Found / Relocated / Damaged / Disposed
  - Condition: Good / Fair / Poor / Non-functional
  - Photos (0-n)
  - Notes (text)
  - Geo-tag (auto-captured)
- **Dynamic fields**: Admin-configurable per asset category
  - Field types: Text, Number, Date, Dropdown, Checkbox, Photo
- **Rationale**: Base project must adapt to any client requirements

### 4. Authentication Strategy

- **Decision**: Unified users table with `app_type` + `role` fields
- **Constraint**: Users are strictly single-role, single-app (no overlap)
- **Mobile session**: Persistent login (refresh token strategy)
- **Rationale**: Admin manages ALL users from one place

### 5. Client App Roles

- **Decision**: Configurable roles with permission matrix
- **Details**:
  - Role labels are client-configurable
  - Primarily view-only
  - Admin can enable/disable actions per role: flag, remark, approve, reject
  - Access scoped by location + department

### 6. Report Approval Workflow

- **Decision**: Report-level approval/rejection with item-level comments
- **Flow**: Admin rejects entire report but can mark/comment on specific items
- **Rationale**: Simple workflow, detailed feedback

### 7. Excel Import

- **Decision**: Fixed extensive template
- **Process**: Data received from clients is pre-formatted to match template
- **Empty columns**: Used for non-applicable fields
- **Rationale**: Simplifies import logic, single known schema

### 8. Location Scheduling & Access

- **Decision**: Admin-controlled scheduling
- **Details**:
  - Admin assigns dates to locations
  - Unscheduled = locked by default
  - Admin can manually unlock unscheduled locations
  - Admin can lock scheduled locations (override)
  - Single timezone

### 9. PDF Reports

- **Essential reports**:
  - Location Report
  - Discrepancy Report
  - Department-wise Report
- **Generation**: On-demand only (not scheduled)

### 10. Scale Expectations

- **Locations**: ~500 (variable)
- **Items per location**: 1000+
- **Total items**: 500,000+
- **Concurrent auditors**: 20-50

### 11. Photo Storage

- **Decision**: MinIO (self-hosted S3-compatible storage)
- **Compression**: Max 500KB per photo, aspect ratio preserved
- **Rationale**: No vendor lock-in, full control

---

## Access Control Model

### Two-Dimensional Permission Matrix

1. **Geographical (Location Tree)**: User assigned to a root location node, can access all descendants
2. **Functional (Department)**: User assigned specific departments OR "All Departments" flag

### Query Logic

```
SELECT items WHERE:
  item.location_path STARTS WITH user.assigned_location_path
  AND (
    user.all_departments = TRUE
    OR item.department_id IN user.allowed_departments
    OR item.department_id IS NULL
  )
```

---

## QR Code Late Binding

- QR codes pre-printed in bulk (not associated with items)
- Status: UNASSIGNED → ASSIGNED → RETIRED
- Binding happens on-site via mobile app
- One active QR tag per item (can replace damaged tags)

---

## Tech Stack Requirements

- **No vendor lock-in** - Self-hosted on VPS
- **Object storage**: MinIO
- **Database**: To be determined (PostgreSQL recommended)
- **Mobile**: Offline-first with local DB
