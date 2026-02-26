"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  QrCode,
  Plus,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Archive,
  FileText,
  CheckCircle2,
} from "lucide-react";
import React, { useState } from "react";

import { RoleGuard } from "../../../components/auth/role-guard";
import { api } from "../../../lib/api";
import { UserRole } from "../../../lib/rbac";
import { cn } from "../../../lib/utils";

const QrCodeIcon = QrCode as any;
const PlusIcon = Plus as any;
const ChevronLeftIcon = ChevronLeft as any;
const ChevronRightIcon = ChevronRight as any;
const DownloadIcon = Download as any;
const RefreshIcon = RefreshCw as any;
const ArchiveIcon = Archive as any;
const CheckCircle2Icon = CheckCircle2 as any;
const FileTextIcon = FileText as any;

const statusColors: Record<string, string> = {
  UNASSIGNED: "bg-slate-100 text-slate-600 border border-slate-200",
  ASSIGNED: "bg-emerald-50 border border-emerald-100 text-emerald-700",
  RETIRED: "bg-red-50 border border-red-100 text-red-700",
};

const jobStatusColors: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-600 border border-slate-200",
  GENERATING: "bg-blue-50 border border-blue-100 text-blue-700",
  READY: "bg-emerald-50 border border-emerald-100 text-emerald-700",
  DOWNLOADED: "bg-purple-50 border border-purple-100 text-purple-700",
  FAILED: "bg-red-50 border border-red-100 text-red-700",
};

