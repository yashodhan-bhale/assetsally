"use client";

import { useQuery } from "@tanstack/react-query";
import {
  FileCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import React, { useState } from "react";

import { api } from "../../../lib/api";

const statusConfig: Record<string, { icon: any; color: string }> = {
  DRAFT: { icon: Clock, color: "bg-slate-500/15 text-slate-400" },
  SUBMITTED: { icon: AlertCircle, color: "bg-amber-500/15 text-amber-400" },
  APPROVED: { icon: CheckCircle2, color: "bg-emerald-500/15 text-emerald-400" },
  REJECTED: { icon: XCircle, color: "bg-red-500/15 text-red-400" },
};

export default function AuditsPage(): React.ReactNode {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["audits", status, page],
    queryFn: () =>
      api.getAudits({
        status: status || undefined,
        page: String(page),
        limit: "20",
      } as any),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Reports</h1>
        <p className="text-slate-400 text-sm mt-1">
          View and review verification audit reports
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["", "DRAFT", "SUBMITTED", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${
                              status === s
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-slate-800/50 text-slate-400 border border-transparent hover:border-slate-700"
                            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data?.reports?.length ? (
        <div className="grid gap-4">
          {data.reports.map((report: any) => {
            const sc = statusConfig[report.status] || statusConfig.DRAFT;
            const StatusIcon = sc.icon;
            return (
              <div
                key={report.id}
                className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-medium">
                      {report.location?.locationName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Auditor: {report.auditor?.name} —{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.color}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {report.status}
                  </div>
                </div>
                <div className="flex items-center_gap-4 text-xs text-slate-500">
                  <span>{report._count?.findings || 0} findings</span>
                  {report.submittedAt && (
                    <span>
                      Submitted:{" "}
                      {new Date(report.submittedAt).toLocaleDateString()}
                    </span>
                  )}
                  {report.reviewedAt && (
                    <span>
                      Reviewed:{" "}
                      {new Date(report.reviewedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-12 text-center">
          <FileCheck className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500">No audit reports found</p>
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.pagination.totalPages}
              className="p-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
