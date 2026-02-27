"use client";

import { Loader2 } from "lucide-react";
import React, { Suspense } from "react";

import { UserManagementTable } from "@/components/users/user-management-table";

const LoaderIcon: any = Loader2;

function StaffPageContent() {
  return (
    <UserManagementTable
      title="Staff Management"
      description="Manage administrative staff and system administrators."
      appTypeFilter="ADMIN"
      defaultRole="ADMIN"
    />
  );
}

export default function StaffPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <LoaderIcon className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <StaffPageContent />
    </Suspense>
  );
}
