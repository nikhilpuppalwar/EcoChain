import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface EmissionEntry {
    _id: string;
    emissionSource: string;
    quantityTonnes: number;
    periodMonth: number;
    periodYear: number;
    status: string;
    notes: string;
    location?: string;
    evidenceUrl?: string;
    txHash?: string;
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
    draft:                   { bg: 'bg-slate-100',   text: 'text-slate-600',  label: 'Draft' },
    submitted:               { bg: 'bg-blue-50',     text: 'text-blue-700',   label: 'Submitted' },
    pending:                 { bg: 'bg-blue-50',     text: 'text-blue-700',   label: 'Pending' },
    ai_checking:             { bg: 'bg-purple-50',   text: 'text-purple-700', label: 'AI Checking' },
    ai_flagged:              { bg: 'bg-orange-50',   text: 'text-orange-700', label: 'AI Flagged' },
    pending_govt_assignment: { bg: 'bg-amber-50',    text: 'text-amber-700',  label: 'Awaiting Govt' },
    pending_audit:           { bg: 'bg-amber-50',    text: 'text-amber-700',  label: 'Pending Audit' },
    awaiting_second_auditor: { bg: 'bg-amber-50',    text: 'text-amber-700',  label: 'Awaiting Auditor 2' },
    under_review:            { bg: 'bg-indigo-50',   text: 'text-indigo-700', label: 'Under Review' },
    approved:                { bg: 'bg-emerald-50',  text: 'text-emerald-700',label: 'Approved' },
    rejected:                { bg: 'bg-red-50',      text: 'text-red-700',    label: 'Rejected' },
    correction_requested:    { bg: 'bg-rose-50',     text: 'text-rose-700',   label: 'Correction Needed' },
};

const SCOPE_KEYWORDS: Record<string, string[]> = {
    '1': ['diesel', 'fuel', 'gas', 'vehicle', 'fleet', 'generator', 'boiler', 'furnace', 'combustion'],
    '2': ['electricity', 'power', 'grid', 'purchased', 'steam', 'heat'],
    '3': ['flight', 'travel', 'supply chain', 'logistics', 'waste', 'transport', 'business travel'],
};

function inferScope(source: string): string {
    const lower = source.toLowerCase();
    for (const [scope, keywords] of Object.entries(SCOPE_KEYWORDS)) {
        if (keywords.some(k => lower.includes(k))) return scope;
    }
    return '1'; // default
}

export default function EmissionHistory() {
    const [emissions, setEmissions] = useState<EmissionEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchEmissions = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/emissions');
            setEmissions(res.data.data || []);
        } catch (err: any) {
            toast.error('Failed to load emission history');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmissions();
    }, [fetchEmissions]);

    const filteredEmissions = emissions.filter(e => {
        const scope = inferScope(e.emissionSource);
        const scopeMatch = filter === 'All' || scope === filter.replace('Scope ', '');
        const statusMatch = statusFilter === 'All' || e.status === statusFilter;
        return scopeMatch && statusMatch;
    });

    // Summary stats
    const totalTonnes = emissions.reduce((s, e) => s + e.quantityTonnes, 0);
    const approvedCount = emissions.filter(e => e.status === 'approved').length;
    const pendingCount = emissions.filter(e => !['approved', 'rejected', 'draft'].includes(e.status)).length;

    const monthName = (m: number) => new Date(2000, m - 1).toLocaleString('default', { month: 'short' });

    const SkeletonRow = () => (
        <tr className="animate-pulse border-b border-slate-100">
            {[1,2,3,4,5,6].map(i => (
                <td key={i} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-3/4"></div></td>
            ))}
        </tr>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">Emission History</h1>
                    <p className="text-sm text-slate-500 mt-1">Track all your reported emissions and their verification status.</p>
                </div>
                <button
                    onClick={fetchEmissions}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
                    Refresh
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Reported</p>
                    <p className="text-3xl font-bold font-syne text-slate-800">{totalTonnes.toLocaleString()}</p>
                    <p className="text-sm text-slate-500 mt-0.5">tCO₂e across {emissions.length} records</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Approved</p>
                    <p className="text-3xl font-bold font-syne text-emerald-600">{approvedCount}</p>
                    <p className="text-sm text-slate-500 mt-0.5">records verified & approved</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">In Progress</p>
                    <p className="text-3xl font-bold font-syne text-amber-500">{pendingCount}</p>
                    <p className="text-sm text-slate-500 mt-0.5">records under review</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    {['All', 'Scope 1', 'Scope 2', 'Scope 3'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-sm font-bold rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                    <option value="All">All Statuses</option>
                    {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                        <option key={val} value={val}>{cfg.label}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                <th className="px-6 py-4">Period</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Scope</th>
                                <th className="px-6 py-4 text-right">Amount (tCO₂e)</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <>{[1,2,3,4].map(i => <SkeletonRow key={i} />)}</>
                            ) : filteredEmissions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                                        <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">history</span>
                                        <p className="font-medium">No emission records found.</p>
                                        {emissions.length === 0 && (
                                            <p className="text-sm mt-1">Submit your first emission report from the dashboard.</p>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredEmissions.map(emission => {
                                    const scope = inferScope(emission.emissionSource);
                                    const cfg = STATUS_CONFIG[emission.status] || { bg: 'bg-slate-100', text: 'text-slate-600', label: emission.status };
                                    return (
                                        <tr key={emission._id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono text-sm font-bold text-slate-700">
                                                    {monthName(emission.periodMonth)} {emission.periodYear}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-slate-800 max-w-xs truncate">{emission.emissionSource}</p>
                                                {emission.location && (
                                                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                                                        {emission.location}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                    Scope {scope}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-bold text-slate-800">{emission.quantityTonnes.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    {emission.txHash && (
                                                        <span
                                                            title={`On-chain: ${emission.txHash}`}
                                                            className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">lock</span>
                                                            On-chain
                                                        </span>
                                                    )}
                                                    {emission.evidenceUrl ? (
                                                        <a
                                                            href={emission.evidenceUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[#1A7A4A] hover:text-[#13613a] text-sm font-bold flex items-center gap-1"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">download</span>
                                                            Evidence
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-300 text-sm italic">No doc</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
                    <p>Showing <span className="font-bold text-slate-800">{filteredEmissions.length}</span> of <span className="font-bold text-slate-800">{emissions.length}</span> records</p>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                        <span className="material-symbols-outlined text-[14px] text-[#1A7A4A]">lock</span>
                        Approved records are permanently anchored to the EcoChain blockchain.
                    </div>
                </div>
            </div>
        </div>
    );
}
