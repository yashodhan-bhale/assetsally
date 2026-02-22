"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";

import { DataTable } from "../../../components/ui/data-table";
import { api } from "../../../lib/api";

const LoaderIcon: any = Loader2;
const NavLink: any = Link;

interface Location {
  id: string;
  locationCode: string;
  locationName: string;
  levelLabel: string;
  depth: number;
  path: string;
  parentId: string | null;
  children?: Location[];
}

interface LocationTableData extends Location {
  level1?: string;
  level2?: string;
  level3?: string;
  level4?: string;
}

export default function LocationsPage() {
  const [data, setData] = useState<LocationTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [headers, setHeaders] = useState<string[]>([
    "Level 1",
    "Level 2",
    "Level 3",
    "Level 4",
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const locations: Location[] = await api.getLocations();

        // Build maps for efficient lookup
        const locationMap = new Map(
          locations.map((l) => [l.locationCode, l.locationName]),
        );
        const parentIds = new Set(
          locations.map((l) => l.parentId).filter(Boolean),
        );

        // Determine labels for each depth
        const depthLabels = new Map<number, string>();
        locations.forEach((l) => {
          if (!depthLabels.has(l.depth)) {
            depthLabels.set(l.depth, l.levelLabel);
          }
        });

        const newHeaders = [
          depthLabels.get(0) || "Level 1",
          depthLabels.get(1) || "Level 2",
          depthLabels.get(2) || "Level 3",
          depthLabels.get(3) || "Level 4",
        ];
        setHeaders(newHeaders);

        // Filter: location is end-level if its ID is NOT in parentIds set
        const endLocations = locations
          .filter((l) => !parentIds.has(l.id))
          .map((l) => {
            const parts = l.path.split(".");
            const row: LocationTableData = {
              ...l,
              level1: parts[0] ? locationMap.get(parts[0]) : "",
              level2: parts[1] ? locationMap.get(parts[1]) : "",
              level3: parts[2] ? locationMap.get(parts[2]) : "",
              level4: parts[3] ? locationMap.get(parts[3]) : "",
            };
            return row;
          });

        setData(endLocations);
      } catch (error) {
        console.error("Failed to load locations", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const columns = useMemo<ColumnDef<LocationTableData>[]>(
    () => [
      {
        accessorKey: "locationCode",
        header: "Code",
      },
      {
        accessorKey: "level4",
        header: headers[3],
        cell: ({ row }) => (
          <NavLink
            href={`/dashboard/inventory?locationId=${row.original.id}`}
            className="text-blue-600 hover:underline font-medium"
          >
            {row.original.level4 || row.original.locationName}
          </NavLink>
        ),
      },
      {
        accessorKey: "level3",
        header: headers[2],
      },
      {
        accessorKey: "level2",
        header: headers[1],
      },
      {
        accessorKey: "level1",
        header: headers[0],
      },
    ],
    [headers],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoaderIcon className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
        <p className="text-slate-500">Manage endpoints and physical spaces.</p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        placeholder="Search locations..."
      />
    </div>
  );
}
