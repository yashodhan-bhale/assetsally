"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "../../../../lib/utils";

const tabs = [
  { name: "Calendar", href: "/dashboard/audit-schedule/calendar" },
  { name: "Auditors", href: "/dashboard/audit-schedule/auditors" },
  { name: "Locations", href: "/dashboard/audit-schedule/locations" },
];

export function AuditScheduleNav() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-4 border-b border-slate-200 mb-6">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "py-4 px-1 border-b-2 text-sm font-medium transition-colors",
              isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300",
            )}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}