export default function QrGeneratorPage() {
  const [activeTab, setActiveTab] = useState<"TAGS" | "JOBS">("TAGS");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genCount, setGenCount] = useState(1500);
  const [genBaseUrl, setGenBaseUrl] = useState(
    typeof window !== "undefined"
      ? `${window.location.origin}/q`
      : "https://myapp.com/q",
  );
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["qr-tags", status, page],
    queryFn: () => {
      const params: Record<string, string> = {
        page: String(page),
        limit: "25",
      };
      if (status) params.status = status;
      return api.getQrTags(params);
    },
    enabled: activeTab === "TAGS",
  });

  const { data: jobs } = useQuery({
    queryKey: ["qr-jobs"],
    queryFn: () => api.getQrJobs(),
    refetchInterval: activeTab === "JOBS" ? 5000 : false, // Poll every 5s on Jobs tab
    enabled: activeTab === "JOBS",
  });

  const { data: batches } = useQuery({
    queryKey: ["qr-batches", expandedJob],
    queryFn: () => api.getQrBatches(expandedJob as string),
    refetchInterval: expandedJob ? 3000 : false,
    enabled: !!expandedJob && activeTab === "JOBS",
  });

  const generateMutation = useMutation({
    mutationFn: () => api.initiateQrBatch(genBaseUrl, genCount),
    onSuccess: (data: { jobId?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["qr-jobs"] });
      setShowGenerate(false);
      setActiveTab("JOBS");

      if (data?.jobId) {
        setExpandedJob(data.jobId);
      }

      setSuccessMessage(
        "Batch generation initiated! You can monitor the progress below.",
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    },
  });

  const generatePdfMutation = useMutation({
    mutationFn: (batchId: string) => api.generateBatchPdf(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr-batches", expandedJob] });
    },
  });

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">QR Generator</h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage QR code tags for asset verification and bulk generation
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab("TAGS")}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeTab === "TAGS"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Inventory Tags
            </button>
            <button
              onClick={() => setActiveTab("JOBS")}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeTab === "JOBS"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Generation Jobs
            </button>
          </div>
        </div>

        {activeTab === "TAGS" && (
          <div className="flex justify-end mb-4">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
                }/qr-tags/export-bindings?token=${api.getToken()}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors border border-slate-200 shadow-sm"
            >
              <DownloadIcon className="w-4 h-4" /> Export Bound QRs
            </a>
          </div>
        )}

        {activeTab === "JOBS" && (
          <div className="mb-4 space-y-4">
            {successMessage && (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <CheckCircle2Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{successMessage}</span>
              </div>
            )}
            <button
              onClick={() => setShowGenerate(!showGenerate)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <PlusIcon className="w-4 h-4" /> New Batch Request
            </button>
          </div>
        )}

        {/* Generate Form */}
        {showGenerate && activeTab === "JOBS" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Submit Bulk QR Generation Request (A4 PDFs, 10/sheet)
            </h3>
            <div className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-slate-500 mb-1.5 font-medium">
                  Base Validation URL
                </label>
                <input
                  type="text"
                  value={genBaseUrl}
                  onChange={(e) => setGenBaseUrl(e.target.value)}
                  placeholder="https://yourapp.com/q"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5 font-medium">
                  Total Tags Expected
                </label>
                <input
                  type="number"
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  min={1}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-mono"
                />
              </div>
              <button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm disabled:opacity-50"
              >
                {generateMutation.isPending ? "Submitting..." : "Submit Job"}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-4 italic">
              Large distributions will naturally chunk into 500-tag sub-batches
              for buffered PDF downloading.
            </p>
          </div>
        )}

        {/* --- JOBS TAB CONTENT --- */}
        {activeTab === "JOBS" && (
          <div className="space-y-4">
            {jobs?.map(
              (job: {
                id: string;
                status: string;
                totalCount: number;
                baseUrl: string;
                createdAt: string;
                batchSize: number;
                _count?: { batches: number };
              }) => (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
                    onClick={() =>
                      setExpandedJob(expandedJob === job.id ? null : job.id)
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <ArchiveIcon className="w-5 h-5 text-blue-500" />
                        <h4 className="text-slate-900 font-semibold truncate">
                          Job: {job.id.substring(0, 8)}
                        </h4>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${jobStatusColors[job.status] ||
                            "bg-slate-100 text-slate-600"
                            }`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 truncate font-medium">
                        <span>{job.totalCount} tags</span>
                        <span className="text-slate-300">•</span>
                        <span className="truncate">{job.baseUrl}</span>
                        <span className="text-slate-300">•</span>
                        <span>{new Date(job.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right hidden sm:block">
                        <span className="text-sm font-semibold text-slate-900">
                          {job._count?.batches ||
                            Math.ceil(job.totalCount / job.batchSize)}
                        </span>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                          Batches
                        </p>
                      </div>
                      <ChevronRightIcon
                        className={cn(
                          "w-5 h-5 text-slate-300 transition-transform duration-200",
                          expandedJob === job.id
                            ? "rotate-90 text-blue-500"
                            : "",
                        )}
                      />
                    </div>
                  </div>

                  {/* Expanded Batches View */}
                  {expandedJob === job.id && (
                    <div className="border-t border-slate-100 bg-white p-0 overflow-hidden">
                      <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Sub-Batch
                              </th>
                              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Capacity
                              </th>
                              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Status
                              </th>
                              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {batches?.map(
                              (batch: {
                                id: string;
                                batchNumber: number;
                                count: number;
                                status: string;
                              }) => (
                                <tr
                                  key={batch.id}
                                  className="hover:bg-slate-50/50 transition-colors"
                                >
                                  <td className="p-4">
                                    <span className="text-sm text-slate-700 font-semibold">
                                      Batch {batch.batchNumber}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className="text-sm text-slate-500 font-mono">
                                      {batch.count} tags
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span
                                      className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border ${jobStatusColors[batch.status] ||
                                        "bg-slate-100 text-slate-600 border-slate-200"
                                        }`}
                                    >
                                      {batch.status}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                      {batch.status === "READY" ||
                                        batch.status === "DOWNLOADED" ? (
                                        <>
                                          <a
                                            href={`${api.getBatchDownloadUrl(
                                              batch.id,
                                            )}?token=${api.getToken()}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={() => {
                                              setTimeout(
                                                () =>
                                                  queryClient.invalidateQueries(
                                                    {
                                                      queryKey: [
                                                        "qr-batches",
                                                        expandedJob,
                                                      ],
                                                    },
                                                  ),
                                                2000,
                                              );
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold rounded-lg transition-all shadow-sm"
                                          >
                                            <DownloadIcon className="w-3.5 h-3.5" />{" "}
                                            Download
                                          </a>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              generatePdfMutation.mutate(
                                                batch.id,
                                              );
                                            }}
                                            disabled={
                                              generatePdfMutation.isPending
                                            }
                                            className="inline-flex items-center justify-center p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-all border border-slate-200 disabled:opacity-50"
                                            title="Regenerate PDF"
                                          >
                                            <RefreshIcon
                                              className={cn(
                                                "w-4 h-4",
                                                generatePdfMutation.isPending &&
                                                  generatePdfMutation.variables ===
                                                  batch.id
                                                  ? "animate-spin"
                                                  : "",
                                              )}
                                            />
                                          </button>
                                        </>
                                      ) : batch.status === "GENERATING" ? (
                                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg animate-pulse border border-blue-100">
                                          <RefreshIcon className="w-3.5 h-3.5 animate-spin" />{" "}
                                          Rendering...
                                        </span>
                                      ) : (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            generatePdfMutation.mutate(
                                              batch.id,
                                            );
                                          }}
                                          disabled={
                                            generatePdfMutation.isPending
                                          }
                                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold rounded-lg transition-all shadow-sm disabled:opacity-50"
                                        >
                                          {generatePdfMutation.isPending &&
                                            generatePdfMutation.variables ===
                                            batch.id ? (
                                            <RefreshIcon className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <FileTextIcon className="w-3.5 h-3.5" />
                                          )}
                                          Generate PDF
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ),
                            )}
                            {!batches && (
                              <tr>
                                <td colSpan={4} className="p-12 text-center">
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-slate-500 text-sm font-medium">
                                      Loading batches...
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ),
            )}
            {jobs?.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <ArchiveIcon className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-semibold mb-1">
                  No generation jobs yet
                </h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  Click the button above to start your first bulk QR code
                  generation request.
                </p>
              </div>
            )}
          </div>
        )}

        {/* --- TAGS TAB CONTENT --- */}
        {activeTab === "TAGS" && (
          <>
            {/* Filters */}
            <div className="flex gap-2 mb-2 p-1 bg-slate-100 rounded-xl w-fit border border-slate-200 shadow-sm">
              {["", "UNASSIGNED", "ASSIGNED", "RETIRED"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    setPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                               ${status === s
                      ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  {s || "All Tags"}
                </button>
              ))}
            </div>

            {/* Tags Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-slate-500 font-medium">
                  Fetching inventory tags...
                </span>
              </div>
            ) : data?.tags?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {data.tags.map(
                  (tag: {
                    id: string;
                    code: string;
                    status: string;
                    binding?: {
                      item: { assetName: string; assetNumber: string };
                    };
                  }) => (
                    <div
                      key={tag.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:ring-4 hover:ring-blue-500/5 transition-all shadow-sm group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                            <QrCodeIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                          <span className="font-mono text-sm text-slate-900 font-bold tracking-tight">
                            {tag.code}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${statusColors[tag.status] || statusColors.UNASSIGNED
                            }`}
                        >
                          {tag.status}
                        </span>
                      </div>
                      {tag.binding?.item ? (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                              Bound Asset
                            </p>
                          </div>
                          <p className="text-sm text-slate-800 font-bold truncate group-hover:text-blue-600 transition-colors">
                            {tag.binding.item.assetName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            #{tag.binding.item.assetNumber}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                          <span className="text-xs text-slate-400 font-medium">
                            Ready for deployment
                          </span>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <QrCodeIcon className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-semibold mb-1">
                  No tags found
                </h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  We couldn&apos;t find any tags matching your current filter.
                </p>
              </div>
            )}

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <span className="text-xs text-slate-500">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 border border-slate-200"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= data.pagination.totalPages}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 border border-slate-200"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </RoleGuard>
  );
}
