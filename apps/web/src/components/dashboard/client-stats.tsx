"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, MapPin, FileCheck, BarChart3 } from "lucide-react";
const PackageIcon: any = Package;
const MapPinIcon: any = MapPin;
const FileCheckIcon: any = FileCheck;
const BarChartIcon: any = BarChart3;

import { api } from "../../lib/api";

import { StatCard } from "./stat-card";

export function ClientStats() {
  const { data: stats } = useQuery({
    queryKey: ["inventory-stats"],
    queryFn: () => api.getInventoryStats(),
  });

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: () => api.getLocations(),
  });

  const { data: audits } = useQuery({
    queryKey: ["audits"],
    queryFn: () => api.getAudits(),
  });

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={PackageIcon}
          label="Total Assets"
          value={stats?.totalItems || 0}
          color="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          icon={MapPinIcon}
          label="Locations"
          value={locations?.length || 0}
          color="bg-teal-500/15 text-teal-400"
        />
        <StatCard
          icon={FileCheckIcon}
          label="Completed Audits"
          value={
            audits?.reports?.filter((r: any) => r.status === "APPROVED")
              .length || 0
          }
          color="bg-cyan-500/15 text-cyan-400"
        />
      </div>

      {/* Recent verified audits */}
      <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChartIcon className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-white">
            Recent Verified Audits
          </h3>
        </div>
        {audits?.reports?.filter((r: any) => r.status === "APPROVED").length ? (
          <div className="space-y-3">
            {audits.reports
              .filter((r: any) => r.status === "APPROVED")
              .slice(0, 5)
              .map((report: any) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between py-2 border-b border-slate-800/30 last:border-0"
                >
                  <div>
                    <p className="text-sm text-white">
                      {report.location?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Verified{" "}
                      {new Date(
                        report.reviewedAt || report.createdAt,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
                    Verified ✓
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No verified audits yet</p>
        )}
      </div>
    </>
  );
}
