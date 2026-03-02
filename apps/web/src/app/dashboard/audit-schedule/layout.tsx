"use client";

import React from "react";
import { useAuth } from "../../../contexts/auth-context";
import { AuditScheduleNav } from "./components/AuditScheduleNav";
import { SummaryCards } from "./components/SummaryCards";

export default function AuditScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const isAdmin = user?.appType === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Audit Schedule
          </h1>
          <p className="text-slate-500">
            {isAdmin
              ? "Plan and manage upcoming audits and auditor assignments."
              : "View and manage upcoming audits for your locations."}
          </p>
        </div>
      </div>

      <SummaryCards />
      <AuditScheduleNav />

      {/* Content area no longer needs a dark wrapper. The pages shouldn't be dark. */}
      <div className="min-h-[500px]">{children}</div>
    </div>
  );
}
