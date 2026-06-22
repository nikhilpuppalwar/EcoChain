import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts';
import api from '../../lib/api';
import toast from 'react-hot-toast';

type Tab = 'industries' | 'auditors' | 'sectors' | 'ai';

export default function GovIndustriesAnalytics() {
    const [tab, setTab] = useState<Tab>('industries');
    const [search, setSearch] = useState('');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedIndustry, setSelectedIndustry] = useState<any>(null);
    const [expandedFlag, setExpandedFlag] = useState<number | null>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/gov/monitoring-analytics');
                if (res.data.success) setData(res.data.data);
            } catch {
                toast.error('Failed to load monitoring data');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'industries', label: 'Industries', icon: 'factory' },
        { id: 'auditors', label: 'Auditors', icon: 'verified_user' },
        { id: 'sectors', label: 'Sector Analytics', icon: 'analytics' },
        { id: 'ai', label: 'AI Monitor', icon: 'psychology' },
    ];

    const statusColor = (s: string) =>
        s === 'Compliant' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : s === 'At Risk' ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-red-50 text-red-700 border-red-200';

    const riskColor = (score: number) =>
        score >= 85 ? 'bg-red-100 text-red-700' : score >= 70 ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700';

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A7A4A]" />
            <span className="mt-3 text-slate-500 text-sm font-medium">Loading monitoring data...</span>
        </div>
    );

    const industries: any[] = data?.industries || [];
    const auditors: any[] = data?.auditors || [];
    const topPolluters: any[] = data?.topPolluters || [];
    const sectorData: any[] = data?.sectorData || [];
    const flaggedSubmissions: any[] = data?.flaggedSubmissions || [];
    const aiStats = data?.aiStats || { total: 0, flaggedCount: 0, highRisk: 0, pctFlagged: '0' };
    const summary = data?.summary || {};

    const filteredIndustries = industries.filter(i =>
        !search || i.name?.toLowerCase().includes(search.toLowerCase()) || i.sector?.toLowerCase().includes(search.toLowerCase())
    );
    const filteredAuditors = auditors.filter(a =>
        !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.organization?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">Industry Monitor & Analytics</h1>
                    <p className="text-sm text-slate-500 mt-1">Unified view of industries, auditors, sector trends and AI anomaly detection.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search name, sector..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/30"
                    />
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Industries', value: summary.totalIndustries ?? industries.length, icon: 'factory', color: 'text-blue-600 bg-blue-50' },
                    { label: 'Total Auditors', value: summary.totalAuditors ?? auditors.length, icon: 'verified_user', color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Non-Compliant', value: summary.nonCompliant ?? 0, icon: 'dangerous', color: 'text-red-600 bg-red-50' },
                    { label: 'AI Anomalies', value: aiStats.flaggedCount, icon: 'psychology', color: 'text-violet-600 bg-violet-50' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                            <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-syne text-slate-800">{s.value}</p>
                            <p className="text-xs text-slate-400 font-medium">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200 overflow-x-auto">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                                tab === t.id
                                    ? 'border-[#1A7A4A] text-[#1A7A4A] bg-[#1A7A4A]/5'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* INDUSTRIES TAB */}
                    {tab === 'industries' && (
                        <div className="space-y-4">
                            {filteredIndustries.length === 0 ? (
                                <div className="py-12 text-center text-slate-400">No industries found.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                                                <th className="py-3 pr-4">Organization</th>
                                                <th className="py-3 pr-4">Sector / Region</th>
                                                <th className="py-3 pr-4 text-right">Net Emissions</th>
                                                <th className="py-3 pr-4 text-right">Cap</th>
                                                <th className="py-3 pr-4">Status</th>
                                                <th className="py-3 text-right">Penalty</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredIndustries.map(i => (
                                                <tr
                                                    key={i.id}
                                                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                                                    onClick={() => setSelectedIndustry(selectedIndustry?.id === i.id ? null : i)}
                                                >
                                                    <td className="py-3 pr-4">
                                                        <p className="font-bold text-slate-800 text-sm">{i.name}</p>
                                                        <p className="text-xs text-slate-400 font-mono">{i.adminEmail}</p>
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <p className="text-sm text-slate-600">{i.sector}</p>
                                                        <p className="text-xs text-slate-400">{i.region}</p>
                                                    </td>
                                                    <td className="py-3 pr-4 text-right font-bold text-sm text-slate-800">{i.netEmissions.toLocaleString()}</td>
                                                    <td className="py-3 pr-4 text-right text-sm text-slate-500">{i.cap.toLocaleString()}</td>
                                                    <td className="py-3 pr-4">
                                                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${statusColor(i.complianceStatus)}`}>
                                                            {i.complianceStatus}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-right text-sm font-bold text-slate-800">
                                                        {i.penalty > 0 ? `₹${i.penalty.toLocaleString()}` : <span className="text-slate-300">—</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {selectedIndustry && (
                                <div className="mt-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-slate-800 font-syne">{selectedIndustry.name} — Detail View</h4>
                                        <button onClick={() => setSelectedIndustry(null)} className="text-slate-400 hover:text-slate-600">
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        {[
                                            { label: 'Total Approved Emissions', value: `${selectedIndustry.totalEmissions.toLocaleString()} tCO₂e` },
                                            { label: 'Credits Purchased', value: `${selectedIndustry.creditBalance.toLocaleString()} CCR` },
                                            { label: 'Net Emissions', value: `${selectedIndustry.netEmissions.toLocaleString()} tCO₂e` },
                                            { label: 'Carbon Budget', value: `${selectedIndustry.cap.toLocaleString()} tCO₂e` },
                                        ].map(m => (
                                            <div key={m.label} className="bg-white rounded-xl p-3 border border-slate-200">
                                                <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                                                <p className="font-bold text-slate-800">{m.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* AUDITORS TAB */}
                    {tab === 'auditors' && (
                        <div className="overflow-x-auto">
                            {filteredAuditors.length === 0 ? (
                                <div className="py-12 text-center text-slate-400">No approved auditors found.</div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                                            <th className="py-3 pr-4">Auditor</th>
                                            <th className="py-3 pr-4">Organization</th>
                                            <th className="py-3 pr-4">Specialization</th>
                                            <th className="py-3 pr-4">Experience</th>
                                            <th className="py-3">License No.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredAuditors.map(a => (
                                            <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3 pr-4">
                                                    <p className="font-bold text-slate-800 text-sm">{a.name}</p>
                                                    <p className="text-xs text-slate-400">{a.email}</p>
                                                </td>
                                                <td className="py-3 pr-4 text-sm text-slate-600">{a.organization}</td>
                                                <td className="py-3 pr-4">
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-bold">{a.specialization}</span>
                                                </td>
                                                <td className="py-3 pr-4 text-sm text-slate-600">{a.experience}</td>
                                                <td className="py-3 font-mono text-xs text-slate-500">{a.licenseNumber}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* SECTOR ANALYTICS TAB */}
                    {tab === 'sectors' && (
                        <div className="space-y-6">
                            <div className="grid lg:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold text-slate-800 font-syne mb-1">Emissions by Sector</h3>
                                    <p className="text-xs text-slate-500 mb-4">Total approved tCO₂e per industry sector</p>
                                    {sectorData.length === 0 ? (
                                        <div className="py-12 text-center text-slate-400">No sector data available yet.</div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={sectorData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                                <YAxis dataKey="sector" type="category" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} width={110} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                                    formatter={(v: any) => [`${Number(v).toLocaleString()} tCO₂e`, 'Emissions']}
                                                />
                                                <Bar dataKey="emissions" fill="#1A7A4A" barSize={20} radius={[0, 6, 6, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 font-syne mb-1">Top Polluters</h3>
                                    <p className="text-xs text-slate-500 mb-4">Highest emitting organizations (all time)</p>
                                    {topPolluters.length === 0 ? (
                                        <div className="py-12 text-center text-slate-400">No polluter data yet.</div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={topPolluters} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} width={120} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                                    formatter={(v: any) => [`${Number(v).toLocaleString()} tCO₂e`, 'Total Emissions']}
                                                />
                                                <Bar dataKey="co2" fill="#ef4444" barSize={18} radius={[0, 6, 6, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                            {sectorData.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                                                <th className="py-3 pr-4">Sector</th>
                                                <th className="py-3 pr-4 text-right">Total Emissions (tCO₂e)</th>
                                                <th className="py-3 text-right">Reports</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {sectorData.map(s => (
                                                <tr key={s.sector} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-3 pr-4 font-bold text-slate-700 text-sm">{s.sector}</td>
                                                    <td className="py-3 pr-4 text-right text-sm text-slate-600">{s.emissions.toLocaleString()}</td>
                                                    <td className="py-3 text-right text-sm text-slate-600">{s.count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* AI MONITOR TAB */}
                    {tab === 'ai' && (
                        <div className="space-y-6">
                            <div className="grid sm:grid-cols-3 gap-4">
                                {[
                                    { label: 'Submissions Analyzed', val: aiStats.total, icon: 'analytics', color: 'text-blue-600 bg-blue-50' },
                                    { label: `Anomalies Detected (${aiStats.pctFlagged}%)`, val: aiStats.flaggedCount, icon: 'warning', color: 'text-orange-600 bg-orange-50' },
                                    { label: 'High Risk (>80 score)', val: aiStats.highRisk, icon: 'dangerous', color: 'text-red-600 bg-red-50' },
                                ].map(s => (
                                    <div key={s.label} className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                                            <span className="material-symbols-outlined">{s.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold font-syne text-slate-800">{s.val}</p>
                                            <p className="text-xs text-slate-400">{s.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 font-syne mb-3">AI Flagged Submissions</h3>
                                {flaggedSubmissions.length === 0 ? (
                                    <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">check_circle</span>
                                        No anomalies flagged. AI monitoring is active.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {flaggedSubmissions.map((f, i) => (
                                            <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                                                <button
                                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                                                    onClick={() => setExpandedFlag(expandedFlag === i ? null : i)}
                                                >
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{f.company}</p>
                                                        <p className="text-xs text-slate-400">{f.period} · {f.sector}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${riskColor(f.riskScore)}`}>Risk: {f.riskScore}</span>
                                                        <span className="material-symbols-outlined text-slate-400 text-sm">{expandedFlag === i ? 'expand_less' : 'expand_more'}</span>
                                                    </div>
                                                </button>
                                                {expandedFlag === i && (
                                                    <div className="px-4 pb-4 border-t border-slate-50 pt-3 text-sm">
                                                        <p className="text-red-600 font-medium flex items-start gap-2">
                                                            <span className="material-symbols-outlined text-sm mt-0.5">warning</span>
                                                            {f.reason}
                                                        </p>
                                                        <span className={`mt-2 inline-block text-xs font-bold px-2 py-0.5 rounded-full ${f.status === 'Escalated' ? 'bg-red-100 text-red-700' : f.status === 'Reviewed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                            {f.status}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
