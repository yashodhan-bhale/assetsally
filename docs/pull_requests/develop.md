# Pull Request: feat(web): enhance audit schedule with searchable calendar details and range display

## Overview
This PR significantly enhances the Audit Schedule module, improving visibility, usability, and data management across all three primary views: Calendar, Auditors, and Locations.

## Technical Changes

### API (@assetsally/api)
- **Delete by Location**: Added `removeByLocation` method to `AuditScheduleService` and a corresponding DELETE endpoint in `AuditScheduleController`. This enables clearing all audit entries for a specific location in one action.

### Web App (@assetsally/web)
- **Schedule Management**: 
  - Added a "Clear Schedule" feature in `ScheduleForm` to allow users to reset audit dates for a location.
  - Implemented logic to clear existing schedules before creating new ones when rescheduling, ensuring no duplicate entries.
- **Calendar View**:
  - Enhanced day entries to show full location names and assigned auditors.
  - Transformed the calendar sidebar into a searchable "Daily Overview" instead of a creation form.
  - Added expandable audit cards in the sidebar to reveal more details (MapPin for location, Users for auditors).
  - Fixed timezone offset issues in date comparisons.
- **Auditors View**:
  - Refactored the workload heatmap to be larger, positioned more logically (left of the icon), and to display actual dates within day boxes.
- **Locations View**:
  - Renamed "Assigned Date" to "Schedule Date(s)".
  - Implemented dynamic date range display (e.g., "DD/MM/YYYY to DD/MM/YYYY") for multi-day audits.

## Verification
- **Linting**: Passed `next lint` for web and `eslint` for api (@assetsally/api has minor non-blocking warnings).
- **Testing**: All relevant unit tests passed in `@assetsally/web` and `@assetsally/api`.
- **Local Run**: UI verified locally for responsiveness and interaction patterns.

## Remote Sync
Pushed to branch `develop`.
