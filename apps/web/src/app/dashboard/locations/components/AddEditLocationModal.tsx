"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";

import { api } from "../../../../lib/api";

const XIcon: any = X;
const LoaderIcon: any = Loader2;

interface LocationForm {
    locationCode: string;
    locationName: string;
    description: string;
    parentId: string;
    recordType: "Original" | "Additional";
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    locationToEdit: any | null;
    locationsList: any[];
}

export function AddEditLocationModal({ isOpen, onClose, locationToEdit, locationsList }: Props) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<LocationForm>({
        locationCode: "",
        locationName: "",
        description: "",
        parentId: "",
        recordType: "Original",
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (locationToEdit) {
            setFormData({
                locationCode: locationToEdit.locationCode,
                locationName: locationToEdit.locationName,
                description: locationToEdit.description || "",
                parentId: locationToEdit.parentId || "",
                recordType: locationToEdit.recordType || "Original",
            });
        } else {
            setFormData({
                locationCode: "",
                locationName: "",
                description: "",
                parentId: "",
                recordType: "Original",
            });
        }
        setError(null);
    }, [locationToEdit, isOpen]);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (locationToEdit) {
                return api.updateLocation(locationToEdit.id, data);
            } else {
                return api.createLocation(data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["locations"] });
            onClose();
        },
        onError: (err: any) => {
            setError(err.message || "Failed to save location");
        },
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.locationCode || !formData.locationName) {
            setError("Location Code and Name are required");
            return;
        }

        // Determine depth and path based on parent
        let depth = 0;
        let path = formData.locationCode;
        let levelLabel = "Level 1";

        if (formData.parentId) {
            const parent = locationsList.find((l) => l.id === formData.parentId);
            if (parent) {
                depth = parent.depth + 1;
                path = `${parent.path}.${formData.locationCode}`;
                levelLabel = `Level ${depth + 1}`;
            }
        }

        const payload: any = {
            locationCode: formData.locationCode,
            locationName: formData.locationName,
            description: formData.description,
            recordType: formData.recordType,
        };

        if (!locationToEdit) {
            payload.parentId = formData.parentId || undefined;
            payload.depth = depth;
            payload.path = path;
            payload.levelLabel = levelLabel;
        } else {
            // For updates, we only send allowed fields (code/path/depth updates require more complex logic, left as per API capabilities)
            payload.description = formData.description;
            payload.locationName = formData.locationName;
            payload.recordType = formData.recordType;
            delete payload.locationCode; // Depending on API this might not be updatable
        }

        mutation.mutate(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800">
                        {locationToEdit ? "Edit Location" : "Add Location"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    {!locationToEdit && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Location Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.locationCode}
                                onChange={(e) => setFormData({ ...formData, locationCode: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                placeholder="e.g. BLD01"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Location Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.locationName}
                            onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            placeholder="e.g. Main Building"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            placeholder="Optional description"
                        />
                    </div>

                    {!locationToEdit && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Parent Location
                            </label>
                            <select
                                value={formData.parentId}
                                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            >
                                <option value="">None (Top Level)</option>
                                {locationsList.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.locationCode} - {loc.locationName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

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
                            {locationToEdit ? "Save Changes" : "Add Location"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
