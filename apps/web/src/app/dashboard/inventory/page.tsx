"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { DataTable } from "../../../components/ui/data-table";
import { api } from "../../../lib/api";

// Type definition based on API response
interface InventoryItem {
  id: string;
  assetNumber: string;
  assetName: string;
  assetDescription?: string;
  location: { locationName: string; locationCode: string };
  department?: { name: string; code: string };
  category?: { name: string; code: string };
  subCategory?: string;
  profitCenter?: string;
  unitOfMeasure?: string;
  quantityAsPerBooks?: number;
  acquisitionCost?: number;
  accumulatedDepreciation?: number;
  netBookValue?: number;
  capitalizationDate?: string;
  inventoryStatus?: string;
  // Audit fields (blank for now)
  auditStatus?: string;
  auditCondition?: string;
  auditRemarks?: string;
  auditDate?: string;
}

const formatDate = (date: string | null | undefined) => {
  if (!date) return "-";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return <span className="font-mono">{`${month}/${day}/${year}`}</span>;
  } catch (e) {
    return "-";
  }
};

const formatNumber = (val: any) => {
  if (val === null || val === undefined) return "-";
  return <span className="font-mono">{val}</span>;
};

const formatCurrency = (val: any) => {
  const amount = parseFloat(String(val || "0"));
  if (isNaN(amount)) return "-";
  return (
    <div className="text-right font-mono">
      {new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)}
    </div>
  );
};

const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "assetNumber",
    header: "Asset ID",
    cell: ({ row }) => (
      <span className="font-mono">{row.original.assetNumber}</span>
    ),
  },
  {
    accessorKey: "assetName",
    header: "Description",
  },
  {
    accessorKey: "location.locationName",
    header: "Location",
    cell: ({ row }) => (
      <div>
        <div className="text-slate-900">
          {row.original.location?.locationName}
        </div>
        <div className="text-xs text-slate-500 font-mono">
          {row.original.location?.locationCode}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "department.name",
    header: "Department",
  },
  {
    accessorKey: "category.name",
    header: "Category",
  },
  {
    accessorKey: "subCategory",
    header: "Sub Category",
  },
  {
    accessorKey: "profitCenter",
    header: "Profit Center",
  },
  {
    accessorKey: "unitOfMeasure",
    header: "UOM",
  },
  {
    accessorKey: "quantityAsPerBooks",
    header: "Qty",
    cell: ({ row }) => formatNumber(row.getValue("quantityAsPerBooks")),
  },
  {
    accessorKey: "acquisitionCost",
    header: () => <div className="text-right">Cost (₹)</div>,
    cell: ({ row }) => formatCurrency(row.getValue("acquisitionCost")),
  },
  {
    accessorKey: "accumulatedDepreciation",
    header: () => <div className="text-right">Acc. Depre (₹)</div>,
    cell: ({ row }) => formatCurrency(row.getValue("accumulatedDepreciation")),
  },
  {
    accessorKey: "netBookValue",
    header: () => <div className="text-right">NBV (₹)</div>,
    cell: ({ row }) => formatCurrency(row.getValue("netBookValue")),
  },
  {
    accessorKey: "capitalizationDate",
    header: "Purchase Date",
    cell: ({ row }) => formatDate(row.getValue("capitalizationDate")),
  },
  {
    accessorKey: "inventoryStatus",
    header: "Status",
    cell: ({ row }) => (
      <span className="capitalize">
        {row.original.inventoryStatus?.toLowerCase() || "-"}
      </span>
    ),
  },
  // Blank Audit Columns
  {
    accessorKey: "auditStatus",
    header: "Audit Status",
    cell: () => <span className="text-slate-300">-</span>,
  },
  {
    accessorKey: "auditCondition",
    header: "Condition",
    cell: () => <span className="text-slate-300">-</span>,
  },
  {
    accessorKey: "auditRemarks",
    header: "Remarks",
    cell: () => <span className="text-slate-300">-</span>,
  },
  {
    accessorKey: "auditDate",
    header: "Audit Date",
    cell: () => <span className="text-slate-300">-</span>,
  },
];

export default function InventoryPage() {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await api.getInventory();
        // Handle paginated response structure { items: [], pagination: {} }
        if (response && response.items) {
          setData(response.items);
        } else if (Array.isArray(response)) {
          setData(response);
        }
      } catch (error) {
        console.error("Failed to load inventory", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-slate-500">
          Tracking {data.length} assets across all locations.
        </p>
      </div>

      <DataTable columns={columns} data={data} placeholder="Search assets..." />
    </div>
  );
}
