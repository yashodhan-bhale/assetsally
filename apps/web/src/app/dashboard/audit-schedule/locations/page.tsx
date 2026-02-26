"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";

import { api } from "../../../../lib/api";
import { ScheduleForm } from "../components/ScheduleForm";

export default function LocationsPage() {
  const [filterScheduled, setFilterScheduled] = useState("ALL");
  const [filterAssigned, setFilterAssigned] = useState("ALL");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const { data: locations, isLoading } = useQuery({
    queryKey: ["audit-schedule-locations"],
    queryFn: () => api.getAuditScheduleLocations(),
  });

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
    <div className="flex gap-6 relative min-h-[400px]">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent animate-spin rounded-full" />
            Loading locations...
          </div>
        </div>
      )}
      <div
        className={`flex-1 transition-all ${selectedLocation ? "mr-80" : ""}`}
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
        </div>

        <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-sm font-medium text-slate-500">
                <th className="py-3 px-4 font-normal">Location</th>
                <th className="py-3 px-4 font-normal">Audit Status</th>
                <th className="py-3 px-4 font-normal">Schedule Date(s)</th>
                <th className="py-3 px-4 font-normal">Assigned Auditors</th>
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

                  const format = (d: Date) => d.toLocaleDateString("en-GB"); // DD/MM/YYYY

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
                        <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                          Scheduled
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600 font-semibold">
                          Unscheduled
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-mono text-xs whitespace-nowrap">
                      {dateDisplay}
                    </td>
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
                  </tr>
                );
              })}
              {filteredLocations?.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500">
                    No locations match your filters.
                  </td>
                </tr>
              )}
              {isLoading &&
                (!filteredLocations || filteredLocations.length === 0) && (
                  <tr>
                    <td colSpan={4} className="text-center py-20"></td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLocation && (
        <div className="w-80 absolute right-0 top-0 h-full bg-white border border-slate-200 rounded-xl p-5 shadow-lg animate-in fade-in slide-in-from-right-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedLocation.locationName}
              </h3>
              <p className="text-sm font-mono text-slate-500">
                {selectedLocation.locationCode}
              </p>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <ScheduleForm
            initialLocationId={selectedLocation.id}
            onSuccess={() => setSelectedLocation(null)}
            onCancel={() => setSelectedLocation(null)}
          />
        </div>
      )}
    </div>
  );
}
