"use client";

import { useQuery } from "@tanstack/react-query";
import { Building2, Users } from "lucide-react";
import React from "react";

import { useAuth } from "../../../../contexts/auth-context";
import { StatCard } from "../../../../components/dashboard/stat-card";
import { api } from "../../../../lib/api";

export function SummaryCards() {
  const { data, isLoading } = useQuery({
    queryKey: ["audit-schedule-summary"],
    queryFn: () => api.getAuditScheduleSummary(),
  });

  const { user } = useAuth();
  const isAdmin = user?.appType === "ADMIN";

  const locationsStats = data?.locations || {
    total: 0,
    unscheduled: 0,
    unassigned: 0,
  };
  const auditorsStats = data?.auditors || { total: 0, unused: 0 };

  return (
    <div
      className={`grid grid-cols-1 ${isAdmin ? "md:grid-cols-2" : "md:grid-cols-1"} gap-6 mb-8`}
    >
      <StatCard
        icon={Building2}
        label="Locations"
        value={isLoading ? "..." : locationsStats.total}
        sub={`${locationsStats.unscheduled} Unscheduled${isAdmin ? ` • ${locationsStats.unassigned} Unassigned` : ""}`}
        color="bg-blue-500/10 text-blue-500"
      />
      {isAdmin && (
        <StatCard
          icon={Users}
          label="Auditors"
          value={isLoading ? "..." : auditorsStats.total}
          sub={`${auditorsStats.unused} Unused (no future assignments)`}
          color="bg-purple-500/10 text-purple-500"
        />
      )}
    </div>
  );
}
