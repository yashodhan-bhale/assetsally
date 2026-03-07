"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Calendar, Loader2, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useMemo, useCallback } from "react";

import { DataTable } from "../../../components/ui/data-table";
import { useAuth } from "../../../contexts/auth-context";
import { api } from "../../../lib/api";
import { AuditScheduleModal } from "../audit-schedule/components/AuditScheduleModal";

import { AddEditLocationModal } from "./components/AddEditLocationModal";

const LoaderIcon: any = Loader2;
const NavLink: any = Link;
const CalendarIcon: any = Calendar;
const PlusIcon: any = Plus;
const EditIcon: any = Edit;
const TrashIcon: any = Trash2;

interface Location {
  id: string;
  locationCode: string;
  locationName: string;
  levelLabel: string;
  depth: number;
  path: string;
  parentId: string | null;
  recordType?: string;
  createdAt?: string;
  children?: Location[];
}

interface LocationTableData extends Location {
  level1?: string;
  level2?: string;
  level3?: string;
  level4?: string;
}

export default function LocationsPage() {
  const { user } = useAuth();
  const isAdmin = user?.appType === "ADMIN";

  const [data, setData] = useState<LocationTableData[]>([]);
  const [fullLocations, setFullLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [headers, setHeaders] = useState<string[]>([
    "Level 1",
    "Level 2",
    "Level 3",
    "Level 4",
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLocationId, setModalLocationId] = useState<string | null>(null);

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const locations: Location[] = await api.getLocations();
      setFullLocations(locations);

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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = useCallback(
    async (id: string, code: string) => {
      if (confirm(`Are you sure you want to delete Location ${code}?`)) {
        try {
          await api.deleteLocation(id);
          loadData();
        } catch (error: any) {
          alert(error.message || "Failed to delete location");
        }
      }
    },
    [loadData],
  );

  const columns = useMemo<ColumnDef<LocationTableData>[]>(() => {
    const baseColumns: ColumnDef<LocationTableData>[] = [
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
      {
        accessorKey: "recordType",
        header: "Record Type",
        cell: ({ row }) => (
          <span className="capitalize">
            {row.original.recordType || "Original"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
          if (!row.original.createdAt) return "-";
          return new Date(row.original.createdAt).toLocaleDateString();
        },
      },
    ];

    if (isAdmin) {
      baseColumns.push({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setModalLocationId(row.original.id);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <CalendarIcon size={14} />
              Schedule
            </button>
            <button
              onClick={() => {
                setLocationToEdit(row.original);
                setIsAddEditModalOpen(true);
              }}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Location"
            >
              <EditIcon size={16} />
            </button>
            <button
              onClick={() =>
                handleDelete(row.original.id, row.original.locationCode)
              }
              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Location"
            >
              <TrashIcon size={16} />
            </button>
          </div>
        ),
      });
    }

    return baseColumns;
  }, [headers, isAdmin, handleDelete]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoaderIcon className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Locations
          </h1>
          <div className="text-slate-500">
            {isAdmin ? (
              <p>Manage endpoints and physical spaces.</p>
            ) : (
              <p>View physical asset locations.</p>
            )}
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setLocationToEdit(null);
              setIsAddEditModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon size={18} />
            Add Location
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data}
        placeholder="Search locations..."
      />

      <AuditScheduleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalLocationId(null);
        }}
        initialLocationId={modalLocationId}
        readOnly={!isAdmin}
      />

      <AddEditLocationModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setLocationToEdit(null);
          loadData(); // Refresh table after add/edit
        }}
        locationToEdit={locationToEdit}
        locationsList={fullLocations}
      />
    </div>
  );
}
