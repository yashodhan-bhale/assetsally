"use client";

import { Loader2 } from "lucide-react";
import React, { Suspense } from "react";

import { UserManagementTable } from "@/components/users/user-management-table";

const LoaderIcon: any = Loader2;

function AuditorsPageContent() {
  return (
    <UserManagementTable
      title="Auditor Management"
      description="Manage auditor accounts for the mobile application."
      appTypeFilter="MOBILE"
      defaultRole="AUDITOR"
    />
  );
}

export default function AuditorsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <LoaderIcon className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <AuditorsPageContent />
    </Suspense>
  );
}
