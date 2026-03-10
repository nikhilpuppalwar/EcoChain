import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function ComplianceMonitor() {
    const { user } = useAuthStore();
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Data
    const [companies, setCompanies] = useState([
        { id: 'C-001', name: 'Global Logistics Corp', sector: 'Transportation', status: 'Compliant', emissions: 14500, cap: 15000, creditsPurchased: 0, penalty: 0 },
        { id: 'C-002', name: 'TechFusion Inc', sector: 'Technology', status: 'At Risk', emissions: 8200, cap: 8000, creditsPurchased: 150, penalty: 0 },
        { id: 'C-003', name: 'Nexus Manufacturing', sector: 'Manufacturing', status: 'Non-compliant', emissions: 55000, cap: 50000, creditsPurchased: 2000, penalty: 150000 },
        { id: 'C-004', name: 'GreenAgri Solutions', sector: 'Agriculture', status: 'Compliant', emissions: 3100, cap: 4000, creditsPurchased: 0, penalty: 0 },
        { id: 'C-005', name: 'Titan Steelworks', sector: 'Manufacturing', status: 'Non-compliant', emissions: 120000, cap: 100000, creditsPurchased: 5000, penalty: 750000 },
        { id: 'C-006', name: 'SkyHigh Airlines', sector: 'Transportation', status: 'At Risk', emissions: 85000, cap: 82000, creditsPurchased: 2500, penalty: 0 },
    ]);

    const filteredCompanies = companies.filter(c => {
        const matchesFilter = filter === 'All' || c.status === filter;
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const sectorData = [
        { name: 'Manufacturing', emissions: 175000, target: 150000 },
        { name: 'Transportation', emissions: 99500, target: 105000 },
        { name: 'Technology', emissions: 8200, target: 10000 },
        { name: 'Agriculture', emissions: 3100, target: 5000 },
    ];

    const issueNotice = (id: string, name: string) => {
        // Implement notice logic
        console.log(`Issuing official warning/penalty notice to ${name} (${id})`);
        alert(`Official legal notice initiated for ${name}.`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">Compliance & Enforcement</h1>
                    <p className="text-sm text-slate-500 mt-1">Monitor industry adherence to emission caps and issue penalties for non-compliance.</p>
                </div>

                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Export Full Roster
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">gavel</span>
                        Batch Issue Penalties
                    </button>
                </div>
            </div>

            {/* Top Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-[#1A7A4A]"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Compliant</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold font-syne text-slate-800">
                            {companies.filter(c => c.status === 'Compliant').length}
                        </h3>
                        <span className="text-sm text-slate-500 font-medium">Orgs</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-amber-400"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">At Risk (Nearing Cap)</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold font-syne text-slate-800">
                            {companies.filter(c => c.status === 'At Risk').length}
                        </h3>
                        <span className="text-sm text-slate-500 font-medium">Orgs</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Non-Compliant</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold font-syne text-red-600">
                            {companies.filter(c => c.status === 'Non-compliant').length}
                        </h3>
                        <span className="text-sm text-slate-500 font-medium">Orgs</span>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
                    <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Total Penalties Assessed</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold font-syne text-white">
                            ${(companies.reduce((sum, c) => sum + c.penalty, 0) / 1000).toLocaleString()}k
                        </h3>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <span className="material-symbols-outlined text-8xl">account_balance</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Enforement Table */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            {['All', 'Compliant', 'At Risk', 'Non-compliant'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                            <input
                                type="text"
                                placeholder="Search org or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white sticky top-0 border-b border-slate-200 shadow-[0_1px_0_0_#e2e8f0]">
                                <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                                    <th className="px-6 py-4">Organization</th>
                                    <th className="px-6 py-4 text-right">Net Emissions vs Cap</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Penalty</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCompanies.map((company) => {
                                    const netEmissions = company.emissions - company.creditsPurchased;
                                    const percentOfCap = (netEmissions / company.cap) * 100;

                                    return (
                                        <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800 text-sm">{company.name}</div>
                                                <div className="text-xs text-slate-500 font-mono mt-0.5">{company.id} • {company.sector}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className={`font-bold font-syne ${percentOfCap > 100 ? 'text-red-600' : 'text-slate-800'}`}>
                                                            {netEmissions.toLocaleString()}
                                                        </span>
                                                        <span className="text-xs text-slate-500">/ {company.cap.toLocaleString()}</span>
                                                    </div>
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${percentOfCap <= 80 ? 'bg-[#1A7A4A]' : percentOfCap <= 100 ? 'bg-amber-400' : 'bg-red-500'}`}
                                                            style={{ width: `${Math.min(percentOfCap, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border
                                                ${company.status === 'Compliant' ? 'bg-[#2E9E68]/10 text-[#2E9E68] border-[#2E9E68]/20' :
                                                        company.status === 'At Risk' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                            'bg-red-50 text-red-600 border-red-200'}
                                            `}>
                                                    {company.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {company.penalty > 0 ? (
                                                    <span className="font-bold text-slate-800 text-sm">${company.penalty.toLocaleString()}</span>
                                                ) : (
                                                    <span className="text-slate-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {company.status === 'Non-compliant' ? (
                                                    <button
                                                        onClick={() => issueNotice(company.id, company.name)}
                                                        className="text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-sm"
                                                    >
                                                        Issue Notice
                                                    </button>
                                                ) : (
                                                    <button className="text-blue-600 hover:text-blue-800 text-xs font-bold transition-colors">
                                                        View Profile
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                                {filteredCompanies.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            <p>No organizations found matching the criteria.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sector Analysis Sidebar */}
                <div className="lg:col-span-1 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-lg font-syne text-slate-800">Sector Analysis</h3>
                        <p className="text-xs text-slate-500">Emissions vs Allocated Sector Caps</p>
                    </div>
                    <div className="p-6 flex-1 flex items-center justify-center">
                        <div className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={sectorData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} width={100} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="target" name="Sector Cap" fill="#e2e8f0" barSize={20} radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="emissions" name="Current Emissions" fill="#3b82f6" barSize={20} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="p-4 bg-red-50/50 border-t border-red-100 flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-500 shrink-0">warning</span>
                        <p className="text-xs text-red-800 font-medium">
                            <strong className="font-bold">Alert:</strong> The Manufacturing sector has exceeded its national allocated cap by 16.6%. Immediate sector-wide review recommended.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
