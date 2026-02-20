# Pull Request: feat(web): refine locations hierarchy display and inventory location filtering

## Overview
This PR improves the asset management workflow by refining how locations are displayed and how inventory items are filtered. The "Locations" page now presents hierarchy levels in a more intuitive "specific-to-general" order, and the "Inventory" page supports direct filtering from the location hierarchy.

## Technical Changes

### Web Application (`apps/web`)

#### Locations Page
- **Hierarchy Refinement**: Reversed the order of location level columns to display Level 4 (most specific) first, followed by Level 3, 2, and 1.
- **UI Cleanup**: Removed the "Type" column to reduce information density.
- **Seamless Navigation**: Converted the Level 4 column into links that navigate to the Inventory page pre-filtered for that specific location.

#### Inventory Page
- **Location Filtering**: Implemented `useSearchParams` to capture `locationId` from the URL.
- **Filter Visibility**: Added a prominent "Location Filter" badge at the top of the inventory table showing the active location name (e.g., "📍 HQ Office").
- **Reset Logic**: Integrated a clear filter button (X) to quickly return to the full inventory view.
- **Concurrency & State**: Wrapped the page in a `Suspense` boundary to handle Next.js App Router requirements for client-side search parameters.

#### Testing
- **Test Optimization**: Updated `inventory/page.spec.tsx` to mock `next/navigation` hooks (`useSearchParams`, `useRouter`) and the newly used `api.getLocation` method.
- **Build Stabilization**: Fixed import ordering and linting issues in test files to satisfy strict CI/CD standards.

## Verification Proof

Successfully ran the full verification suite:
`pnpm turbo lint build test --concurrency 1`

- **Tasks**: 13 successful, 13 total
- **Packages**:
  - `@assetsally/web`: Lint passed, Build passed, Tests passed (5 tests)
  - `@assetsally/api`: Lint passed, Build passed, Tests passed (2 tests)
  - `@assetsally/mobile`: Lint passed, Tests passed (no tests found)
  - `@assetsally/shared`: Lint passed, Build passed
  - `@assetsally/ui`: Lint passed, Build passed
  - `@assetsally/database`: Build passed
