"use client";
import React from "react";

import { AdminStats } from "../../components/dashboard/admin-stats";

export default function DashboardPage(): React.ReactNode {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-slate-500">
          Overview of your asset verification status.
        </p>
      </div>

      <AdminStats />
    </div>
  );
}
