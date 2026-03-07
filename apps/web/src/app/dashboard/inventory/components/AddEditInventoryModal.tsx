"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { api } from "../../../../lib/api";

const XIcon: any = X;
const LoaderIcon: any = Loader2;

interface InventoryForm {
  assetNumber: string;
  assetName: string;
  assetDescription: string;
  locationId: string;
  departmentId: string;
  categoryId: string;
  recordType: "Original" | "Additional";
  profitCenter: string;
  subCategory: string;
  unitOfMeasure: string;
  capitalizationDate: string;
  acquisitionCost: string;
  netBookValue: string;
  accumulatedDepreciation: string;
  quantityAsPerBooks: string;
  quantityAsPerPhysical: string;
  quantityDifference: string;
  biometricTag: string;
  importRemarks: string;
  inventoryStatus: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit: any | null;
}

export function AddEditInventoryModal({ isOpen, onClose, itemToEdit }: Props) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<InventoryForm>({
    assetNumber: "",
    assetName: "",
    assetDescription: "",
    locationId: "",
    departmentId: "",
    categoryId: "",
    recordType: "Original",
    profitCenter: "",
    subCategory: "",
    unitOfMeasure: "",
    capitalizationDate: "",
    acquisitionCost: "",
    netBookValue: "",
    accumulatedDepreciation: "",
    quantityAsPerBooks: "",
    quantityAsPerPhysical: "",
    quantityDifference: "",
    biometricTag: "",
    importRemarks: "",
    inventoryStatus: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch locations for the dropdown
  const { data: locations, isLoading: loadingLocations } = useQuery({
    queryKey: ["locations-list"],
    queryFn: () => api.getLocations(),
    enabled: isOpen,
  });

  const { data: departments, isLoading: loadingDepartments } = useQuery({
    queryKey: ["departments-list"],
    queryFn: () => api.getDepartments(),
    enabled: isOpen,
  });

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories-list"],
    queryFn: () => api.getAssetCategories(),
    enabled: isOpen,
  });

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        assetNumber: itemToEdit.assetNumber,
        assetName: itemToEdit.assetName,
        assetDescription: itemToEdit.assetDescription || "",
        locationId: itemToEdit.location?.id || itemToEdit.locationId || "",
        departmentId:
          itemToEdit.department?.id || itemToEdit.departmentId || "",
        categoryId: itemToEdit.category?.id || itemToEdit.categoryId || "",
        recordType: itemToEdit.recordType || "Original",
        profitCenter: itemToEdit.profitCenter || "",
        subCategory: itemToEdit.subCategory || "",
        unitOfMeasure: itemToEdit.unitOfMeasure || "",
        capitalizationDate: itemToEdit.capitalizationDate
          ? new Date(itemToEdit.capitalizationDate).toISOString().split("T")[0]
          : "",
        acquisitionCost: itemToEdit.acquisitionCost?.toString() || "",
        netBookValue: itemToEdit.netBookValue?.toString() || "",
        accumulatedDepreciation:
          itemToEdit.accumulatedDepreciation?.toString() || "",
        quantityAsPerBooks: itemToEdit.quantityAsPerBooks?.toString() || "",
        quantityAsPerPhysical:
          itemToEdit.quantityAsPerPhysical?.toString() || "",
        quantityDifference: itemToEdit.quantityDifference?.toString() || "",
        biometricTag: itemToEdit.biometricTag || "",
        importRemarks: itemToEdit.importRemarks || "",
        inventoryStatus: itemToEdit.inventoryStatus || "",
      });
    } else {
      setFormData({
        assetNumber: "",
        assetName: "",
        assetDescription: "",
        locationId: "",
        departmentId: "",
        categoryId: "",
        recordType: "Original",
        profitCenter: "",
        subCategory: "",
        unitOfMeasure: "",
        capitalizationDate: "",
        acquisitionCost: "",
        netBookValue: "",
        accumulatedDepreciation: "",
        quantityAsPerBooks: "",
        quantityAsPerPhysical: "",
        quantityDifference: "",
        biometricTag: "",
        importRemarks: "",
        inventoryStatus: "",
      });
    }
    setError(null);
  }, [itemToEdit, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (itemToEdit) {
        return api.updateInventoryItem(itemToEdit.id, data);
      } else {
        return api.createInventoryItem(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.message || "Failed to save inventory item");
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetNumber || !formData.assetName || !formData.locationId) {
      setError("Asset Number, Name, and Location are required");
      return;
    }

    const payload: any = {
      assetNumber: formData.assetNumber,
      assetName: formData.assetName,
      assetDescription: formData.assetDescription,
      locationId: formData.locationId,
      departmentId: formData.departmentId || undefined,
      categoryId: formData.categoryId || undefined,
      recordType: formData.recordType,
      profitCenter: formData.profitCenter,
      subCategory: formData.subCategory,
      unitOfMeasure: formData.unitOfMeasure,
      capitalizationDate: formData.capitalizationDate || undefined,
      acquisitionCost: formData.acquisitionCost
        ? parseFloat(formData.acquisitionCost)
        : undefined,
      netBookValue: formData.netBookValue
        ? parseFloat(formData.netBookValue)
        : undefined,
      accumulatedDepreciation: formData.accumulatedDepreciation
        ? parseFloat(formData.accumulatedDepreciation)
        : undefined,
      quantityAsPerBooks: formData.quantityAsPerBooks
        ? parseInt(formData.quantityAsPerBooks)
        : undefined,
      quantityAsPerPhysical: formData.quantityAsPerPhysical
        ? parseInt(formData.quantityAsPerPhysical)
        : undefined,
      quantityDifference: formData.quantityDifference
        ? parseInt(formData.quantityDifference)
        : undefined,
      biometricTag: formData.biometricTag,
      importRemarks: formData.importRemarks,
      inventoryStatus: formData.inventoryStatus,
    };

    if (itemToEdit) {
      delete payload.assetNumber; // Usually not editable
    }

    mutation.mutate(payload);
  };

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden relative">
        <div className="flex-shrink-0 bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">
            {itemToEdit ? "Edit Inventory Item" : "Add Inventory Item"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto flex-1"
        >
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {!itemToEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Asset Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.assetNumber}
                onChange={(e) =>
                  setFormData({ ...formData, assetNumber: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="e.g. ASSET-001"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Asset Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.assetName}
              onChange={(e) =>
                setFormData({ ...formData, assetName: e.target.value })
              }
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              placeholder="e.g. Dell Monitor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.locationId}
              onChange={(e) =>
                setFormData({ ...formData, locationId: e.target.value })
              }
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow disabled:bg-slate-100"
              disabled={loadingLocations}
            >
              <option value="">Select a location</option>
              {locations?.map((loc: any) => (
                <option key={loc.id} value={loc.id}>
                  {loc.locationCode} - {loc.locationName}
                </option>
              ))}
            </select>
            {loadingLocations && (
              <p className="text-xs text-slate-500 mt-1">
                Loading locations...
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description of Asset
            </label>
            <textarea
              value={formData.assetDescription}
              onChange={(e) =>
                setFormData({ ...formData, assetDescription: e.target.value })
              }
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              placeholder="Detailed description"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Department
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData({ ...formData, departmentId: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow disabled:bg-slate-100"
                disabled={loadingDepartments}
              >
                <option value="">Select Department</option>
                {departments?.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Asset Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow disabled:bg-slate-100"
                disabled={loadingCategories}
              >
                <option value="">Select Category</option>
                {categories?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sub Category (Minor)
              </label>
              <input
                type="text"
                value={formData.subCategory}
                onChange={(e) =>
                  setFormData({ ...formData, subCategory: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="Minor category"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Profit Center
              </label>
              <input
                type="text"
                value={formData.profitCenter}
                onChange={(e) =>
                  setFormData({ ...formData, profitCenter: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="Profit center"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Unit of Measure (UOM)
              </label>
              <input
                type="text"
                value={formData.unitOfMeasure}
                onChange={(e) =>
                  setFormData({ ...formData, unitOfMeasure: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="e.g. EA, SET"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Capitalization Date
              </label>
              <input
                type="date"
                value={formData.capitalizationDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capitalizationDate: e.target.value,
                  })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              />
            </div>
          </div>

          <hr className="border-slate-100 my-2" />
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Financial Values
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Acquisition Cost
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.acquisitionCost}
                onChange={(e) =>
                  setFormData({ ...formData, acquisitionCost: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Net Book Value
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.netBookValue}
                onChange={(e) =>
                  setFormData({ ...formData, netBookValue: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Acc. Depreciation
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.accumulatedDepreciation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accumulatedDepreciation: e.target.value,
                  })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="0.00"
              />
            </div>
          </div>

          <hr className="border-slate-100 my-2" />
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Quantities & Status
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Qty (Books)
              </label>
              <input
                type="number"
                value={formData.quantityAsPerBooks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantityAsPerBooks: e.target.value,
                  })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Qty (Physical)
              </label>
              <input
                type="number"
                value={formData.quantityAsPerPhysical}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantityAsPerPhysical: e.target.value,
                  })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Difference
              </label>
              <input
                type="number"
                value={formData.quantityDifference}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantityDifference: e.target.value,
                  })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Biometric Tag
              </label>
              <input
                type="text"
                value={formData.biometricTag}
                onChange={(e) =>
                  setFormData({ ...formData, biometricTag: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="Tag info"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Inventory Status
              </label>
              <select
                value={formData.inventoryStatus}
                onChange={(e) =>
                  setFormData({ ...formData, inventoryStatus: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              >
                <option value="">Select Status</option>
                <option value="Found OK">Found OK</option>
                <option value="Excess">Excess</option>
                <option value="Short">Short</option>
                <option value="Physically available, but not found">
                  Physically available, but not found
                </option>
                <option value="Physically unavailable, but found">
                  Physically unavailable, but found
                </option>
                <option value="Scrap/Obsolete/Damaged">
                  Scrap/Obsolete/Damaged
                </option>
                <option value="Asset not in use (idle)">
                  Asset not in use (idle)
                </option>
                <option value="Asset not in use (held for sale)">
                  Asset not in use (held for sale)
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Remarks
            </label>
            <textarea
              value={formData.importRemarks}
              onChange={(e) =>
                setFormData({ ...formData, importRemarks: e.target.value })
              }
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              placeholder="Any additional remarks"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Record Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.recordType}
              onChange={(e) =>
                setFormData({ ...formData, recordType: e.target.value as any })
              }
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            >
              <option value="Original">Original</option>
              <option value="Additional">Additional</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 flex-shrink-0 mt-auto bg-white border-t border-slate-100 p-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {mutation.isPending && (
                <LoaderIcon className="w-4 h-4 animate-spin" />
              )}
              {itemToEdit ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
