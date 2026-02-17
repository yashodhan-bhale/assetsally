'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Package, MapPin, FileCheck, TrendingUp, BarChart3 } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }: {
    icon: any; label: string; value: string | number; color: string;
}) {
    return (
        <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700/50 transition-all">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-slate-700" />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-slate-400 mt-1">{label}</p>
        </div>
    );
}

export default function PortalOverview() {
    const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: () => api.getInventoryStats() });
    const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: () => api.getLocations() });
    const { data: audits } = useQuery({ queryKey: ['audits'], queryFn: () => api.getAudits() });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Overview</h1>
                <p className="text-slate-400 text-sm mt-1">Asset verification status at a glance</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={Package} label="Total Assets" value={stats?.totalItems || 0} color="bg-emerald-500/15 text-emerald-400" />
                <StatCard icon={MapPin} label="Locations" value={locations?.length || 0} color="bg-teal-500/15 text-teal-400" />
                <StatCard icon={FileCheck} label="Completed Audits" value={
                    audits?.reports?.filter((r: any) => r.status === 'APPROVED').length || 0
                } color="bg-cyan-500/15 text-cyan-400" />
            </div>

            {/* Recent approved audits */}
            <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-white">Recent Verified Audits</h3>
                </div>
                {audits?.reports?.filter((r: any) => r.status === 'APPROVED').length ? (
                    <div className="space-y-3">
                        {audits.reports
                            .filter((r: any) => r.status === 'APPROVED')
                            .slice(0, 5)
                            .map((report: any) => (
                                <div key={report.id} className="flex items-center justify-between py-2 border-b border-slate-800/30 last:border-0">
                                    <div>
                                        <p className="text-sm text-white">{report.location?.name}</p>
                                        <p className="text-xs text-slate-500">
                                            Verified {new Date(report.reviewedAt || report.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
                                        Verified ✓
                                    </span>
                                </div>
                            ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">No verified audits yet</p>
                )}
            </div>
        </div>
    );
}
