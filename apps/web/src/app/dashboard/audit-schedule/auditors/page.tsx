"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, CalendarDays } from "lucide-react";
import { useState, useEffect } from "react";

import { useAuth } from "../../../../contexts/auth-context";
import { useRouter } from "next/navigation";
import { api } from "../../../../lib/api";
import { AuditScheduleModal } from "../components/AuditScheduleModal";

export default function AuditorsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.appType === "CLIENT") {
      router.replace("/dashboard/audit-schedule/calendar");
    }
  }, [user, router]);

  const [filterDate, setFilterDate] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState("NAME"); // NAME, ASSIGNMENTS
  const [selectedAuditor, setSelectedAuditor] = useState<any>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);

  if (user?.appType === "CLIENT") return null;

  const { data: auditors, isLoading } = useQuery({
    queryKey: ["audit-schedule-auditors"],
    queryFn: () => api.getAuditScheduleAuditors(),
  });

  // Sync selected auditor when data changes (for instant updates)
  useEffect(() => {
    if (selectedAuditor && auditors) {
      const updated = auditors.find((a: any) => a.id === selectedAuditor.id);
      if (updated) {
        setSelectedAuditor(updated);
      }
    }
  }, [auditors, selectedAuditor]);

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

  return (
    <div className="flex gap-5 relative min-h-[400px]">
      <div
        className={`flex-1 transition-all ${selectedAuditor ? "mr-[21rem]" : ""}`}
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

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-sm font-medium text-slate-500">
                <th className="py-3 px-4 font-normal">Auditor Name</th>
                <th className="py-3 px-4 font-normal">Locations Count</th>
                <th className="py-3 px-4 font-normal">Assigned Locations</th>
                <th className="py-3 px-4 font-normal">Status</th>
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
                </tr>
              ))}
              {filteredAuditors?.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500">
                    No auditors match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AuditScheduleModal
        isOpen={isScheduling || !!editingSchedule}
        onClose={() => {
          setIsScheduling(false);
          setEditingSchedule(null);
        }}
        initialLocationId={editingSchedule?.locationId || null}
        initialDate={editingSchedule?.startDate || null}
        initialEndDate={editingSchedule?.endDate || null}
        initialAuditorIds={editingSchedule?.auditorIds || []}
        readOnly={false}
      />

      {selectedAuditor && !isScheduling && (
        <div className="w-80 absolute right-0 top-0 h-full bg-white border border-slate-200 rounded-xl p-5 shadow-lg animate-in fade-in slide-in-from-right-8 flex flex-col">
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedAuditor.name}
              </h3>
              <p className="text-sm text-slate-500">{selectedAuditor.email}</p>
            </div>
            <button
              onClick={() => setSelectedAuditor(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="space-y-6">
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
                    {(() => {
                      const grouped = selectedAuditor.schedules.reduce(
                        (acc: any, s: any) => {
                          const locId = s.location.id;
                          if (!acc[locId]) {
                            acc[locId] = {
                              location: s.location,
                              dates: [],
                            };
                          }
                          acc[locId].dates.push(new Date(s.scheduledDate));
                          return acc;
                        },
                        {},
                      );

                      return Object.values(grouped).map((group: any) => {
                        const sortedDates = group.dates.sort(
                          (a: Date, b: Date) => a.getTime() - b.getTime(),
                        );
                        const minDate = sortedDates[0];
                        const maxDate = sortedDates[sortedDates.length - 1];

                        const formatDate = (d: Date) => {
                          const dd = String(d.getDate()).padStart(2, "0");
                          const mm = String(d.getMonth() + 1).padStart(2, "0");
                          const yyyy = d.getFullYear();
                          return `${dd}/${mm}/${yyyy}`;
                        };

                        const dateRange =
                          minDate.getTime() === maxDate.getTime()
                            ? formatDate(minDate)
                            : `${formatDate(minDate)} - ${formatDate(maxDate)}`;

                        return (
                          <div
                            key={group.location.id}
                            onClick={() => {
                              // Find all relevant auditor IDs for this location from the auditor's schedules
                              const locSchedules =
                                selectedAuditor.schedules.filter(
                                  (s: any) =>
                                    s.location.id === group.location.id,
                                );
                              // We use the first schedule's assigned auditors
                              // (assuming consistency across the range for this auditor/location pair)
                              const auditorIds =
                                locSchedules[0]?.assignedAuditors?.map(
                                  (a: any) => a.id,
                                ) || [selectedAuditor.id];

                              setEditingSchedule({
                                locationId: group.location.id,
                                startDate: minDate,
                                endDate: maxDate,
                                auditorIds: auditorIds,
                              });
                            }}
                            className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-blue-200 cursor-pointer transition-colors"
                          >
                            <div className="text-xs text-blue-600 font-bold mb-1">
                              {dateRange}
                            </div>
                            <div className="text-sm font-medium text-slate-900">
                              {group.location.locationName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {group.location.locationCode}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                    No assignments found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
