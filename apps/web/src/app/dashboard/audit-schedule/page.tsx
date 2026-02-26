"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuditSchedulePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/audit-schedule/calendar");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-2 text-slate-500">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent animate-spin rounded-full" />
        Redirecting to calendar...
      </div>
    </div>
  );
}
