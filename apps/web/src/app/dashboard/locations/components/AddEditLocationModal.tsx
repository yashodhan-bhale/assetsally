"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { api } from "../../../../lib/api";

const XIcon: any = X;
const LoaderIcon: any = Loader2;

interface LocationForm {
  l1Code: string;
  l1Name: string;
  l2Code: string;
  l2Name: string;
  l3Code: string;
  l3Name: string;
  l4Code: string;
  l4Name: string;
  recordType: "Original" | "Additional";
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  locationToEdit: any | null;
  locationsList: any[];
}

export function AddEditLocationModal({
  isOpen,
  onClose,
  locationToEdit,
  locationsList,
}: Props) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<LocationForm>({
    l1Code: "",
    l1Name: "",
    l2Code: "",
    l2Name: "",
    l3Code: "",
    l3Name: "",
    l4Code: "",
    l4Name: "",
    recordType: "Original",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (locationToEdit) {
      // Find ancestors to fill L1-L3 if possible
      const parts = locationToEdit.path?.split(".") || [];
      setFormData({
        l1Code: parts[0] || "",
        l1Name: parts[0]
          ? locationsList.find((l) => l.locationCode === parts[0])
              ?.locationName || ""
          : "",
        l2Code: parts[1] || "",
        l2Name: parts[1]
          ? locationsList.find((l) => l.locationCode === parts[1])
              ?.locationName || ""
          : "",
        l3Code: parts[2] || "",
        l3Name: parts[2]
          ? locationsList.find((l) => l.locationCode === parts[2])
              ?.locationName || ""
          : "",
        l4Code: parts[3] || locationToEdit.locationCode,
        l4Name: parts[3]
          ? locationsList.find((l) => l.locationCode === parts[3])
              ?.locationName || locationToEdit.locationName
          : locationToEdit.locationName,
        recordType: locationToEdit.recordType || "Original",
      });
    } else {
      setFormData({
        l1Code: "",
        l1Name: "",
        l2Code: "",
        l2Name: "",
        l3Code: "",
        l3Name: "",
        l4Code: "",
        l4Name: "",
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

    // Find deepest level provided
    let deepestLevel = 0;
    if (formData.l4Code && formData.l4Name) deepestLevel = 4;
    else if (formData.l3Code && formData.l3Name) deepestLevel = 3;
    else if (formData.l2Code && formData.l2Name) deepestLevel = 2;
    else if (formData.l1Code && formData.l1Name) deepestLevel = 1;

    if (deepestLevel === 0) {
      setError("Please provide at least Level 1 Code and Name");
      return;
    }

    const code = (formData as any)[`l${deepestLevel}Code`];
    const name = (formData as any)[`l${deepestLevel}Name`];

    // Determine parent if it exists
    let parentId: string | undefined = undefined;
    let path = code;
    const depth = deepestLevel - 1;

    if (deepestLevel > 1) {
      const parentCode = (formData as any)[`l${deepestLevel - 1}Code`];
      const parentNode = locationsList.find(
        (l) => l.locationCode === parentCode,
      );
      if (parentNode) {
        parentId = parentNode.id;
        path = `${parentNode.path}.${code}`;
      } else {
        // In a real app, we might want to auto-create ancestors.
        // For now, assume ancestors must exist or be created top-down.
        setError(`Level ${deepestLevel - 1} location must exist first.`);
        return;
      }
    }

    const payload: any = {
      locationCode: code,
      locationName: name,
      recordType: formData.recordType,
    };

    if (!locationToEdit) {
      payload.parentId = parentId;
      payload.depth = depth;
      payload.path = path;
      payload.levelLabel = `Level ${deepestLevel}`;
    } else {
      payload.locationName = name;
      payload.recordType = formData.recordType;
    }

    mutation.mutate(payload);
  };

  const deepestLevel =
    formData.l4Code && formData.l4Name
      ? 4
      : formData.l3Code && formData.l3Name
        ? 3
        : formData.l2Code && formData.l2Name
          ? 2
          : formData.l1Code && formData.l1Name
            ? 1
            : 0;

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden relative">
        <div className="flex-shrink-0 bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
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

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto flex-1"
        >
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  L1 Code{" "}
                  {deepestLevel === 1 && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.l1Code}
                  onChange={(e) =>
                    setFormData({ ...formData, l1Code: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="L1 Code"
                  disabled={!!locationToEdit}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  L1 Name{" "}
                  {deepestLevel === 1 && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.l1Name}
                  onChange={(e) =>
                    setFormData({ ...formData, l1Name: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="L1 Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  L2 Code
                </label>
                <input
                  type="text"
                  value={formData.l2Code}
                  onChange={(e) =>
                    setFormData({ ...formData, l2Code: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="L2 Code"
                  disabled={!!locationToEdit && locationToEdit.depth < 1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  L2 Name
                </label>
                <input
                  type="text"
                  value={formData.l2Name}
                  onChange={(e) =>
                    setFormData({ ...formData, l2Name: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="L2 Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  L3 Code
                </label>
                <input
                  type="text"
                  value={formData.l3Code}
                  onChange={(e) =>
                    setFormData({ ...formData, l3Code: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="L3 Code"
                  disabled={!!locationToEdit && locationToEdit.depth < 2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  L3 Name
                </label>
                <input
                  type="text"
                  value={formData.l3Name}
                  onChange={(e) =>
                    setFormData({ ...formData, l3Name: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="L3 Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  L4 Code
                </label>
                <input
                  type="text"
                  value={formData.l4Code}
                  onChange={(e) =>
                    setFormData({ ...formData, l4Code: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="L4 Code"
                  disabled={!!locationToEdit && locationToEdit.depth < 3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  L4 Name
                </label>
                <input
                  type="text"
                  value={formData.l4Name}
                  onChange={(e) =>
                    setFormData({ ...formData, l4Name: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="L4 Name"
                />
              </div>
            </div>
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
              {locationToEdit ? "Save Changes" : "Add Location"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
