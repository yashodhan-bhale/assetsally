"use client";

import {
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { RoleGuard } from "../../../components/auth/role-guard";
import { api } from "../../../lib/api";
import { UserRole } from "../../../lib/rbac";

export default function DataImportPage() {
  const [activeTab, setActiveTab] = useState<"locations" | "inventory">(
    "locations",
  );
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.uploadImport(file, activeTab);
      setResult(data);
      setFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleWipeData = async () => {
    if (
      !confirm(
        "Are you ABSOLUTELY SURE? This will delete ALL Locations and Inventory items. This action cannot be undone.",
      )
    ) {
      return;
    }

    setWiping(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.wipeData();
      setResult({ message: data.message, success: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setWiping(false);
    }
  };

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Data Import</h1>
            <p className="text-slate-400">
              Manage bulk data imports for locations and inventory.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleWipeData}
              disabled={wiping}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20"
            >
              {wiping ? (
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>Wipe All Data</span>
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {result && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{result.message}</span>
            </div>
            {result.errors && result.errors.length > 0 && (
              <div className="mt-3 p-3 bg-slate-900/50 rounded-lg text-sm text-slate-300 max-h-40 overflow-y-auto">
                <p className="font-medium text-amber-400 mb-1">
                  {result.errorCount} Errors Found:
                </p>
                <ul className="space-y-1">
                  {result.errors.map((e: any, i: number) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-slate-500">
                        Row {JSON.stringify(e.row)}:
                      </span>
                      <span className="text-red-300">{e.error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => {
              setActiveTab("locations");
              setResult(null);
              setError(null);
            }}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "locations" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-300"}`}
          >
            Locations
          </button>
          <button
            onClick={() => {
              setActiveTab("inventory");
              setResult(null);
              setError(null);
            }}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "inventory" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-300"}`}
          >
            Inventory
          </button>
        </div>

        {/* Upload Area */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-white">
              Upload {activeTab === "locations" ? "Location" : "Inventory"} Data
            </h3>
            <p className="text-sm text-slate-400">
              Select an Excel/CSV file to import.
              <strong> Ensure file columns match schema.</strong>
            </p>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-400
                              file:mr-4 file:py-2.5 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-500/10 file:text-blue-400
                              hover:file:bg-blue-500/20
                              cursor-pointer"
            />

            {file && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {uploading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {uploading ? "Importing..." : "Start Import"}
              </button>
            )}
          </div>
        </div>

        {/* Guidelines/Help */}
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-300 space-y-1">
              <p className="font-medium text-blue-300">Important Notes:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>
                  Data wipe is <strong>irreversible</strong>.
                </li>
                <li>
                  For Locations: Ensure <strong>Code</strong> and{" "}
                  <strong>Name</strong> columns exist. Parent codes must precede
                  children or exist already.
                </li>
                <li>
                  For Inventory: Ensure <strong>Asset Code</strong> and{" "}
                  <strong>Location Code</strong> exist. Locations must exist
                  before importing inventory.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
