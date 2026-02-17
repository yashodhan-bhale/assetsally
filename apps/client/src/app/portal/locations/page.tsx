'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { MapPin, FolderTree } from 'lucide-react';

export default function LocationsPage() {
    const { data: locations, isLoading } = useQuery({
        queryKey: ['locations'],
        queryFn: () => api.getLocations(),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Locations</h1>
                    <p className="text-slate-400 text-sm mt-1">All configured verification locations</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <FolderTree className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-300">{locations?.length || 0}</span>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : locations?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {locations.map((loc: any) => (
                        <div key={loc.id} className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700/50 transition-all">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-teal-400" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-white font-medium">{loc.name}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{loc.code}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs text-slate-600 px-2 py-0.5 rounded bg-slate-800/50">{loc.levelLabel}</span>
                                        <span className="text-xs text-slate-500">{loc._count?.inventoryItems || 0} assets</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-12 text-center">
                    <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500">No locations available</p>
                </div>
            )}
        </div>
    );
}
