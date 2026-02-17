"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { api } from "../../../lib/api";

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["assets", search, page],
    queryFn: () =>
      api.getInventory({
        search: search || undefined,
        page: String(page),
        limit: "20",
      } as any),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Assets</h1>
        <p className="text-slate-400 text-sm mt-1">
          {data?.pagination?.total || 0} registered assets
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search assets..."
          className="w-full bg-slate-900/80 border border-slate-800/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
        />
      </div>

      <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/50 bg-slate-800/20">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">
                  Code
                </th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">
                  Location
                </th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : data?.items?.length ? (
                data.items.map((item: any) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-slate-800/50 px-2 py-0.5 rounded text-emerald-300">
                        {item.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {item.location?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {item.category?.name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          item.qrTag
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-slate-500/15 text-slate-400"
                        }`}
                      >
                        {item.qrTag ? "Tagged" : "Untagged"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No assets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/50">
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
    </div>
  );
}
