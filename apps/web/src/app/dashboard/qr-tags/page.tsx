"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QrCode, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";

import { RoleGuard } from "../../../components/auth/role-guard";
import { api } from "../../../lib/api";
import { UserRole } from "../../../lib/rbac";

const statusColors: Record<string, string> = {
  UNASSIGNED: "bg-slate-500/15 text-slate-400",
  ASSIGNED: "bg-emerald-500/15 text-emerald-400",
  RETIRED: "bg-red-500/15 text-red-400",
};

export default function QrTagsPage(): React.ReactNode {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genCount, setGenCount] = useState(10);
  const [genPrefix, setGenPrefix] = useState("QR");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["qr-tags", status, page],
    queryFn: () =>
      api.getQrTags({
        status: status || undefined,
        page: String(page),
        limit: "25",
      } as any),
  });

  const generateMutation = useMutation({
    mutationFn: () => api.generateQrBatch(genCount, genPrefix),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr-tags"] });
      setShowGenerate(false);
    },
  });

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">QR Tags</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage QR code tags for asset verification
            </p>
          </div>
          <button
            onClick={() => setShowGenerate(!showGenerate)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Generate Batch
          </button>
        </div>

        {/* Generate Form */}
        {showGenerate && (
          <div className="bg-slate-900/80 border border-blue-500/20 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">
              Generate QR Tag Batch
            </h3>
            <div className="flex gap-4 items-end flex-wrap">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Count
                </label>
                <input
                  type="number"
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  min={1}
                  max={500}
                  className="w-24 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Prefix
                </label>
                <input
                  type="text"
                  value={genPrefix}
                  onChange={(e) => setGenPrefix(e.target.value)}
                  className="w-24 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {generateMutation.isPending ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2">
          {["", "UNASSIGNED", "ASSIGNED", "RETIRED"].map((s) => (
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

        {/* Tags Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data?.tags?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {data.tags.map((tag: any) => (
              <div
                key={tag.id}
                className="bg-slate-900/80 border border-slate-800/50 rounded-xl p-4 hover:border-slate-700/50 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-slate-500" />
                    <span className="font-mono text-sm text-white font-medium">
                      {tag.code}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[tag.status] || statusColors.UNASSIGNED}`}
                  >
                    {tag.status}
                  </span>
                </div>
                {tag.linkedItem && (
                  <p className="text-xs text-slate-400 mt-1 truncate">
                    → {tag.linkedItem.name} ({tag.linkedItem.code})
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-12 text-center">
            <QrCode className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">No QR tags found</p>
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
    </RoleGuard>
  );
}
