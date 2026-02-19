"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { api } from "../../../lib/api";
import { DataTable } from "../../../components/ui/data-table";

// Type definition based on API response
interface Location {
  id: string;
  code: string;
  name: string;
  levelLabel: string;
  path: string;
  parentId: string | null;
  children?: Location[]; // or just count if optimized
}

const columns: ColumnDef<Location>[] = [
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "levelLabel",
    header: "Type",
  },
  {
    accessorKey: "path",
    header: "Hierarchy Path",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-slate-500">
        {row.getValue("path")}
      </span>
    ),
  },
];

export default function LocationsPage() {
  const [data, setData] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const locations = await api.getLocations();
        // Filter for end-level locations (no children)
        // Note: API might not return children array in flat list.
        // If flat list, we need to find if any location has this ID as parent.

        // Build map of parentIds
        const parentIds = new Set(locations.map((l: Location) => l.parentId).filter(Boolean));

        // Filter: location is end-level if its ID is NOT in parentIds set
        const endLocations = locations.filter((l: Location) => !parentIds.has(l.id));

        setData(endLocations);
      } catch (error) {
        console.error("Failed to load locations", error);
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
        <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
        <p className="text-slate-500">
          Manage endpoints and physical spaces.
        </p>
      </div>

      <DataTable columns={columns} data={data} placeholder="Search locations..." />
    </div>
  );
}
