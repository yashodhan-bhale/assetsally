"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

import { api } from "../../../../../lib/api";

export function AuditCalendar({
  onDayClick,
}: {
  onDayClick?: (date: Date) => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["audit-schedule-calendar"],
    queryFn: () => api.getAuditScheduleCalendar(),
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days = [];

  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i),
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
  }

  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">
          {firstDayOfMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 text-slate-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent animate-spin rounded-full" />
              Loading calendar...
            </div>
          </div>
        )}
        {days.map((d, i) => {
          const daySchedules =
            schedules?.filter((s: any) => {
              const sd = new Date(s.scheduledDate);
              return (
                sd.getUTCDate() === d.date.getUTCDate() &&
                sd.getUTCMonth() === d.date.getUTCMonth() &&
                sd.getUTCFullYear() === d.date.getUTCFullYear()
              );
            }) || [];

          return (
            <div
              key={i}
              className={`min-h-[120px] p-2 border-b border-r border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer group ${!d.isCurrentMonth ? "opacity-40 bg-slate-50/50" : "bg-white"}`}
              onClick={() => onDayClick?.(d.date)}
            >
              <div className="flex justify-between items-start">
                <span
                  className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${d.isCurrentMonth ? "text-slate-900" : "text-slate-500"} ${new Date().toDateString() === d.date.toDateString() ? "bg-blue-600 text-white" : ""}`}
                >
                  {d.day}
                </span>
              </div>

              <div className="mt-2 space-y-1">
                {daySchedules.map((schedule: any) => (
                  <div
                    key={schedule.id}
                    className="text-[11px] p-2 bg-blue-50 border border-blue-100 rounded shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="font-bold text-blue-800 truncate">
                      {schedule.location.locationName}
                    </div>
                    <div className="text-[10px] text-blue-600 font-medium truncate mb-1">
                      {schedule.location.locationCode}
                    </div>
                    <div className="text-[9px] text-slate-500 truncate border-t border-blue-100 pt-1">
                      {schedule.assignedAuditors
                        ?.map((a: any) => a.name)
                        .join(", ") || "Unassigned"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
