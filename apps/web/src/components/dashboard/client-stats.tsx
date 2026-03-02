"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Package,
  MapPin,
  FileCheck,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

import { api } from "../../lib/api";
import { StatCard } from "./stat-card";

const PackageIcon: any = Package;
const MapPinIcon: any = MapPin;
const FileCheckIcon: any = FileCheck;
const BarChartIcon: any = BarChart3;
const CheckCircleIcon: any = CheckCircle2;

export function ClientStats() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["inventory-stats"],
    queryFn: () => api.getInventoryStats(),
  });

  const { data: locations, isLoading: locLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => api.getLocations(),
  });

  const { data: audits, isLoading: auditLoading } = useQuery({
    queryKey: ["audits"],
    queryFn: () => api.getAudits(),
  });

  if (statsLoading || locLoading || auditLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate compliance
  const reports = audits?.reports || [];
  const completedAudits = reports.filter((r: any) => r.status === "APPROVED").length;
  const totalAudits = audits?.pagination?.total || 0;
  const compliance = totalAudits > 0 ? Math.round((completedAudits / totalAudits) * 100) : 0;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={PackageIcon}
          label="Total Assets"
          value={stats?.totalItems ?? 0}
          color="bg-blue-500/15 text-blue-400"
        />
        <StatCard
          icon={MapPinIcon}
          label="Active Locations"
          value={locations?.length ?? 0}
          color="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          icon={FileCheckIcon}
          label="Completed Audits"
          value={completedAudits}
          color="bg-amber-500/15 text-amber-400"
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Audit Compliance"
          value={`${compliance}%`}
          color="bg-purple-500/15 text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Recently Completed Audits */}
        <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <BarChartIcon className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Recently Completed Audits
            </h3>
          </div>
          {completedAudits > 0 ? (
            <div className="space-y-3">
              {reports
                .filter((r: any) => r.status === "APPROVED")
                .slice(0, 5)
                .map((report: any) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between py-3 border-b border-slate-800/30 last:border-0 hover:bg-slate-800/10 px-2 rounded-lg transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {report.location?.locationName ?? "Unknown Location"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                          : "-"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        PASSED
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-4 text-center italic">
              No approved audits available
            </p>
          )}
        </div>

        {/* Asset Distribution */}
        <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <MapPinIcon className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Asset Distribution
            </h3>
          </div>
          {locations && locations.length > 0 ? (
            <div className="space-y-1">
              {locations.slice(0, 5).map((loc: any) => (
                <div
                  key={loc.id}
                  className="flex items-center justify-between py-3 border-b border-slate-800/30 last:border-0 hover:bg-slate-800/10 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <p className="text-sm font-medium text-white">
                      {loc.locationName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-300">
                      {Number(loc._count?.inventoryItems ?? 0)}
                    </span>
                    <span className="text-[10px] text-slate-500">items</span>
                  </div>
                </div>
              ))}
              {locations.length > 5 && (
                <p className="text-[10px] text-slate-500 pt-2 text-center">
                  and {locations.length - 5} more locations
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-4 text-center italic">
              No location data available
            </p>
          )}
        </div>
      </div>
    </>
  );
}
