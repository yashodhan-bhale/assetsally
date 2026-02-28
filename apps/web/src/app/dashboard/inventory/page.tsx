"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Unlink, AlertCircle, Loader2, MapPin, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";

import { DataTable } from "../../../components/ui/data-table";
import { api } from "../../../lib/api";

const LoaderIcon: any = Loader2;
const MapPinIcon: any = MapPin;
const XIcon: any = X;
const UnlinkIcon: any = Unlink;
const AlertCircleIcon: any = AlertCircle;

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
  auditRemarks?: string;
  auditDate?: string;
  QRBindingRecord?: Array<{
    qrTag: {
      id: string;
      code: string;
      status: string;
    };
  }>;
}

const formatDate = (date: string | null | undefined) => {
  if (!date) return "-";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return (
      <span className="font-mono" data-testid="inventory-date">
        {`${month}/${day}/${year}`}
      </span>
    );
  } catch (e) {
    return "-";
  }
};

const formatNumber = (val: any) => {
  if (val === null || val === undefined) return "-";
  return (
    <span className="font-mono" data-testid="inventory-number">
      {val}
    </span>
  );
};

const formatCurrency = (val: any) => {
  const amount = parseFloat(String(val || "0"));
  if (isNaN(amount)) return "-";
  return (
    <div className="text-right font-mono" data-testid="inventory-currency">
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
  {
    id: "qrCode",
    header: "QR Code",
    cell: ({ row }) => {
      const binding = row.original.QRBindingRecord?.[0];
      if (!binding)
        return <span className="text-slate-300 italic text-xs">Unbound</span>;

      return <QrCell tagCode={binding.qrTag.code} />;
    },
  },
];

function QrCell({ tagCode }: { tagCode: string }) {
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
    </div>
  );
}

function InventoryContent() {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const locationId = searchParams.get("locationId");

  const queryClient = useQueryClient();
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
