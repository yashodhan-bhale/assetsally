"use client";

import {
  FileText,
  Filter,
  Calendar,
  ChevronDown,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import React, { useState } from "react";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("Feb 1 - Feb 28, 2026");
  const [selectedZone, setSelectedZone] = useState("All Zones");
  const [selectedAuditor, setSelectedAuditor] = useState("Select Auditor");

  const reportData = [
    {
      zone: "Amravati Zone",
      totalAssets: 8272,
      verified: 7610,
      discrepancy: 150,
      compliance: "92%",
    },
    {
      zone: "Karad Zone",
      totalAssets: 1906,
      verified: 858,
      discrepancy: 50,
      compliance: "45%",
    },
    {
      zone: "Nagpur Zone",
      totalAssets: 500,
      verified: 75,
      discrepancy: 24,
      compliance: "15%",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Reports Engine
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Parameters */}
        <aside className="w-full lg:w-80 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6 text-slate-900 font-semibold">
              <Filter size={18} className="text-slate-500" />
              <h2>Report Parameters</h2>
            </div>

            <div className="space-y-6">
              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Date Range
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={dateRange}
                    readOnly
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-10 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <Calendar
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {/* Zone / Region */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Zone / Region
                </label>
                <div className="relative">
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-10 py-2 text-sm text-slate-600 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option>All Zones</option>
                    <option>Amravati Zone</option>
                    <option>Karad Zone</option>
                    <option>Nagpur Zone</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">
                  Status
                </label>
                <div className="space-y-2">
                  {[
                    { label: "Verified", color: "bg-green-500" },
                    { label: "Missing", color: "bg-red-500" },
                    { label: "Discrepancy", color: "bg-orange-500" },
                    { label: "Pending Audit", color: "bg-slate-400" },
                  ].map((status) => (
                    <div key={status.label} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`status-${status.label}`}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`status-${status.label}`}
                        className="text-sm text-slate-600"
                      >
                        {status.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auditor */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Auditor
                </label>
                <div className="relative">
                  <select
                    value={selectedAuditor}
                    onChange={(e) => setSelectedAuditor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-10 py-2 text-sm text-slate-600 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option>Select Auditor</option>
                    <option>Admin User</option>
                    <option>Demo Auditor</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              <button className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-medium py-2.5 rounded-lg transition-colors mt-4 shadow-sm">
                Generate Report
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content - Report Preview */}
        <main className="flex-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Executive Summary
                </h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-3">
                  <div className="text-xs text-slate-400">
                    Report Type:{" "}
                    <span className="text-slate-600 font-medium">
                      Verification Status
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Generated By:{" "}
                    <span className="text-slate-600 font-medium">
                      Admin User
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Period:{" "}
                    <span className="text-slate-600 font-medium">
                      Feb 1 - Feb 28, 2026
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Scope:{" "}
                    <span className="text-slate-600 font-medium">
                      All Zones
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors">
                  <Printer size={16} />
                  Export PDF
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-green-600 text-green-700 hover:bg-green-50 text-sm font-medium rounded-lg transition-colors">
                  <FileSpreadsheet size={16} />
                  Export Excel
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-indigo-900">
                  Zone Performance Breakdown
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-indigo-900 border-b border-slate-200">
                        Zone
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-indigo-900 border-b border-slate-200">
                        Total Assets
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-indigo-900 border-b border-slate-200">
                        Verified
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-indigo-900 border-b border-slate-200">
                        Discrepancy
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-indigo-900 border-b border-slate-200 border-r-0">
                        Compliance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-4 text-sm text-slate-600 font-medium">
                          {row.zone}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {row.totalAssets}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {row.verified}
                        </td>
                        <td className="px-4 py-4 text-sm text-orange-500 font-medium">
                          {row.discrepancy}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-900 font-bold">
                          {row.compliance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs text-slate-400 italic">
                  * This is a preview. Detailed line items will be included in
                  the export.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
