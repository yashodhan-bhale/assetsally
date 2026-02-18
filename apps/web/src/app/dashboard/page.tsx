"use client";

import { AdminStats } from "../../components/dashboard/admin-stats";
import { ClientStats } from "../../components/dashboard/client-stats";
import { useAuth } from "../../contexts/auth-context";
import { UserRole, hasRole } from "../../lib/rbac";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Asset Verification System Overview
        </p>
      </div>

      {user &&
      hasRole(user.role, [UserRole.CLIENT]) &&
      !hasRole(user.role, [UserRole.ADMIN]) ? (
        <ClientStats />
      ) : (
        <AdminStats />
      )}
    </div>
  );
}
