"use client";

import { Loader2 } from "lucide-react";
import React, { Suspense } from "react";

import { UserManagementTable } from "@/components/users/user-management-table";

const LoaderIcon: any = Loader2;

function ClientsPageContent() {
  return (
    <UserManagementTable
      title="Client Management"
      description="Manage client users and their access to the client portal."
      appTypeFilter="CLIENT"
      defaultRole="CLIENT"
    />
  );
}

export default function ClientsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <LoaderIcon className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <ClientsPageContent />
    </Suspense>
  );
}
