"use client";

import { useQuery } from "@tanstack/react-query";
import { MapPin, ChevronRight, Package, FolderTree } from "lucide-react";
import { useState } from "react";

import { api } from "../../../lib/api";

function LocationNode({
  location,
  depth = 0,
}: {
  location: any;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = location.children?.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer group border-b border-slate-800/30`}
        style={{ paddingLeft: `${16 + depth * 24}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        {hasChildren ? (
          <ChevronRight
            className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        ) : (
          <div className="w-4" />
        )}
        <div
          className={`w-2 h-2 rounded-full ${depth === 0 ? "bg-blue-500" : depth === 1 ? "bg-emerald-500" : depth === 2 ? "bg-amber-500" : "bg-purple-500"}`}
        />
        <div className="flex-1 min-w-0">
          <span className="text-sm text-white font-medium">
            {location.name}
          </span>
          <span className="text-xs text-slate-500 ml-2">{location.code}</span>
        </div>
        <span className="text-xs text-slate-600 px-2 py-0.5 rounded bg-slate-800/50">
          {location.levelLabel}
        </span>
      </div>
      {expanded && hasChildren && (
        <div>
          {location.children.map((child: any) => (
            <LocationNode key={child.id} location={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function LocationsPage() {
  const { data: tree, isLoading } = useQuery({
    queryKey: ["location-tree"],
    queryFn: () => api.getLocationTree(),
  });

  const { data: flat } = useQuery({
    queryKey: ["locations-flat"],
    queryFn: () => api.getLocations(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Locations</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your location hierarchy
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <FolderTree className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-300">
            {flat?.length || 0} locations
          </span>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-800/20">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Location Tree</h3>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : tree?.length ? (
          <div>
            {tree.map((loc: any) => (
              <LocationNode key={loc.id} location={loc} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            No locations configured yet
          </div>
        )}
      </div>
    </div>
  );
}
