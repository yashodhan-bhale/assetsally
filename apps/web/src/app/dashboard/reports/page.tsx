"use client";

import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
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
  Loader2,
  TrendingUp,
  Package,
  QrCode,
  DollarSign,
} from "lucide-react";
import React, { useState, useMemo } from "react";

import { DataTable } from "../../../components/ui/data-table";
import { api } from "../../../lib/api";

const LoaderIcon: any = Loader2;
const DownloadIcon: any = Download;
const PackageIcon: any = Package;
const DollarSignIcon: any = DollarSign;
const TrendingUpIcon: any = TrendingUp;
const QrCodeIcon: any = QrCode;

interface InventoryItem {
  id: string;
  assetNumber: string;
  assetName: string;
  acquisitionCost?: number;
  netBookValue?: number;
  inventoryStatus?: string;
  quantityAsPerBooks?: number;
  quantityAsPerPhysical?: number;
  quantityDifference?: number;
  location?: { id: string; locationName: string; locationCode: string };
  category?: { id: string; name: string };
  QRBindingRecord?: any[];
}

interface LocationStat {
  name: string;
  count: number;
  asPerBooks: number;
  asPerPhysical: number;
  difference: number;
  foundOk: number;
  discrepancies: number;
}

const locationColumns: ColumnDef<LocationStat>[] = [
  {
    accessorKey: "name",
    header: "Location",
    cell: ({ row }) => (
      <div className="font-medium text-slate-900">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "count",
    header: "Asset Count",
    cell: ({ row }) => <div className="text-right">{row.original.count}</div>,
  },
  {
    accessorKey: "asPerBooks",
    header: "As per Books",
    cell: ({ row }) => (
      <div className="text-right">{row.original.asPerBooks}</div>
    ),
  },
  {
    accessorKey: "asPerPhysical",
    header: "As per Physical",
    cell: ({ row }) => (
      <div className="text-right">{row.original.asPerPhysical}</div>
    ),
  },
  {
    accessorKey: "difference",
    header: "Difference",
    cell: ({ row }) => (
      <div
        className={`text-right font-medium ${
          row.original.difference !== 0 ? "text-red-600" : "text-slate-600"
        }`}
      >
        {row.original.difference}
      </div>
    ),
  },
  {
    accessorKey: "foundOk",
    header: "Total Found OK",
    cell: ({ row }) => (
      <div className="text-right text-green-600 font-bold">
        {row.original.foundOk}
      </div>
    ),
  },
  {
    accessorKey: "discrepancies",
    header: "Total Discrepancies",
    cell: ({ row }) => (
      <div className="text-right text-orange-600 font-bold">
        {row.original.discrepancies}
      </div>
    ),
  },
];

export default function ReportsPage() {
  // Fetch all inventory items (assuming reasonable volume for reports processing)
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["inventory-reports"],
    queryFn: () => api.getInventory({ limit: "10000" }),
  });

  const items = useMemo(() => {
    if (!inventoryData) return [];
    return (inventoryData.items || inventoryData) as InventoryItem[];
  }, [inventoryData]);

  // Process data for reports
  const stats = useMemo(() => {
    const totalAssets = items.length;
    const totalCost = items.reduce(
      (sum, item) => sum + (Number(item.acquisitionCost) || 0),
      0,
    );
    const totalNBV = items.reduce(
      (sum, item) => sum + (Number(item.netBookValue) || 0),
      0,
    );
    const qrBound = items.filter(
      (item) => item.QRBindingRecord && item.QRBindingRecord.length > 0,
    ).length;
    const qrCompliance = totalAssets > 0 ? (qrBound / totalAssets) * 100 : 0;

    // Location breakdown
    const locationMap = new Map<string, LocationStat>();
    items.forEach((item) => {
      const locName = item.location?.locationName || "Unassigned";
      const existing = locationMap.get(locName) || {
        name: locName,
        count: 0,
        asPerBooks: 0,
        asPerPhysical: 0,
        difference: 0,
        foundOk: 0,
        discrepancies: 0,
      };

      existing.count += 1;
      existing.asPerBooks += Number(item.quantityAsPerBooks) || 0;
      existing.asPerPhysical += Number(item.quantityAsPerPhysical) || 0;
      existing.difference += Number(item.quantityDifference) || 0;

      const status = item.inventoryStatus?.trim() || "";
      if (status.toLowerCase() === "found ok") {
        existing.foundOk += 1;
      } else if (status !== "") {
        existing.discrepancies += 1;
      }

      locationMap.set(locName, existing);
    });

    // Category breakdown
    const categoryMap = new Map<string, any>();
    items.forEach((item) => {
      const catName = item.category?.name || "Uncategorized";
      const existing = categoryMap.get(catName) || {
        name: catName,
        count: 0,
        cost: 0,
      };
      existing.count += 1;
      existing.cost += Number(item.acquisitionCost) || 0;
      categoryMap.set(catName, existing);
    });

    return {
      totalAssets,
      totalCost,
      totalNBV,
      qrCompliance,
      locationBreakdown: Array.from(locationMap.values()).sort(
        (a, b) => b.count - a.count,
      ),
      categoryBreakdown: Array.from(categoryMap.values()).sort(
        (a, b) => b.count - a.count,
      ),
    };
  }, [items]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoaderIcon className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reports Engine
          </h1>
          <p className="text-slate-500 text-sm">
            Comprehensive analytics and financial summaries for your assets.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <DownloadIcon size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <PackageIcon size={20} />
            </div>
            <span className="text-xs font-medium text-slate-400">Total</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.totalAssets}
          </div>
          <div className="text-sm text-slate-500 mt-1">Total Assets</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <DollarSignIcon size={20} />
            </div>
            <span className="text-xs font-medium text-slate-400">
              Financial
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(stats.totalCost)}
          </div>
          <div className="text-sm text-slate-500 mt-1">Acquisition Cost</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUpIcon size={20} />
            </div>
            <span className="text-xs font-medium text-slate-400">Current</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(stats.totalNBV)}
          </div>
          <div className="text-sm text-slate-500 mt-1">Net Book Value</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <QrCodeIcon size={20} />
            </div>
            <span className="text-xs font-medium text-slate-400">Status</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.qrCompliance.toFixed(1)}%
          </div>
          <div className="text-sm text-slate-500 mt-1">QR Bound Scale</div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Location Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Location Breakdown
              </h2>
              <p className="text-xs text-slate-500">
                Audit and reconciliation metrics by storage location
              </p>
            </div>
          </div>
          <div className="p-6">
            <DataTable
              columns={locationColumns}
              data={stats.locationBreakdown}
              placeholder="Search locations..."
            />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Category Breakdown
            </h2>
            <span className="text-xs text-slate-400">Financial Weight</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3 border-b border-slate-200">
                    Category
                  </th>
                  <th className="px-6 py-3 border-b border-slate-200 text-right">
                    Asset Count
                  </th>
                  <th className="px-6 py-3 border-b border-slate-200 text-right">
                    Financial Value
                  </th>
                  <th className="px-6 py-3 border-b border-slate-200 text-right">
                    Avg / Item
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {stats.categoryBreakdown.map((row) => (
                  <tr
                    key={row.name}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-right">
                      {row.count}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-right">
                      {formatCurrency(row.cost)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 text-right">
                      {formatCurrency(row.cost / row.count)}
                    </td>
                  </tr>
                ))}
                {stats.categoryBreakdown.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-slate-400 italic"
                    >
                      No category data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
