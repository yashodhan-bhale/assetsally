'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { FileCheck, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    DRAFT: { icon: Clock, color: 'bg-slate-500/15 text-slate-400', label: 'In Progress' },
    SUBMITTED: { icon: AlertCircle, color: 'bg-amber-500/15 text-amber-400', label: 'Under Review' },
    APPROVED: { icon: CheckCircle2, color: 'bg-emerald-500/15 text-emerald-400', label: 'Verified' },
    REJECTED: { icon: XCircle, color: 'bg-red-500/15 text-red-400', label: 'Needs Attention' },
};

export default function ReportsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['reports'],
        queryFn: () => api.getAudits(),
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Verification Reports</h1>
                <p className="text-slate-400 text-sm mt-1">Audit verification status for all locations</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : data?.reports?.length ? (
                <div className="space-y-4">
                    {data.reports.map((report: any) => {
                        const sc = statusConfig[report.status] || statusConfig.DRAFT;
                        const StatusIcon = sc.icon;
                        return (
                            <div key={report.id} className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700/50 transition-all">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-white font-medium">{report.location?.name}</h3>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Audited by {report.auditor?.name} — {new Date(report.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.color}`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {sc.label}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                    <span>{report._count?.findings || 0} findings</span>
                                    {report.submittedAt && <span>Submitted: {new Date(report.submittedAt).toLocaleDateString()}</span>}
                                    {report.reviewedAt && <span>Reviewed: {new Date(report.reviewedAt).toLocaleDateString()}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-slate-900/80 border border-slate-800/50 rounded-2xl p-12 text-center">
                    <FileCheck className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500">No verification reports available</p>
                </div>
            )}
        </div>
    );
}
