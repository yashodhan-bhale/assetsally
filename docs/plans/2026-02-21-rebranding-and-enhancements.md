# Rebranding and Enhancements Implementation Plan

**Goal:** Rebrand "AssetsAlly" to "Ratan Rathi & Co.", fix mobile layout, adjust location depth to 4, add a Reports page, and remove dashboard scanning from Auditor app.

**Architecture:**
- Centralize branding strings and logos.
- Use `SafeAreaView` in Mobile `_layout.tsx` to ensure notch/home-indicator compliance.
- Modify `packages/shared` constants and `apps/api` logic to enforce a 4-level location hierarchy.
- Build a responsive Reports page in the Web app with filter sidebar and summary table.
- Remove the Scan QR quick action card from the mobile dashboard.

**Tech Stack:** Next.js, React Native (Expo), NestJS, Prisma, Tailwind CSS.

---

### Task 1: Rebrand Web App
**Files:**
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/src/components/layout/dashboard-layout.tsx`
- Modify: `apps/web/src/app/login/page.tsx`

**Step 1: Update metadata and title in layout.tsx**
```tsx
export const metadata: Metadata = {
  title: "Ratan Rathi & Co. | Asset Management",
  description: "Asset Verification System",
};
```

**Step 2: Replace "AssetsAlly" text and generic logo with `client-logo.png` in dashboard-layout.tsx**
Ensure the logo is not cropped using `object-contain`.

**Step 3: Update login page with the new logo and name.**

---

### Task 2: Rebrand Mobile App
**Files:**
- Modify: `apps/mobile/app.json`
- Modify: `apps/mobile/app/_layout.tsx`
- Modify: `apps/mobile/app/index.tsx`

**Step 1: Change app name in app.json**
```json
"name": "Ratan Rathi & Co."
```

**Step 2: Update header title in _layout.tsx**

**Step 3: Update login/welcome screen with the new logo.**

---

### Task 3: Mobile SafeArea Restrictions
**Files:**
- Modify: `apps/mobile/app/_layout.tsx`
- Modify: `apps/mobile/package.json` (ensure `react-native-safe-area-context` is installed)

**Step 1: Wrap Stack components in `SafeAreaProvider`.**
**Step 2: Check screens and use `SafeAreaView` where content is cut off.**

---

### Task 4: Location Depth Adjustment (2-4 levels)
**Files:**
- Modify: `packages/shared/src/constants/index.ts`
- Modify: `apps/api/src/locations/locations.service.ts`
- Modify: `apps/web/src/app/dashboard/locations/page.tsx`

**Step 1: Change `MAX_DEPTH` to 4 in shared constants.**
**Step 2: Ensure API validation and tree generation respects 4 levels.**
**Step 3: Update Web UI to strictly handle up to 4 levels of hierarchy.**

---

### Task 5: Mobile Dashboard Modification
**Files:**
- Modify: `apps/mobile/app/(tabs)/index.tsx`

**Step 1: Remove the "Scan QR" TouchableOpacity card.**
**Step 2: Update the info text to reflect that scanning is done within location inventory.**

---

### Task 6: Create Reports Page
**Files:**
- Create: `apps/web/src/app/dashboard/reports/page.tsx`

**Step 1: Implement the "Reports Engine" UI as per the attached image.**
- Left sidebar for parameters (Date Range, Zone, Status, Auditor).
- Main view with Executive Summary.
- Export PDF/Excel buttons.
- Zone Performance Breakdown table.
