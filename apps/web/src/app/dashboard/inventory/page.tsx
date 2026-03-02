"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Unlink, AlertCircle, Loader2, MapPin, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, Suspense, useMemo } from "react";

import { useAuth } from "../../../contexts/auth-context";
import { DataTable } from "../../../components/ui/data-table";
import { api } from "../../../lib/api";

interface InventoryItem {
  id: string;
  assetNumber: string;
  assetName: string;
  location?: {
    id: string;
    locationName: string;
    locationCode: string
  };
  department?: { id: string; name: string };
  category?: { id: string; name: string };
  subCategory?: string;
  profitCenter?: string;
  unitOfMeasure?: string;
  quantityAsPerBooks?: number;
  quantityAsPerPhysical?: number;
  quantityDifference?: number;
  biometricTag?: string;
  acquisitionCost?: number;
  accumulatedDepreciation?: number;
  netBookValue?: number;
  capitalizationDate?: string;
  inventoryStatus?: string;
  QRBindingRecord?: Array<{
    qrTag: {
      code: string;
    };
  }>;
}

const formatNumber = (val: any) => {
  if (val === undefined || val === null) return "-";
  return (
    <div className="font-mono text-right" data-testid="inventory-number">
      {new Intl.NumberFormat("en-IN").format(Number(val))}
    </div>
  );
};

const formatCurrency = (val: any) => {
  if (val === undefined || val === null) return "-";
  return (
    <div className="font-mono text-right" data-testid="inventory-currency">
      {new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
      }).format(Number(val))}
    </div>
  );
};

const formatDate = (val: any) => {
  if (!val) return "-";
  return (
    <div className="font-mono" data-testid="inventory-date">
      {new Date(val).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })}
    </div>
  );
};

const LoaderIcon: any = Loader2;
const MapPinIcon: any = MapPin;
const XIcon: any = X;
const UnlinkIcon: any = Unlink;
const AlertCircleIcon: any = AlertCircle;

function QrCell({ tagCode, isAdmin }: { tagCode: string; isAdmin: boolean }) {
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);

  const mutation = useMutation({
    mutationFn: () => api.unassignQrTag(tagCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      alert("QR code unbound successfully.");
    },
    onError: (err: any) => {
      alert(err.message || "Failed to unbind QR code.");
    },
  });

  const handleUnbind = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      confirm(
        `Are you sure you want to unbind QR code ${tagCode} from this item?\n\nThis will make the QR code available for another item.`,
      )
    ) {
      mutation.mutate();
    }
  };

  return (
    <div
      className="flex items-center gap-2 group/qr"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
        {tagCode}
      </span>
      {isAdmin && (
        <button
          onClick={handleUnbind}
          disabled={mutation.isPending}
          className="opacity-0 group-hover/qr:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all disabled:opacity-50"
          title="Unbind QR Code"
        >
          {mutation.isPending ? (
            <LoaderIcon className="w-3 h-3 animate-spin" />
          ) : (
            <UnlinkIcon size={12} />
          )}
        </button>
      )}
    </div>
  );
}

function InventoryContent() {
  const { user } = useAuth();
  const isAdmin = user?.appType === "ADMIN";

  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const locationId = searchParams.get("locationId");

  const queryClient = useQueryClient();

  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: "assetNumber",
        header: "Asset ID",
        cell: ({ row }) => (
          <span className="font-mono font-medium text-blue-600" data-testid="inventory-asset-id">
            {row.original.assetNumber}
          </span>
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
        header: "As per Books",
        cell: ({ row }) => formatNumber(row.getValue("quantityAsPerBooks")),
      },
      {
        accessorKey: "quantityAsPerPhysical",
        header: "As per Physical",
        cell: ({ row }) => formatNumber(row.getValue("quantityAsPerPhysical")),
      },
      {
        accessorKey: "quantityDifference",
        header: "Difference",
        cell: ({ row }) => formatNumber(row.getValue("quantityDifference")),
      },
      {
        accessorKey: "biometricTag",
        header: "Biometric Tag",
        cell: ({ row }) => (
          <span className="font-mono text-[10px] bg-slate-50 px-1 rounded border border-slate-100 text-slate-600">
            {row.original.biometricTag || "-"}
          </span>
        ),
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
        accessorKey: "auditRemarks",
        header: "Remarks",
        cell: () => <span className="text-slate-300">-</span>,
      },
      {
        accessorKey: "auditDate",
        header: "Audit Date",
        cell: () => <span className="text-slate-300">-</span>,
      },
      {
        id: "qrCode",
        header: "QR Code",
        cell: ({ row }) => {
          const binding = row.original.QRBindingRecord?.[0];
          if (!binding) {
            return (
              <span className="text-slate-300 italic text-xs">Unbound</span>
            );
          }

          return <QrCell tagCode={binding.qrTag.code} isAdmin={isAdmin} />;
        },
      },
    ],
    [isAdmin],
  );
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (locationId) {
          params.locationId = locationId;

          // Fetch location details for display
          try {
            const loc = await api.getLocation(locationId);
            setLocationName(loc.locationName);
          } catch (e) {
            console.error("Failed to fetch location details", e);
          }
        } else {
          setLocationName(null);
        }

        const response = await api.getInventory(params);
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
  }, [locationId]);

  // Use react-query to manage inventory data for better refresh handling
  const { data: qData, isLoading: qLoading } = useQuery({
    queryKey: ["inventory", locationId],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (locationId) params.locationId = locationId;
      return api.getInventory(params);
    },
  });

  useEffect(() => {
    if (qData) {
      if (qData.items) setData(qData.items);
      else if (Array.isArray(qData)) setData(qData);
    }
  }, [qData]);

  useEffect(() => {
    if (qLoading && !data.length) setLoading(true);
    else setLoading(false);
  }, [qLoading, data.length]);

  const clearFilter = () => {
    router.push("/dashboard/inventory");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoaderIcon className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-slate-500">
            Tracking {data.length} assets across all locations.
          </p>
        </div>

        {locationId && locationName && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-sm animate-in fade-in slide-in-from-right-4 duration-300">
            <MapPinIcon className="w-4 h-4" />
            <span className="font-semibold">{locationName}</span>
            <button
              onClick={clearFilter}
              className="ml-1 p-0.5 hover:bg-blue-100 rounded-full transition-colors"
              title="Clear location filter"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <DataTable columns={columns} data={data} placeholder="Search assets..." />
    </div>
  );
}

export default function InventoryPage(): React.ReactNode {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <LoaderIcon className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <InventoryContent />
    </Suspense>
  );
}
