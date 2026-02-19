"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { api } from "../../../lib/api";
import { DataTable } from "../../../components/ui/data-table";

// Type definition based on API response
interface InventoryItem {
  id: string;
  code: string;
  name: string; // Description
  location: { name: string; code: string };
  department?: { name: string; code: string };
  category?: { name: string; code: string };
  cost?: number;
  bookValue?: number;
  purchaseDate?: string;
  status: string; // e.g., 'Found', 'Missing' (from findings) or internal status? Schema has verification status in Findings
  // InventoryItem doesn't have status field directly (unless extended).
  // But usually listing shows active/inactive or finding status.
  // For now, let's omit status if complex to derive, or assume placeholder.
}

const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "code",
    header: "Asset ID",
  },
  {
    accessorKey: "name",
    header: "Description",
  },
  {
    accessorKey: "location.name",
    header: "Location",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.location?.name}</div>
        <div className="text-xs text-slate-500">{row.original.location?.code}</div>
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
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("cost") || "0");
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);
    },
  },
  {
    accessorKey: "purchaseDate",
    header: "Purchase Date",
    cell: ({ row }) => {
      const date = row.getValue("purchaseDate");
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
        const inventory = await api.getInventory();
        setData(inventory);
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
