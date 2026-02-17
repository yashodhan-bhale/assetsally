"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Package,
  MapPin,
  FileCheck,
  QrCode,
  TrendingUp,
  BarChart3,
} from "lucide-react";

import { api } from "../../lib/api";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700/50 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <TrendingUp className="w-4 h-4 text-slate-600 group-hover:text-emerald-500 transition-colors" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
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

  const { data: qrTags } = useQuery({
    queryKey: ["qr-tags"],
    queryFn: () => api.getQrTags(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Asset Verification System Overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Total Assets"
          value={stats?.totalItems || 0}
          color="bg-blue-500/15 text-blue-400"
        />
        <StatCard
          icon={MapPin}
          label="Locations"
          value={locations?.length || 0}
          color="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          icon={FileCheck}
          label="Audit Reports"
          value={audits?.pagination?.total || 0}
          color="bg-amber-500/15 text-amber-400"
        />
        <StatCard
          icon={QrCode}
          label="QR Tags"
          value={qrTags?.pagination?.total || 0}
          color="bg-purple-500/15 text-purple-400"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Audits */}
        <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-white">Recent Audits</h3>
          </div>
          {audits?.reports?.length ? (
            <div className="space-y-3">
              {audits.reports.slice(0, 5).map((report: any) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between py-2 border-b border-slate-800/30 last:border-0"
                >
                  <div>
                    <p className="text-sm text-white">
                      {report.location?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {report.auditor?.name} —{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium
                                        ${
                                          report.status === "APPROVED"
                                            ? "bg-emerald-500/15 text-emerald-400"
                                            : report.status === "SUBMITTED"
                                              ? "bg-amber-500/15 text-amber-400"
                                              : report.status === "REJECTED"
                                                ? "bg-red-500/15 text-red-400"
                                                : "bg-slate-500/15 text-slate-400"
                                        }`}
                  >
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No audit reports yet</p>
          )}
        </div>

        {/* Locations Overview */}
        <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-white">Locations</h3>
          </div>
          {locations?.length ? (
            <div className="space-y-3">
              {locations.slice(0, 6).map((loc: any) => (
                <div
                  key={loc.id}
                  className="flex items-center justify-between py-2 border-b border-slate-800/30 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="text-sm text-white">{loc.name}</p>
                    <span className="text-xs text-slate-600">{loc.code}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {loc._count?.inventoryItems || 0} items
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No locations configured</p>
          )}
        </div>
      </div>
    </div>
  );
}
