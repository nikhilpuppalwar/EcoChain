import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function TransparencyDashboard() {
    const { user } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [recentPublicLedger, setRecentPublicLedger] = useState<any[]>([]);
    const [topPerformers, setTopPerformers] = useState<any[]>([]);
    const [macroStats, setMacroStats] = useState({ totalVerifiedEmissions: 0, participatingEntities: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLedger = async () => {
            try {
                let url = '/public/ledger';
                if (user?.role === 'industry' && user?.company) {
                    url += `?industryId=${user.company}`;
                }
                const res = await api.get(url);
                if (res.data.success) {
                    setRecentPublicLedger(res.data.data.recentPublicLedger || []);
                    setTopPerformers(res.data.data.topPerformers || []);
                    if (res.data.data.macroStats) {
                        setMacroStats(res.data.data.macroStats);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch public ledger", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLedger();
    }, []);

    // Mock Data for the chart since historical national baseline data is complex
    const nationalEmissionsData = [
        { name: '2019', value: 950000, target: 1000000 },
        { name: '2020', value: 890000, target: 980000 },
        { name: '2021', value: 910000, target: 950000 }, // Post-covid rebound
        { name: '2022', value: 870000, target: 900000 },
        { name: '2023', value: 820000, target: 850000 },
        { name: '2024', value: 780000, target: 800000 },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-dmsans">
            {/* Public Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#1A7A4A] to-[#2E9E68] rounded-lg flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-white text-[20px]">eco</span>
                        </div>
                        <span className="text-xl font-bold font-syne text-slate-800 tracking-tight">EcoChain</span>
                    </Link>
                    <div className="flex items-center gap-4 text-sm font-bold">
                        <Link to="/" className="text-slate-500 hover:text-slate-800 transition-colors">Home</Link>
                        <Link to="/login" className="text-[#1A7A4A] hover:text-[#135c37] transition-colors">Portal Login</Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto py-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100">
                        <span className="material-symbols-outlined text-[16px]">public</span>
                        Public Data Portal
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold font-syne text-slate-800 mb-6 leading-tight">
                        National Carbon <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A7A4A] to-[#2980B9]">Transparency</span>
                    </h1>
                    <p className="text-lg text-slate-600">
                        Explore verified emissions data, track national reduction targets, and view immutable blockchain records of corporate climate action.
                    </p>
                </div>

                {/* Macro Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm text-center">
                        <div className="w-12 h-12 bg-[#1A7A4A]/10 text-[#1A7A4A] rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-2xl">trending_down</span>
                        </div>
                        <h3 className="text-4xl font-bold font-syne text-slate-800 mb-2">17.8%</h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">National Emission Reduction</p>
                        <p className="text-xs text-slate-500 mt-2">Since 2019 baseline</p>
                    </div>
                    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm text-center">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-2xl">verified</span>
                        </div>
                        <h3 className="text-4xl font-bold font-syne text-slate-800 mb-2">
                            {macroStats.totalVerifiedEmissions > 0 ? `${(macroStats.totalVerifiedEmissions).toLocaleString()}t` : '0'}
                        </h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Credits Retired (YTD)</p>
                        <p className="text-xs text-slate-500 mt-2">Verified offsets this year</p>
                    </div>
                    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm text-center">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-2xl">corporate_fare</span>
                        </div>
                        <h3 className="text-4xl font-bold font-syne text-slate-800 mb-2">{macroStats.participatingEntities}</h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Participating Entities</p>
                        <p className="text-xs text-slate-500 mt-2">Active reporting organizations</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Public Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-xl font-syne text-slate-800">Historical Emissions vs Target</h3>
                                <p className="text-sm text-slate-500">Aggregated annual data (Metric Tons CO₂e)</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={nationalEmissionsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValuePub" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1A7A4A" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#1A7A4A" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dx={-10} tickFormatter={(val) => `${val / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => [`${Number(value).toLocaleString()} tCO₂e`, 'Emissions']}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#1A7A4A" strokeWidth={3} fillOpacity={1} fill="url(#colorValuePub)" name="Actual Emissions" />
                                    <Area type="monotone" dataKey="target" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Paris Agreement Target" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Performers */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg font-syne text-slate-800">Top Climate Leaders</h3>
                            <span className="material-symbols-outlined text-amber-500">trophy</span>
                        </div>
                        <div className="p-0">
                            <ul className="divide-y divide-slate-100">
                                {topPerformers.map((company, i) => (
                                    <li key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                                        <div className="text-2xl font-bold font-syne text-slate-300 w-6 text-center">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{company.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{company.sector}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-[#1A7A4A]">{company.reduction}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Reduction</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-500">Based on verified 2023 YoY reduction data.</p>
                        </div>
                    </div>
                </div>                {/* Public Ledger */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                        <div>
                            <h3 className="font-bold text-xl font-syne text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">account_tree</span>
                                Blockchain Decentralized Ledger
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Every workflow step is immutably recorded. SUBMISSION → ASSIGNED → AUDIT → MINT.</p>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                            <input
                                type="text"
                                placeholder="Search TX hash or company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1A7A4A] focus:ring-1 focus:ring-[#1A7A4A]"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="py-16 text-center text-slate-400">
                                <span className="material-symbols-outlined text-4xl animate-spin block mb-3">progress_activity</span>
                                Loading blockchain events...
                            </div>
                        ) : recentPublicLedger.length === 0 ? (
                            <div className="py-16 text-center text-slate-400">
                                <span className="material-symbols-outlined text-5xl block mb-3 text-slate-200">link_off</span>
                                <p className="font-medium text-slate-600">No blockchain events recorded yet.</p>
                                <p className="text-sm mt-1">Blockchain events will appear here once Industry submits an emission report.</p>
                            </div>
                        ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white border-b border-slate-200">
                                <tr className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                                    <th className="px-6 py-4">Event Type</th>
                                    <th className="px-6 py-4">Company</th>
                                    <th className="px-6 py-4">Period</th>
                                    <th className="px-6 py-4">Details</th>
                                    <th className="px-6 py-4">TX Hash</th>
                                    <th className="px-6 py-4">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(recentPublicLedger as any[])
                                    .filter((ev: any) => {
                                        if (!searchQuery) return true;
                                        const q = searchQuery.toLowerCase();
                                        return (ev.txHash || '').toLowerCase().includes(q) ||
                                               (ev.companyName || '').toLowerCase().includes(q);
                                    })
                                    .map((ev: any, index: number) => {
                                    const eventConfig: Record<string, { color: string; icon: string; label: string }> = {
                                        SUBMISSION: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'upload', label: 'Submission' },
                                        ASSIGNED: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'assignment_ind', label: 'Assigned' },
                                        AUDIT: { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: 'fact_check', label: 'Audit' },
                                        MINT: { color: 'bg-green-50 text-green-700 border-green-200', icon: 'generating_tokens', label: 'Mint' }
                                    };
                                    const cfg = eventConfig[ev.eventType] || eventConfig.SUBMISSION;
                                    const txShort = ev.txHash ? `${ev.txHash.slice(0, 12)}...${ev.txHash.slice(-6)}` : 'N/A';
                                    return (
                                        <tr key={index} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${cfg.color}`}>
                                                    <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-slate-800">{ev.companyName}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{ev.period || '—'}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-slate-500 max-w-[220px] truncate" title={ev.details}>{ev.details}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs text-blue-600 break-all">{txShort}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(ev.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        )}
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
                        <p>{recentPublicLedger.length} blockchain event{recentPublicLedger.length !== 1 ? 's' : ''} on record</p>
                        <span className="text-xs text-slate-400">Data hash anchored to chain for tamper-proof verification</span>
                    </div>
                </div>

                <div className="pb-12 text-center text-sm text-slate-400 mt-12 border-t border-slate-200 pt-8">
                    <p>© 2024 EcoChain National Registry. All data is anchored to public ledgers for cryptographic verifiable transparency.</p>
                </div>
            </main>
        </div>
    );
}
