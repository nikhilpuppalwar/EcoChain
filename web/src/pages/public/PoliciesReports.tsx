import { useState } from 'react';
import PublicNav from '../../components/PublicNav';

const policies = [
    { id: 1, title: 'National Carbon Emissions Cap 2025', sector: 'All', type: 'emission_limit', date: '2025-01-01', version: 2, status: 'Published', summary: 'Sets binding annual CO₂e limits for all registered industrial sectors.' },
    { id: 2, title: 'Manufacturing Sector GHG Protocol Guidelines', sector: 'Manufacturing', type: 'compliance_guideline', date: '2024-09-15', version: 1, status: 'Published', summary: 'Detailed Scope 1, 2, and 3 calculation methodology for manufacturing companies.' },
    { id: 3, title: 'Carbon Credit Trading Rules & Procedures', sector: 'All', type: 'credit_policy', date: '2024-06-01', version: 3, status: 'Published', summary: 'Governs eligible trading parties, listing requirements, and settlement procedures.' },
    { id: 4, title: 'Penalty & Enforcement Framework 2024', sector: 'All', type: 'penalty_rule', date: '2024-04-01', version: 1, status: 'Published', summary: 'Defines fine structures, mandatory offset requirements, and appeals process.' },
    { id: 5, title: 'Renewable Energy Sector Exemption Policy', sector: 'Energy', type: 'compliance_guideline', date: '2025-03-01', version: 1, status: 'DRAFT', summary: 'Proposed partial baseline exemptions for certified renewable energy producers.' },
];

const reports = [
    { id: 1, title: 'National ESG Report 2024 — Annual', year: 2024, type: 'Annual', pages: 148, size: '4.2 MB' },
    { id: 2, title: 'Q3 2024 Carbon Credit Summary', year: 2024, type: 'Quarterly', pages: 38, size: '1.1 MB' },
    { id: 3, title: 'National ESG Report 2023 — Annual', year: 2023, type: 'Annual', pages: 132, size: '3.8 MB' },
    { id: 4, title: 'Sector Compliance Report H1 2024', year: 2024, type: 'Sector', pages: 62, size: '2.1 MB' },
    { id: 5, title: 'National ESG Report 2022 — Annual', year: 2022, type: 'Annual', pages: 118, size: '3.2 MB' },
];

const emissionLimits = [
    { sector: 'Manufacturing', scope1: '5,000 tCO₂e', scope2: '2,000 tCO₂e', total: '7,000 tCO₂e' },
    { sector: 'Energy', scope1: '10,000 tCO₂e', scope2: '3,500 tCO₂e', total: '13,500 tCO₂e' },
    { sector: 'Transport', scope1: '3,000 tCO₂e', scope2: '800 tCO₂e', total: '3,800 tCO₂e' },
    { sector: 'Agriculture', scope1: '2,500 tCO₂e', scope2: '400 tCO₂e', total: '2,900 tCO₂e' },
    { sector: 'Construction', scope1: '4,000 tCO₂e', scope2: '1,200 tCO₂e', total: '5,200 tCO₂e' },
    { sector: 'Mining', scope1: '6,000 tCO₂e', scope2: '2,500 tCO₂e', total: '8,500 tCO₂e' },
];

