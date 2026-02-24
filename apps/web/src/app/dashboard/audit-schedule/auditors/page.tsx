"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, CalendarDays } from "lucide-react";
import { useState } from "react";

import { api } from "../../../../lib/api";
import { ScheduleForm } from "../components/ScheduleForm";

export default function AuditorsPage() {
  const [filterDate, setFilterDate] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState("NAME"); // NAME, ASSIGNMENTS
  const [selectedAuditor, setSelectedAuditor] = useState<any>(null);
  const [isScheduling, setIsScheduling] = useState(false);

  const { data: auditors, isLoading } = useQuery({
    queryKey: ["audit-schedule-auditors"],
    queryFn: () => api.getAuditScheduleAuditors(),
  });

  const filteredAuditors = (auditors || [])
    .filter((auditor: any) => {
      if (!filterDate || !showOnlyAvailable) return true;

      const selectedDate = new Date(filterDate);
      selectedDate.setUTCHours(0, 0, 0, 0);

      const isBooked = auditor.schedules.some((s: any) => {
        const d = new Date(s.scheduledDate);
        return (
          d.getUTCDate() === selectedDate.getUTCDate() &&
          d.getUTCMonth() === selectedDate.getUTCMonth() &&
          d.getUTCFullYear() === selectedDate.getUTCFullYear()
        );
      });

      return !isBooked;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "ASSIGNMENTS") {
        return (b.schedules?.length || 0) - (a.schedules?.length || 0);
      }
      return a.name.localeCompare(b.name);
    });

  const renderHeatmap = (schedules: any[]) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() + i);
      return d;
    });

    return (
      <div className="absolute z-[100] hidden group-hover/heatmap:grid grid-cols-5 gap-1.5 w-[320px] p-4 bg-white border border-slate-200 rounded-xl shadow-2xl right-full mr-4 top-1/2 -translate-y-1/2 animate-in fade-in zoom-in-95 backdrop-blur-sm bg-white/95">
        <div className="col-span-5 text-xs font-bold text-slate-700 mb-2 border-b border-slate-100 pb-2 flex justify-between items-center">
          <span>Workload: Next 30 Days</span>
          <span className="text-[10px] font-normal text-slate-400">
            ● Available ○ Scheduled
          </span>
        </div>
        {days.map((day, i) => {
          const isScheduled = schedules.some((s: any) => {
            const sd = new Date(s.scheduledDate);
            return (
              sd.getUTCDate() === day.getUTCDate() &&
              sd.getUTCMonth() === day.getUTCMonth() &&
              sd.getUTCFullYear() === day.getUTCFullYear()
            );
          });

          return (
            <div
              key={i}
              className={`flex flex-col items-center justify-center p-1.5 rounded-md border transition-all ${isScheduled ? "bg-blue-600 border-blue-700 text-white shadow-sm ring-1 ring-blue-500/20" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-blue-300"}`}
            >
              <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70">
                {day
                  .toLocaleDateString("en-US", { weekday: "short" })
                  .slice(0, 2)}
              </span>
              <span className="text-sm font-bold leading-tight">
                {day.getUTCDate()}
              </span>
              <span className="text-[9px] opacity-60">
                {day.toLocaleDateString("en-US", { month: "short" })}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex gap-6 relative min-h-[400px]">
      <div
        className={`flex-1 transition-all ${selectedAuditor ? "mr-80" : ""}`}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2 text-slate-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent animate-spin rounded-full" />
              Loading auditors...
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Filter by Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex items-center sm:mt-5">
              <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  disabled={!filterDate}
                />
                <span className={!filterDate ? "opacity-50" : ""}>
                  Show Only Available
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end">
            <label className="text-xs font-medium text-slate-500">
              Sort By:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="NAME">Name</option>
              <option value="ASSIGNMENTS">Locations Assigned</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-sm font-medium text-slate-500">
                <th className="py-3 px-4 font-normal">Auditor Name</th>
                <th className="py-3 px-4 font-normal">Locations Count</th>
                <th className="py-3 px-4 font-normal">Assigned Locations</th>
                <th className="py-3 px-4 font-normal">Status</th>
                <th className="py-3 px-4 w-48 font-normal">Workload Heatmap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAuditors?.map((auditor: any) => (
                <tr
                  key={auditor.id}
                  onClick={() => setSelectedAuditor(auditor)}
                  className="hover:bg-slate-50/50 group transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <div className="font-medium text-slate-900 leading-tight">
                      {auditor.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {auditor.email}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">
                    {auditor.schedules?.length || 0}
                  </td>
                  <td className="py-4 px-4 text-slate-600 text-sm max-w-[200px] truncate">
                    {auditor.schedules?.length > 0 ? (
                      [
                        ...new Set(
                          auditor.schedules.map(
                            (s: any) => s.location?.locationName,
                          ),
                        ),
                      ].join(", ")
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200/50">
                      {auditor.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="relative group/heatmap inline-flex items-center justify-center p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors cursor-help">
                      <CalendarDays className="w-5 h-5" />
                      {renderHeatmap(auditor.schedules || [])}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAuditors?.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500">
                    No auditors match your filters.
                  </td>
                </tr>
              )}
              {isLoading &&
                (!filteredAuditors || filteredAuditors.length === 0) && (
                  <tr>
                    <td colSpan={4} className="text-center py-20">
                      {/* Placeholder while loading */}
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAuditor && (
        <div className="w-80 absolute right-0 top-0 h-full bg-white border border-slate-200 rounded-xl p-5 shadow-lg animate-in fade-in slide-in-from-right-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedAuditor.name}
              </h3>
              <p className="text-sm text-slate-500">{selectedAuditor.email}</p>
            </div>
            <button
              onClick={() => {
                setSelectedAuditor(null);
                setIsScheduling(false);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {isScheduling ? (
              <div className="animate-in fade-in slide-in-from-right-4">
                <ScheduleForm
                  onSuccess={() => setIsScheduling(false)}
                  onCancel={() => setIsScheduling(false)}
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-slate-700">
                    Assigned Locations
                  </h4>
                  <button
                    onClick={() => setIsScheduling(true)}
                    className="text-xs flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Schedule
                  </button>
                </div>
                {selectedAuditor.schedules &&
                selectedAuditor.schedules.length > 0 ? (
                  <div className="space-y-3">
                    {selectedAuditor.schedules.map((s: any) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200"
                      >
                        <div className="text-xs text-slate-500 font-mono mb-1">
                          {new Date(s.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm font-medium text-slate-900">
                          {s.location.locationName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {s.location.locationCode}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                    No assignments found.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
