import React from "react";

import { RoleGuard } from "../../components/auth/role-guard";
import { DashboardLayout } from "../../components/layout/dashboard-layout";
import { UserRole } from "../../lib/rbac";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.CLIENT]}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}
