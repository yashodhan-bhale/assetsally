"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";

import { api } from "../../../../lib/api";

const XIcon: any = X;
const LoaderIcon: any = Loader2;

interface InventoryForm {
    assetNumber: string;
    assetName: string;
    locationId: string;
    recordType: "Original" | "Additional";
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
        locationId: "",
        recordType: "Original",
    });
    const [error, setError] = useState<string | null>(null);

    // Fetch locations for the dropdown
    const { data: locations, isLoading: loadingLocations } = useQuery({
        queryKey: ["locations-list"],
        queryFn: () => api.getLocations(),
        enabled: isOpen,
    });

    useEffect(() => {
        if (itemToEdit) {
            setFormData({
                assetNumber: itemToEdit.assetNumber,
                assetName: itemToEdit.assetName,
                locationId: itemToEdit.location?.id || itemToEdit.locationId || "",
                recordType: itemToEdit.recordType || "Original",
            });
        } else {
            setFormData({
                assetNumber: "",
                assetName: "",
                locationId: "",
                recordType: "Original",
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
            locationId: formData.locationId,
            recordType: formData.recordType,
        };

        if (itemToEdit) {
            delete payload.assetNumber; // Usually not editable
        }

        mutation.mutate(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
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

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
                                onChange={(e) => setFormData({ ...formData, assetNumber: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
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
                        {loadingLocations && <p className="text-xs text-slate-500 mt-1">Loading locations...</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Record Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.recordType}
                            onChange={(e) => setFormData({ ...formData, recordType: e.target.value as any })}
                            className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                        >
                            <option value="Original">Original</option>
                            <option value="Additional">Additional</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
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
                            {mutation.isPending && <LoaderIcon className="w-4 h-4 animate-spin" />}
                            {itemToEdit ? "Save Changes" : "Add Item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
