import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const sectors = ['Manufacturing', 'Energy', 'Transport', 'Agriculture'];

const sectorTrend = {
    Manufacturing: [{ q: 'Q1', val: 5400 }, { q: 'Q2', val: 5100 }, { q: 'Q3', val: 4700 }, { q: 'Q4', val: 4200 }],
    Energy: [{ q: 'Q1', val: 8200 }, { q: 'Q2', val: 7800 }, { q: 'Q3', val: 7200 }, { q: 'Q4', val: 6700 }],
    Transport: [{ q: 'Q1', val: 3200 }, { q: 'Q2', val: 3000 }, { q: 'Q3', val: 2800 }, { q: 'Q4', val: 2600 }],
    Agriculture: [{ q: 'Q1', val: 2600 }, { q: 'Q2', val: 2500 }, { q: 'Q3', val: 2400 }, { q: 'Q4', val: 2300 }],
};

const topPolluters = [
    { name: 'PetroChem Corp.', co2: 28400 },
    { name: 'SteelMax Ind.', co2: 22100 },
    { name: 'CoalTech Energy', co2: 19800 },
    { name: 'HeavyAuto Works', co2: 14200 },
    { name: 'AgroChem United', co2: 11000 },
];

const flaggedSubmissions = [
    { company: 'CoalTech Energy', period: 'Q4 2024', riskScore: 87, reason: 'Scope 1 emissions 94% above sector baseline', status: 'Under Review' },
    { company: 'AgroChem United', period: 'Q3 2024', riskScore: 72, reason: 'Methane values inconsistent with livestock count', status: 'Resubmitted' },
    { company: 'PetroChem Corp.', period: 'Q2 2024', riskScore: 91, reason: 'Process emissions 2.3x expected — possible underreporting', status: 'Escalated' },
];

const nationalForecast = [
    { month: 'Apr', forecast: 2850 }, { month: 'May', forecast: 2780 }, { month: 'Jun', forecast: 2720 },
    { month: 'Jul', forecast: 2650 }, { month: 'Aug', forecast: 2600 }, { month: 'Sep', forecast: 2530 },
];

export default function GovAnalytics() {
    const [tab, setTab] = useState<'sector' | 'ai'>('sector');
    const [selectedSector, setSelectedSector] = useState<keyof typeof sectorTrend>('Manufacturing');
    const [expandedFlag, setExpandedFlag] = useState<number | null>(null);

    const riskColor = (score: number) =>
        score >= 85 ? 'bg-red-100 text-red-700' : score >= 70 ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Sector Analytics & AI Monitor</h1>
                    <p className="text-gray-400 text-sm mt-1">Sector trends, top polluters, and AI fraud detection results</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                    {[{ id: 'sector', label: 'Sector Analytics' }, { id: 'ai', label: 'AI Monitor' }].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id as 'sector' | 'ai')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.id ? 'bg-[#1A7A4A] text-white' : 'text-gray-500 hover:text-gray-900'}`}>{t.label}</button>
                    ))}
                </div>
            </div>

            {tab === 'sector' && (
                <div className="space-y-5">
                    <div className="flex flex-wrap gap-2">
                        {sectors.map(s => (
                            <button key={s} onClick={() => setSelectedSector(s as keyof typeof sectorTrend)} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${selectedSector === s ? 'bg-[#1A7A4A] text-white border-[#1A7A4A]' : 'bg-white text-gray-500 border-gray-200'}`}>{s}</button>
                        ))}
                    </div>
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-black text-gray-900 mb-1">{selectedSector} — Quarterly Trend 2024</h3>
                            <p className="text-xs text-gray-400 mb-5">tCO₂e per quarter</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={sectorTrend[selectedSector]}>
                                    <defs>
                                        <linearGradient id="sectorGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1A7A4A" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#1A7A4A" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="q" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="val" stroke="#1A7A4A" fill="url(#sectorGrad)" strokeWidth={2.5} name="tCO₂e" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-black text-gray-900 mb-4">Top 5 Polluters — All Sectors</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={topPolluters} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 10 }} />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                                    <Tooltip />
                                    <Bar dataKey="co2" fill="#ef4444" radius={[0, 4, 4, 0]} name="tCO₂e" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'ai' && (
                <div className="space-y-5">
                    <div className="grid sm:grid-cols-3 gap-4">
                        {[
                            { label: 'Submissions Analyzed', val: '342', icon: 'analytics', color: 'text-blue-600 bg-blue-50' },
                            { label: 'Anomalies Detected', val: '14 (4.1%)', icon: 'warning', color: 'text-orange-600 bg-orange-50' },
                            { label: 'High Risk (>80)', val: '3', icon: 'dangerous', color: 'text-red-600 bg-red-50' },
                        ].map(s => (
                            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                                    <span className="material-symbols-outlined">{s.icon}</span>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-gray-900">{s.val}</p>
                                    <p className="text-xs text-gray-400">{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                            <h3 className="font-black text-gray-900">Flagged Submissions</h3>
                            {flaggedSubmissions.map((f, i) => (
                                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                                    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left" onClick={() => setExpandedFlag(expandedFlag === i ? null : i)}>
                                        <div>
                                            <p className="font-black text-gray-900 text-sm">{f.company}</p>
                                            <p className="text-xs text-gray-400">{f.period}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-black px-2 py-1 rounded-lg ${riskColor(f.riskScore)}`}>Risk: {f.riskScore}</span>
                                            <span className="material-symbols-outlined text-gray-400 text-sm">{expandedFlag === i ? 'expand_less' : 'expand_more'}</span>
                                        </div>
                                    </button>
                                    {expandedFlag === i && (
                                        <div className="px-4 pb-4 text-sm border-t border-gray-50 pt-3">
                                            <p className="text-red-600 font-medium flex items-start gap-2">
                                                <span className="material-symbols-outlined text-sm mt-0.5">warning</span>
                                                {f.reason}
                                            </p>
                                            <div className="flex items-center gap-2 mt-3">
                                                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${f.status === 'Escalated' ? 'bg-red-100 text-red-700' : f.status === 'Under Review' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{f.status}</span>
                                                <button className="text-xs font-bold text-[#1A7A4A] hover:underline ml-auto">Assign Auditor →</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <h3 className="font-black text-gray-900 mb-1">National Emission Forecast</h3>
                            <p className="text-xs text-gray-400 mb-4">AI-predicted national CO₂e for next 6 months</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={nationalForecast}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(v) => [`${v} KtCO₂e`, 'Forecast']} />
                                    <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 4 }} name="Forecast" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
