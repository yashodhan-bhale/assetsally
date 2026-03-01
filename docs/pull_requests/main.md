# PR Summary: feat(admin): enhance audit schedule UI/UX and assignment flexibility

## Overview
This PR enhances the Audit Schedule system in the Admin Web App. It introduces more flexible auditor assignments (multiple locations per day), stricter location filtering (leaf levels only), and significant UI/UX improvements across all audit views (Auditors, Locations, Calendar).

## Technical Changes
- **Backend (`apps/api/src/audit-schedule/`)**:
    - Removed the restriction preventing an auditor from being assigned to multiple locations on the same day.
    - Added `where: { children: { none: {} } }` filtering to `getSummary` and `getLocations` to focus on the smallest units of the hierarchy.
- **Frontend (`apps/web/src/app/dashboard/audit-schedule/`)**:
    - **General**: Reduced content-to-sidebar gaps by 50% for a cleaner, more compact layout.
    - **Calendar View**: Compressed location items, removed auditor labels from cells, and added an "x more" note for busy days. Added date-range display in the sidebar.
    - **Auditors View**: Removed the workload heatmap. Improved sidebar with scrollable assignment lists and grouping by date range (DD/MM/YYYY).
    - **Locations View**: Updated the Edit icon to a pencil. Refined sidebar with direct auditor and date-range visibility.
    - **Modals**: Updated `ScheduleForm` and `AuditScheduleModal` to support full pre-filling of existing schedule data (location, date-range, and current auditors).

## Verification
- **Checks**: Ran `pnpm turbo lint test --concurrency 4`.
- **Lint**: All packages passed.
- **Tests**: 25 tests passed successfully across Web, API, and Mobile.
- **Manual Proof**:
    - Verified that only leaf-level locations appear in dropdowns and tables.
    - Confirmed that clicking edit on any audit sidebar item correctly pre-populates the modal fields.
    - Verified navigation cleanup by confirming "Inventory" is removed from the sidebar.
