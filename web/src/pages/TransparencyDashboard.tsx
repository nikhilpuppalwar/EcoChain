import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TransparencyDashboard() {
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Data
    const nationalEmissionsData = [
        { name: '2019', value: 950000, target: 1000000 },
        { name: '2020', value: 890000, target: 980000 },
        { name: '2021', value: 910000, target: 950000 }, // Post-covid rebound
        { name: '2022', value: 870000, target: 900000 },
        { name: '2023', value: 820000, target: 850000 },
        { name: '2024', value: 780000, target: 800000 },
    ];

    const topPerformers = [
        { name: 'SolarFarm India Ltd', sector: 'Renewable Energy', reduction: '45%', credits: 15400 },
        { name: 'GreenAgri Solutions', sector: 'Agriculture', reduction: '32%', credits: 8200 },
        { name: 'EcoTech Innovations', sector: 'Technology', reduction: '28%', credits: 5100 },
    ];

    const recentPublicLedger = [
        { txId: '0x8f2...1a9', date: '2024-03-22', type: 'Retirement', company: 'Global Logistics Corp', amount: 500 },
        { txId: '0x3b1...7c4', date: '2024-03-21', type: 'Issuance', company: 'SolarFarm India Ltd', amount: 5000, project: 'Rajasthan 100MW Solar' },
        { txId: '0x9d4...2e8', date: '2024-03-20', type: 'Retirement', company: 'TechFusion Inc', amount: 150 },
        { txId: '0x5a6...9f3', date: '2024-03-19', type: 'Transfer', company: 'AgriCorp Co.', amount: 1000, to: 'Marketplace' },
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
                        <h3 className="text-4xl font-bold font-syne text-slate-800 mb-2">1.2M</h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Credits Retired (YTD)</p>
                        <p className="text-xs text-slate-500 mt-2">Verified offsets this year</p>
                    </div>
                    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm text-center">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-2xl">corporate_fare</span>
                        </div>
                        <h3 className="text-4xl font-bold font-syne text-slate-800 mb-2">842</h3>
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
                </div>

                {/* Public Ledger */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                        <div>
                            <h3 className="font-bold text-xl font-syne text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">view_list</span>
                                Public Ledger Activity
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Real-time view of immutable blockchain events (Issuances & Retirements).</p>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                            <input
                                type="text"
                                placeholder="Search TxID or Org..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1A7A4A] focus:ring-1 focus:ring-[#1A7A4A]"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white border-b border-slate-200">
                                <tr className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                                    <th className="px-6 py-4">Transaction hash</th>
                                    <th className="px-6 py-4">Event Type</th>
                                    <th className="px-6 py-4">Organization</th>
                                    <th className="px-6 py-4">Amount (CCR)</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentPublicLedger.map((tx, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <a href="#" className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline">{tx.txId}</a>
                                                <span className="material-symbols-outlined text-[14px] text-slate-300 group-hover:text-slate-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer" title="View on Block Explorer">open_in_new</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
                                                ${tx.type === 'Issuance' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                    tx.type === 'Retirement' ? 'bg-red-50 text-red-700 border border-red-200' :
                                                        'bg-slate-100 text-slate-700 border border-slate-200'}
                                            `}>
                                                <span className="material-symbols-outlined text-[14px]">
                                                    {tx.type === 'Issuance' ? 'generating_tokens' : tx.type === 'Retirement' ? 'local_fire_department' : 'swap_horiz'}
                                                </span>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-800">{tx.company}</span>
                                            {tx.project && <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{tx.project}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold font-syne text-slate-800 text-base">{tx.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {tx.date}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
                        <p>Showing recent public events</p>
                        <button className="font-bold text-[#1A7A4A] hover:underline">View All Records</button>
                    </div>
                </div>

                <div className="pb-12 text-center text-sm text-slate-400 mt-12 border-t border-slate-200 pt-8">
                    <p>© 2024 EcoChain National Registry. All data is anchored to public ledgers for cryptographic verifiable transparency.</p>
                </div>
            </main>
        </div>
    );
}
