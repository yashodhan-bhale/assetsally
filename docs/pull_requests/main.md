# Pull Request: feat(web): implement working data-driven reports page with location breakdown and search

## Overview
This PR transforms the static reports mockup into a fully functional, data-driven Reports Engine for the AssetsAlly web application. It transitions from static mock data to real-time inventory insights, focusing on financial summaries and location-based audit reconciliation.

## Technical Changes
- **Web App (`apps/web`)**:
  - `reports/page.tsx`: 
    - Implemented dynamic data fetching using `@tanstack/react-query`.
    - Added comprehensive data processing logic for summary metrics (Total Assets, Acquisition Cost, Net Book Value, QR Compliance).
    - Integrated `DataTable` for the **Location Breakdown**, adding search, pagination, and audit-centric columns (As per Books, Physical, Difference, Found OK, Discrepancies).
    - Updated UI to remove unnecessary sidebars and focus on core data views.
  - `reports/page.spec.tsx`:
    - Updated tests to handle `useQuery` via `QueryClientProvider`.
    - Mocked API calls to verify the new dynamic UI components.

## Verification
- **Automated Tests**:
  - `pnpm turbo lint test` executed and passed across all packages (`web`, `api`, `mobile`).
  - Web unit tests specifically verified for `ReportsPage` component.
- **Manual Verification**:
  - Verified summary metric accuracy against inventory base.
  - Confirmed table pagination and search functionality in Location Breakdown.
  - Validated currency formatting (₹) and status-based counting for discrepancies.