export default function PoliciesReports() {
    const [tab, setTab] = useState<'policies' | 'reports'>('policies');
    const [search, setSearch] = useState('');
    const [sectorFilter, setSectorFilter] = useState('All');

    const sectors = ['All', 'Manufacturing', 'Energy', 'Transport', 'Agriculture'];

    const filteredPolicies = policies.filter(p =>
        (sectorFilter === 'All' || p.sector === sectorFilter || p.sector === 'All') &&
        (!search || p.title.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <PublicNav />

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Policies & Reports</h1>
                        <p className="text-gray-400 mt-1">Government emission policies, compliance limits, and open ESG report downloads</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                        {[{ id: 'policies', label: 'Policies' }, { id: 'reports', label: 'Reports' }].map(t => (
                            <button key={t.id} onClick={() => setTab(t.id as 'policies' | 'reports')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.id ? 'bg-[#1A7A4A] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {tab === 'policies' && (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="flex flex-wrap gap-3">
                            <div className="flex-1 relative min-w-48">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                                <input className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" placeholder="Search policies..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <div className="flex gap-2">
                                {sectors.map(s => (
                                    <button key={s} onClick={() => setSectorFilter(s)} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${sectorFilter === s ? 'bg-[#1A7A4A] text-white border-[#1A7A4A]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#1A7A4A]/40'}`}>{s}</button>
                                ))}
                            </div>
                        </div>

                        {/* Policies list */}
                        <div className="space-y-3">
                            {filteredPolicies.map(p => (
                                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${p.status === 'Published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{p.status}</span>
                                                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">{p.type.replace('_', ' ')}</span>
                                                <span className="text-xs text-gray-400">v{p.version}</span>
                                            </div>
                                            <h3 className="font-black text-gray-900 text-lg">{p.title}</h3>
                                            <p className="text-sm text-gray-400 mt-1">{p.summary}</p>
                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="text-xs text-gray-400 flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span>Effective: {p.date}</span>
                                                <span className="text-xs font-bold text-[#1A7A4A] bg-green-50 px-2 py-0.5 rounded-full">{p.sector === 'All' ? 'All Sectors' : p.sector}</span>
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-1.5 text-sm font-bold text-[#1A7A4A] border border-[#1A7A4A]/30 px-4 py-2 rounded-xl hover:bg-green-50 transition-colors whitespace-nowrap flex-shrink-0">
                                            <span className="material-symbols-outlined text-sm">download</span>
                                            PDF
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Emission limits table */}
                        <div className="mt-10">
                            <h2 className="text-xl font-black text-gray-900 mb-4">Emission Limits by Sector</h2>
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-5 py-3 text-left">Sector</th>
                                            <th className="px-5 py-3 text-right">Scope 1 Limit</th>
                                            <th className="px-5 py-3 text-right">Scope 2 Limit</th>
                                            <th className="px-5 py-3 text-right">Total Annual Limit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {emissionLimits.map(l => (
                                            <tr key={l.sector} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-4 font-bold text-gray-900">{l.sector}</td>
                                                <td className="px-5 py-4 text-right font-mono text-gray-600">{l.scope1}</td>
                                                <td className="px-5 py-4 text-right font-mono text-gray-600">{l.scope2}</td>
                                                <td className="px-5 py-4 text-right font-black text-[#1A7A4A] font-mono">{l.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'reports' && (
                    <div className="space-y-6">
                        {/* Email subscription */}
                        <div className="bg-gradient-to-r from-[#1A7A4A] to-[#0f4d2d] rounded-2xl p-6 flex items-center justify-between">
                            <div className="text-white">
                                <h3 className="font-black text-lg">Subscribe to New Reports</h3>
                                <p className="text-green-200 text-sm mt-0.5">Get notified when national ESG reports are published</p>
                            </div>
                            <div className="flex gap-2">
                                <input className="bg-white/20 text-white placeholder:text-green-300 border border-white/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 w-56" placeholder="your@email.com" />
                                <button className="bg-white text-[#1A7A4A] font-black px-5 py-2 rounded-xl text-sm hover:bg-green-50 transition-colors">Subscribe</button>
                            </div>
                        </div>

                        {/* Reports grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reports.map(r => (
                                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.type === 'Annual' ? 'bg-blue-100 text-blue-700' : r.type === 'Quarterly' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>{r.type}</span>
                                    </div>
                                    <h3 className="font-black text-gray-900 text-sm leading-snug mb-2">{r.title}</h3>
                                    <p className="text-xs text-gray-400 mb-4">{r.pages} pages · {r.size}</p>
                                    <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                        <span className="material-symbols-outlined text-sm">download</span>
                                        Download PDF
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
