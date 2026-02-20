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
  location: { locationName: string; locationCode: string };
  department?: { name: string; code: string };
  category?: { name: string; code: string };
  acquisitionCost?: number;
  netBookValue?: number;
  capitalizationDate?: string;
  inventoryStatus?: string;
}

const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "assetNumber",
    header: "Asset ID",
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
        <div className="font-medium">{row.original.location?.locationName}</div>
        <div className="text-xs text-slate-500">
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
    accessorKey: "acquisitionCost",
    header: "Cost",
    cell: ({ row }) => {
      const amount = parseFloat(String(row.getValue("acquisitionCost") || "0"));
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);
    },
  },
  {
    accessorKey: "capitalizationDate",
    header: "Purchase Date",
    cell: ({ row }) => {
      const date = row.getValue("capitalizationDate");
      if (!date) return "-";
      return new Date(date as string).toLocaleDateString();
    },
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
