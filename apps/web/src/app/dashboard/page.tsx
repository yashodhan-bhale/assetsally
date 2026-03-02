"use client";
import React from "react";

import { AdminStats } from "../../components/dashboard/admin-stats";
import { ClientStats } from "../../components/dashboard/client-stats";
import { useAuth } from "../../contexts/auth-context";

export default function DashboardPage(): React.ReactNode {
  const { user } = useAuth();
  const isAdmin = user?.appType === "ADMIN";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {isAdmin ? "Admin Dashboard" : "Client Overview"}
        </h1>
        <p className="text-slate-500">
          {isAdmin
            ? "Overview of your asset verification status across all clients."
            : "Overview of your asset verification status."}
        </p>
      </div>

      {isAdmin ? <AdminStats /> : <ClientStats />}
    </div>
  );
}
