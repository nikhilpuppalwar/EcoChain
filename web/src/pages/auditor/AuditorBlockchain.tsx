import { useState } from 'react';

const records = [
    { id: 'AUD-2024-0084', company: 'SteelMax Industries', period: 'Q4 2024', auditor: 'Jane Doe', hash: '0x8a7c2f9d1b...', ts: '2026-03-07 14:23', status: 'Verified', co2: '4,200 tCO₂e' },
    { id: 'AUD-2024-0081', company: 'GreenTransport Co.', period: 'Q3 2024', auditor: 'Jane Doe', hash: '0x3c1d9f2e4a...', ts: '2026-02-28 09:15', status: 'Verified', co2: '1,400 tCO₂e' },
    { id: 'AUD-2024-0075', company: 'SolarEdge Industries', period: 'Q2 2024', auditor: 'Jane Doe', hash: '0x1f4ab8e3c7...', ts: '2026-01-15 16:42', status: 'Verified', co2: '3,800 tCO₂e' },
    { id: 'AUD-2024-0068', company: 'AgroChem United', period: 'Q1 2024', auditor: 'Jane Doe', hash: '0xb29ec4f7a1...', ts: '2025-12-20 11:08', status: 'Verified', co2: '2,650 tCO₂e' },
];

const complianceData = [
    { company: 'SteelMax Industries', limit: 4200, actual: 4200, sector: 'Manufacturing', score: 72 },
    { company: 'GreenTransport Co.', limit: 1800, actual: 1400, sector: 'Transport', score: 94 },
    { company: 'SolarEdge Industries', limit: 5000, actual: 3800, sector: 'Energy', score: 98 },
    { company: 'AgroChem United', limit: 3000, actual: 2650, sector: 'Agriculture', score: 88 },
    { company: 'CoalTech Energy', limit: 8000, actual: 8900, sector: 'Energy', score: 45 },
];

export default function AuditorBlockchain() {
    const [tab, setTab] = useState<'records' | 'compliance'>('records');
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

    const handleCopy = (hash: string, i: number) => {
        navigator.clipboard.writeText(hash);
        setCopiedIdx(i);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Blockchain Records & Compliance</h1>
                    <p className="text-gray-400 text-sm mt-1">On-chain audit records and compliance verification</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                    {[{ id: 'records', label: 'Blockchain Records' }, { id: 'compliance', label: 'Compliance Checker' }].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id as 'records' | 'compliance')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.id ? 'bg-[#1A7A4A] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {tab === 'records' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <span className="font-black text-gray-900">On-Chain Audit Records — Polygon Network</span>
                        <span className="ml-auto text-xs text-gray-400">All hashes are SHA-256 of verified PDFs</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3 text-left">Report ID</th>
                                    <th className="px-5 py-3 text-left">Company</th>
                                    <th className="px-5 py-3 text-left">Period</th>
                                    <th className="px-5 py-3 text-left">Block Hash</th>
                                    <th className="px-5 py-3 text-left">Integrity</th>
                                    <th className="px-5 py-3 text-left">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {records.map((r, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-4 font-mono text-xs font-bold text-gray-700">{r.id}</td>
                                        <td className="px-5 py-4 font-bold text-gray-900">{r.company}</td>
                                        <td className="px-5 py-4 text-gray-600">{r.period}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs text-[#1A7A4A]">{r.hash}</span>
                                                <button onClick={() => handleCopy(r.hash, i)} className="text-gray-300 hover:text-gray-600 transition-colors">
                                                    <span className="material-symbols-outlined text-sm">{copiedIdx === i ? 'check' : 'content_copy'}</span>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="flex items-center gap-1 text-xs font-black text-green-600">
                                                <span className="material-symbols-outlined text-sm">verified</span>
                                                INTACT
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-gray-400 font-mono">{r.ts}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'compliance' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h3 className="font-black text-gray-900">Emission Limit vs Actual</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Red = over limit, Green = within limit, Score = compliance percentage</p>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {complianceData.map((c, i) => {
                                const overLimit = c.actual > c.limit;
                                const pct = Math.min((c.actual / c.limit) * 100, 110);
                                return (
                                    <div key={i} className={`p-5 ${overLimit ? 'bg-red-50/50' : ''}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="font-black text-gray-900">{c.company}</p>
                                                <p className="text-xs text-gray-400">{c.sector}</p>
                                            </div>
                                            <div className="text-right flex items-center gap-3">
                                                <div>
                                                    <p className={`font-black text-lg ${overLimit ? 'text-red-600' : 'text-green-600'}`}>
                                                        {c.actual.toLocaleString()} tCO₂e
                                                    </p>
                                                    <p className="text-xs text-gray-400">Limit: {c.limit.toLocaleString()}</p>
                                                </div>
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-sm border-4 ${c.score >= 90 ? 'border-green-500 text-green-600' : c.score >= 70 ? 'border-amber-500 text-amber-600' : 'border-red-500 text-red-600'}`}>
                                                    {c.score}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`absolute left-0 top-0 h-full rounded-full transition-all ${overLimit ? 'bg-red-500' : 'bg-[#1A7A4A]'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                                            {/* Limit marker */}
                                            <div className="absolute right-0 top-0 h-full w-0.5 bg-gray-400" />
                                        </div>
                                        {overLimit && (
                                            <p className="text-xs text-red-600 font-bold mt-1.5 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">warning</span>
                                                Over limit by {(c.actual - c.limit).toLocaleString()} tCO₂e — penalty applicable
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
