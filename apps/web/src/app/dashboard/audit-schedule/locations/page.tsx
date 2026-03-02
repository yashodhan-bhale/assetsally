"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Pencil } from "lucide-react";
import { useState, useEffect } from "react";

import { useAuth } from "../../../../contexts/auth-context";
import { api } from "../../../../lib/api";
import { AuditScheduleModal } from "../components/AuditScheduleModal";

export default function LocationsPage() {
  const { user } = useAuth();
  const isAdmin = user?.appType === "ADMIN";
  const [filterScheduled, setFilterScheduled] = useState("ALL");
  const [filterAssigned, setFilterAssigned] = useState("ALL");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);

  const { data: locations, isLoading } = useQuery({
    queryKey: ["audit-schedule-locations"],
    queryFn: () => api.getAuditScheduleLocations(),
  });

  // Sync selected location when data changes (for instant updates)
  useEffect(() => {
    if (selectedLocation && locations) {
      const updated = locations.find((l: any) => l.id === selectedLocation.id);
      if (updated) {
        setSelectedLocation(updated);
      }
    }
  }, [locations, selectedLocation]);

  const filteredLocations = locations?.filter((loc: any) => {
    const hasSchedules = loc.schedules && loc.schedules.length > 0;
    const isAssigned =
      hasSchedules &&
      loc.schedules.some(
        (s: any) => s.assignedAuditors && s.assignedAuditors.length > 0,
      );

    if (filterScheduled === "SCHEDULED" && !hasSchedules) return false;
    if (filterScheduled === "UNSCHEDULED" && hasSchedules) return false;

    if (filterAssigned === "ASSIGNED" && !isAssigned) return false;
    if (filterAssigned === "UNASSIGNED" && isAssigned) return false;

    return true;
  });

  return (
    <div className="flex gap-5 relative min-h-[400px]">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent animate-spin rounded-full" />
            Loading locations...
          </div>
        </div>
      )}
      <div
        className={`flex-1 transition-all ${selectedLocation ? "mr-[21rem]" : ""}`}
      >
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Audit Status
            </label>
            <select
              value={filterScheduled}
              onChange={(e) => setFilterScheduled(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="UNSCHEDULED">Unscheduled</option>
            </select>
          </div>
          {isAdmin && (
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Assignment
              </label>
              <select
                value={filterAssigned}
                onChange={(e) => setFilterAssigned(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Assignments</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="UNASSIGNED">Unassigned</option>
              </select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-sm font-medium text-slate-500">
                <th className="py-3 px-4 font-normal">Location</th>
                <th className="py-3 px-4 font-normal">Audit Status</th>
                <th className="py-3 px-4 font-normal">Schedule Date(s)</th>
                {isAdmin && <th className="py-3 px-4 font-normal">Assigned Auditors</th>}
              </tr>
            </thead>
            <tbody>
              {filteredLocations?.map((loc: any) => {
                const schedules = loc.schedules || [];
                const isScheduled = schedules.length > 0;

                // Calculate range
                let dateDisplay = "-";
                if (isScheduled) {
                  const dates = schedules.map((s: any) =>
                    new Date(s.scheduledDate).getTime(),
                  );
                  const minDate = new Date(Math.min(...dates));
                  const maxDate = new Date(Math.max(...dates));

                  const format = (d: Date) => {
                    const dd = String(d.getDate()).padStart(2, "0");
                    const mm = String(d.getMonth() + 1).padStart(2, "0");
                    const yyyy = d.getFullYear();
                    return `${dd}/${mm}/${yyyy}`;
                  };

                  if (minDate.getTime() === maxDate.getTime()) {
                    dateDisplay = format(minDate);
                  } else {
                    dateDisplay = `${format(minDate)} to ${format(maxDate)}`;
                  }
                }

                const latestSchedule = schedules[0];
                const hasAuditors =
                  isScheduled && latestSchedule.assignedAuditors?.length > 0;

                return (
                  <tr
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 group cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-900">
                        {loc.locationName}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {loc.locationCode}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {isScheduled ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-semibold text-nowrap">
                          Scheduled
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600 font-semibold text-nowrap">
                          Unscheduled
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-mono text-xs whitespace-nowrap">
                      {dateDisplay}
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-4 text-slate-600">
                        {hasAuditors ? (
                          <div className="flex flex-wrap gap-1">
                            {latestSchedule.assignedAuditors.map((a: any) => (
                              <span
                                key={a.id}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100 font-medium"
                              >
                                {a.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredLocations?.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="text-center py-8 text-slate-500">
                    No locations match your filters.
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
        initialLocationId={editingSchedule?.locationId || selectedLocation?.id}
        initialDate={editingSchedule?.startDate || null}
        initialEndDate={editingSchedule?.endDate || null}
        initialAuditorIds={editingSchedule?.auditorIds || []}
        readOnly={false}
      />

      {selectedLocation && !isScheduling && (
        <div className="w-80 absolute right-0 top-0 h-full bg-white border border-slate-200 rounded-xl p-5 shadow-lg animate-in fade-in slide-in-from-right-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 truncate">
                {selectedLocation.locationName}
              </h3>
              <p className="text-sm font-mono text-slate-500">
                {selectedLocation.locationCode}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (selectedLocation.schedules?.length > 0) {
                    const dates = selectedLocation.schedules.map((s: any) =>
                      new Date(s.scheduledDate).getTime(),
                    );
                    const min = new Date(Math.min(...dates));
                    const max = new Date(Math.max(...dates));
                    const auditorIds =
                      selectedLocation.schedules[0].assignedAuditors?.map(
                        (a: any) => a.id,
                      ) || [];

                    setEditingSchedule({
                      locationId: selectedLocation.id,
                      startDate: min,
                      endDate: max,
                      auditorIds: auditorIds,
                    });
                  } else {
                    setIsScheduling(true);
                  }
                }}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                title={
                  selectedLocation.schedules?.length > 0
                    ? "Edit Schedule"
                    : "Create Schedule"
                }
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedLocation(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {selectedLocation.schedules?.length > 0 ? (
              <>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Audit Date Range
                  </h4>
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 font-bold text-sm">
                    {(() => {
                      const dates = selectedLocation.schedules.map((s: any) =>
                        new Date(s.scheduledDate).getTime(),
                      );
                      const minDate = new Date(Math.min(...dates));
                      const maxDate = new Date(Math.max(...dates));
                      const format = (d: Date) => {
                        const dd = String(d.getDate()).padStart(2, "0");
                        const mm = String(d.getMonth() + 1).padStart(2, "0");
                        const yyyy = d.getFullYear();
                        return `${dd}/${mm}/${yyyy}`;
                      };
                      return minDate.getTime() === maxDate.getTime()
                        ? format(minDate)
                        : `${format(minDate)} - ${format(maxDate)}`;
                    })()}
                  </div>
                </div>

                {isAdmin && (
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Assigned Auditors
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLocation.schedules[0].assignedAuditors?.length >
                        0 ? (
                        selectedLocation.schedules[0].assignedAuditors.map(
                          (a: any) => (
                            <div
                              key={a.id}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2"
                            >
                              <div className="w-7 h-7 bg-white rounded-full border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {a.name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-slate-900">
                                  {a.name}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {a.email}
                                </span>
                              </div>
                            </div>
                          ),
                        )
                      ) : (
                        <div className="text-xs italic text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-200 w-full text-center">
                          No auditors assigned
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-10 flex flex-col items-center justify-center text-center px-4 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <p className="text-sm font-medium text-slate-500">
                  No audit scheduled for this location.
                </p>
                <button
                  onClick={() => setIsScheduling(true)}
                  className="mt-3 text-xs text-blue-600 font-bold hover:underline"
                >
                  Schedule Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
