"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Search,
  Check,
  ChevronDown,
  CalendarIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { api } from "../../../../lib/api";

interface ScheduleFormProps {
  initialDate?: Date | null;
  initialEndDate?: Date | null;
  initialLocationId?: string | null;
  initialAuditorIds?: string[];
  onSuccess?: () => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

export function ScheduleForm({
  initialDate,
  initialEndDate,
  initialLocationId,
  initialAuditorIds,
  onSuccess,
  onCancel,
  readOnly = false,
}: ScheduleFormProps) {
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState(
    initialDate ? initialDate.toISOString().split("T")[0] : "",
  );
  const [endDate, setEndDate] = useState(
    initialEndDate
      ? initialEndDate.toISOString().split("T")[0]
      : initialDate
        ? initialDate.toISOString().split("T")[0]
        : "",
  );
  const [locationId, setLocationId] = useState(initialLocationId || "");
  const [auditorIds, setAuditorIds] = useState<string[]>(
    initialAuditorIds || [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Dropdown states
  const [locOpen, setLocOpen] = useState(false);
  const [locSearch, setLocSearch] = useState("");
  const [audOpen, setAudOpen] = useState(false);
  const [audSearch, setAudSearch] = useState("");

  const locRef = useRef<HTMLDivElement>(null);
  const audRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locRef.current && !locRef.current.contains(event.target as Node))
        setLocOpen(false);
      if (audRef.current && !audRef.current.contains(event.target as Node))
        setAudOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: locations, isLoading: isLoadingLocations } = useQuery({
    queryKey: ["audit-schedule-locations"],
    queryFn: () => api.getAuditScheduleLocations(),
  });

  const { data: auditors, isLoading: isLoadingAuditors } = useQuery({
    queryKey: ["audit-schedule-auditors"],
    queryFn: () => api.getAuditScheduleAuditors(),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.createAuditSchedule(data),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    if (!locationId || !startDate || !endDate) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dates = [];

      // Generate array of dates
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString());
      }

      // Clear old schedules for this location first (Every location will have one and only one audit range)
      await api.deleteAuditSchedulesByLocation(locationId);

      // Create schedules sequentially
      for (const date of dates) {
        await mutation.mutateAsync({
          locationId,
          scheduledDate: date,
          assignedAuditorIds: auditorIds,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["audit-schedule-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["audit-schedule-locations"] });
      queryClient.invalidateQueries({ queryKey: ["audit-schedule-auditors"] });
      queryClient.invalidateQueries({ queryKey: ["audit-schedule-summary"] });

      onSuccess?.();

      if (!initialDate) {
        setStartDate("");
        setEndDate("");
      }
      if (!initialLocationId) {
        setLocationId("");
      }
      setAuditorIds([]);
    } catch (error: any) {
      setSubmitError(
        error.message ||
          "Failed to schedule audit. It might be a conflict with an existing schedule.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAuditor = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    setAuditorIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const filteredLocs = locations?.filter(
    (l: any) =>
      l.locationName.toLowerCase().includes(locSearch.toLowerCase()) ||
      l.locationCode.toLowerCase().includes(locSearch.toLowerCase()),
  );

  const filteredAuds = auditors?.filter((a: any) =>
    a.name.toLowerCase().includes(audSearch.toLowerCase()),
  );

  const selectedLocLabel =
    locations?.find((l: any) => l.id === locationId)?.locationName ||
    "Select Location";

  const handleClear = async () => {
    if (!locationId || readOnly) return;
    if (
      !confirm(
        "Are you sure you want to clear all scheduled audits for this location?",
      )
    )
      return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await api.deleteAuditSchedulesByLocation(locationId);
      queryClient.invalidateQueries({ queryKey: ["audit-schedule-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["audit-schedule-locations"] });
      queryClient.invalidateQueries({ queryKey: ["audit-schedule-auditors"] });
      queryClient.invalidateQueries({ queryKey: ["audit-schedule-summary"] });
      onSuccess?.();
      setStartDate("");
      setEndDate("");
      setAuditorIds([]);
      if (!initialLocationId) setLocationId("");
    } catch (error: any) {
      setSubmitError(error.message || "Failed to clear schedule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white border border-slate-200 rounded-lg p-5 text-left"
    >
      <h4 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 flex justify-between items-center">
        <span>{readOnly ? "View Audit Schedule" : "Schedule New Audit"}</span>
        {locationId && !readOnly && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isSubmitting}
            className="text-[10px] bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded transition-colors font-bold uppercase tracking-wider"
          >
            Clear Schedule
          </button>
        )}
      </h4>

      {submitError && (
        <div className="p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Start Date
          </label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (endDate < e.target.value) setEndDate(e.target.value);
            }}
            disabled={!!initialDate || readOnly}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 disabled:opacity-70 disabled:bg-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            End Date
          </label>
          <input
            type="date"
            required
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={!!initialDate || readOnly}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 disabled:opacity-70 disabled:bg-slate-100"
          />
        </div>
      </div>

      <div ref={locRef} className="relative">
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Location
        </label>
        <button
          type="button"
          onClick={() =>
            !readOnly &&
            !initialLocationId &&
            !isLoadingLocations &&
            setLocOpen(!locOpen)
          }
          disabled={!!initialLocationId || isLoadingLocations || readOnly}
          className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none disabled:opacity-70 disabled:bg-slate-100"
        >
          <span className="truncate">
            {isLoadingLocations ? "Loading..." : selectedLocLabel}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        {locOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-slate-100">
              <div className="flex items-center px-2 bg-slate-50 border border-slate-200 rounded">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={locSearch}
                  onChange={(e) => setLocSearch(e.target.value)}
                  placeholder="Search location..."
                  className="w-full bg-transparent border-none focus:ring-0 text-sm py-1.5 px-2 text-slate-800"
                />
              </div>
            </div>
            <div className="overflow-y-auto p-1">
              {filteredLocs?.length === 0 ? (
                <div className="p-2 text-xs text-slate-500 text-center">
                  No locations found.
                </div>
              ) : (
                filteredLocs?.map((loc: any) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      setLocationId(loc.id);
                      setLocOpen(false);
                      setLocSearch("");
                    }}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-slate-100 flex items-center justify-between group"
                  >
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-medium group-hover:text-blue-600 transition-colors">
                        {loc.locationName}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {loc.locationCode}
                      </span>
                    </div>
                    {locationId === loc.id && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div ref={audRef} className="relative">
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Assign Auditors (Optional)
        </label>
        <button
          type="button"
          onClick={() =>
            !readOnly && !isLoadingAuditors && setAudOpen(!audOpen)
          }
          disabled={isLoadingAuditors || readOnly}
          className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none disabled:opacity-70 disabled:bg-slate-100 min-h-[38px] h-auto"
        >
          <div className="flex flex-wrap gap-1 items-center">
            {isLoadingAuditors ? (
              "Loading..."
            ) : auditorIds.length > 0 ? (
              auditorIds.map((id) => {
                const a = auditors?.find((x: any) => x.id === id);
                if (!a) return null;
                return (
                  <span
                    key={id}
                    className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                  >
                    {a.name}
                    {!readOnly && (
                      <span
                        onClick={(e) => toggleAuditor(id, e)}
                        className="hover:bg-blue-200 rounded-full w-3 h-3 flex items-center justify-center cursor-pointer"
                      >
                        ×
                      </span>
                    )}
                  </span>
                );
              })
            ) : (
              <span className="text-slate-500">Select Auditor(s)</span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
        </button>

        {audOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-slate-100">
              <div className="flex items-center px-2 bg-slate-50 border border-slate-200 rounded">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={audSearch}
                  onChange={(e) => setAudSearch(e.target.value)}
                  placeholder="Search auditors..."
                  className="w-full bg-transparent border-none focus:ring-0 text-sm py-1.5 px-2 text-slate-800"
                />
              </div>
            </div>
            <div className="overflow-y-auto p-1">
              {filteredAuds?.length === 0 ? (
                <div className="p-2 text-xs text-slate-500 text-center">
                  No auditors found.
                </div>
              ) : (
                filteredAuds?.map((aud: any) => (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={(e) => toggleAuditor(aud.id, e)}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-slate-100 flex items-center gap-2 group"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${auditorIds.includes(aud.id) ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white group-hover:border-blue-400"}`}
                    >
                      {auditorIds.includes(aud.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-medium">
                        {aud.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {aud.email}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            {readOnly ? "Close" : "Cancel"}
          </button>
        )}
        {!readOnly && (
          <button
            type="submit"
            disabled={isSubmitting || (!initialLocationId && !locationId)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm transition-colors flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Schedule"
            )}
          </button>
        )}
      </div>
    </form>
  );
}
