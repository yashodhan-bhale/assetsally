"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  Users,
  Calendar as CalendarIcon,
  Edit2,
} from "lucide-react";
import { useState } from "react";

import { api } from "../../../../lib/api";
import { AuditScheduleModal } from "../components/AuditScheduleModal";

import { AuditCalendar } from "./components/AuditCalendar";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);

  const { data: schedules } = useQuery({
    queryKey: ["audit-schedule-calendar"],
    queryFn: () => api.getAuditScheduleCalendar(),
  });

  const auditsOnSelectedDate =
    schedules
      ?.filter((s: any) => {
        if (!selectedDate) return false;
        const sd = new Date(s.scheduledDate);
        return (
          sd.getUTCDate() === selectedDate.getUTCDate() &&
          sd.getUTCMonth() === selectedDate.getUTCMonth() &&
          sd.getUTCFullYear() === selectedDate.getUTCFullYear()
        );
      })
      .filter((s: any) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          s.location?.locationName?.toLowerCase().includes(query) ||
          s.location?.locationCode?.toLowerCase().includes(query) ||
          s.assignedAuditors?.some((a: any) =>
            a.name.toLowerCase().includes(query),
          )
        );
      }) || [];

  return (
    <div className="flex gap-5 relative min-h-[600px]">
      <div
        className={`flex-1 transition-all ${selectedDate ? "mr-[25rem]" : ""}`}
      >
        <AuditCalendar
          onDayClick={(date) => {
            setSelectedDate(date);
            setExpandedAuditId(null);
          }}
        />
      </div>

      <AuditScheduleModal
        isOpen={!!editingSchedule}
        onClose={() => setEditingSchedule(null)}
        initialDate={
          editingSchedule ? new Date(editingSchedule.scheduledDate) : null
        }
        initialLocationId={editingSchedule?.locationId}
        readOnly={false} // Requirement says "editing... should be possible", implying write access
      />

      {selectedDate && (
        <div className="w-96 absolute right-0 top-0 h-full bg-white border border-slate-200 rounded-xl p-5 shadow-xl animate-in fade-in slide-in-from-right-8 flex flex-col">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">
                {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
              </h3>
              <p className="text-sm text-slate-500">
                {selectedDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="mb-4 relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search audits, locations, auditors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {auditsOnSelectedDate.length > 0 ? (
              auditsOnSelectedDate.map((audit: any) => (
                <div
                  key={audit.id}
                  className={`border rounded-xl transition-all duration-200 overflow-hidden ${expandedAuditId === audit.id ? "border-blue-200 bg-blue-50/30" : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"}`}
                >
                  <button
                    onClick={() =>
                      setExpandedAuditId(
                        expandedAuditId === audit.id ? null : audit.id,
                      )
                    }
                    className="w-full text-left p-4 flex items-start justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {audit.location?.locationCode}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 truncate">
                        {audit.location?.locationName}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSchedule(audit);
                        }}
                        className="p-1.5 hover:bg-white rounded-md text-slate-400 hover:text-blue-600 transition-colors shadow-sm border border-transparent hover:border-blue-100"
                        title="Edit Schedule"
                      >
                        <Edit2 size={14} />
                      </button>
                      {expandedAuditId === audit.id ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {expandedAuditId === audit.id && (
                    <div className="px-4 pb-4 pt-0 border-t border-blue-100/50 animate-in slide-in-from-top-1 duration-200">
                      <div className="grid gap-4 mt-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                            <CalendarIcon className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Date Range
                            </p>
                            <p className="text-sm font-bold text-blue-600">
                              {(() => {
                                const related = schedules?.filter(
                                  (s: any) => s.locationId === audit.locationId,
                                );
                                if (!related || related.length === 0)
                                  return "N/A";
                                const dates = related.map((s: any) =>
                                  new Date(s.scheduledDate).getTime(),
                                );
                                const min = new Date(Math.min(...dates));
                                const max = new Date(Math.max(...dates));
                                const format = (d: Date) => {
                                  const dd = String(d.getDate()).padStart(
                                    2,
                                    "0",
                                  );
                                  const mm = String(d.getMonth() + 1).padStart(
                                    2,
                                    "0",
                                  );
                                  const yyyy = d.getFullYear();
                                  return `${dd}/${mm}/${yyyy}`;
                                };
                                return min.getTime() === max.getTime()
                                  ? format(min)
                                  : `${format(min)} - ${format(max)}`;
                              })()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                            <MapPin className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Location
                            </p>
                            <p className="text-sm font-semibold text-slate-700">
                              {audit.location?.locationName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {audit.location?.locationCode}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                            <Users className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Auditors
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {audit.assignedAuditors &&
                              audit.assignedAuditors.length > 0 ? (
                                audit.assignedAuditors.map((a: any) => (
                                  <span
                                    key={a.id}
                                    className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-xs rounded-md shadow-sm font-medium"
                                  >
                                    {a.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs italic text-slate-400">
                                  None assigned
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {audit.notes && (
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                              <Edit2 className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Notes
                              </p>
                              <p className="text-sm text-slate-600 leading-relaxed italic">
                                &quot;{audit.notes}&quot;
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <CalendarIcon className="w-8 h-8 text-slate-300" />
                </div>
                <h5 className="text-slate-900 font-bold">No audits found</h5>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : "There are no audits scheduled for this date."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
