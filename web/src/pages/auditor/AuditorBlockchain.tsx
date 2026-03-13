import { useState } from 'react';
import toast from 'react-hot-toast';

const records = [
    { id: 'AUD-2024-0084', company: 'SteelMax Industries', sector: 'Manufacturing', period: 'Q4 2024', decision: 'Approved', hash: 'a3f8c2d1e4b9f7a2cd94b8e1f3a92b7d', txHash: '0x8a7c2f9d1b4e3c6a7f9d2e1b4c8a3f9d', onChainDate: '2026-03-07 14:23 UTC', verificationStatus: 'DUAL_VERIFIED', co2: '3,198.7 tCO₂e', auditor1: 'Dr. Sarah Jenkins', auditor2: 'Dr. Jane Smith' },
    { id: 'AUD-2024-0081', company: 'GreenTransport Co.', sector: 'Transport', period: 'Q3 2024', decision: 'Approved', hash: 'b9e2a4f6c8d1e3b7a9f2c4d6e8b1a3f7', txHash: '0x3c1d9f2e4a7b8c6d1e3f9a2b4c8d7e1f', onChainDate: '2026-02-28 09:15 UTC', verificationStatus: 'SINGLE_VERIFIED', co2: '1,400 tCO₂e', auditor1: 'Dr. Jane Smith' },
    { id: 'AUD-2024-0078', company: 'AgroChem United', sector: 'Agriculture', period: 'Q2 2024', decision: 'Rejected', hash: 'c4d1e8b3a6f9c2e7d4b1a8f3c6e9d2b7', txHash: '0x1f4ab8e3c7d9b2f6a4e1c8d3b7f9a2e4', onChainDate: '2026-02-14 16:42 UTC', verificationStatus: 'SINGLE_VERIFIED', co2: '6,500 tCO₂e', auditor1: 'Dr. Jane Smith' },
    { id: 'AUD-2024-0075', company: 'SolarEdge Industries', sector: 'Energy', period: 'Q2 2024', decision: 'Approved', hash: 'd7b4a2e9c1f8d3a6b9e4c7f2d1a8e3b6', txHash: '0xb29ec4f7a1e3d8c6b4f9a2e7d1c8b3f6', onChainDate: '2026-01-15 11:08 UTC', verificationStatus: 'DUAL_VERIFIED', co2: '3,800 tCO₂e', auditor1: 'Dr. Jane Smith', auditor2: 'Prof. Kumar Patel' },
];

const complianceData = [
    { company: 'SteelMax Industries', limits: [{ scope: 'Scope 1', submitted: 2963.0, limit: 3200.0, status: 'within' }, { scope: 'Scope 2', submitted: 229.6, limit: 250.0, status: 'within' }, { scope: 'Scope 3', submitted: 6.1, limit: 50.0, status: 'within' }, { scope: 'Total CO₂e', submitted: 3198.7, limit: 3500.0, status: 'within' }], score: 100, sector: 'Manufacturing' },
    { company: 'GreenTransport Co.', limits: [{ scope: 'Scope 1', submitted: 800, limit: 900, status: 'within' }, { scope: 'Scope 2', submitted: 560, limit: 600, status: 'within' }, { scope: 'Scope 3', submitted: 45, limit: 20, status: 'exceeded' }, { scope: 'Total CO₂e', submitted: 1405, limit: 1800, status: 'within' }], score: 75, sector: 'Transport' },
    { company: 'CoalTech Energy', limits: [{ scope: 'Scope 1', submitted: 7800, limit: 7500, status: 'exceeded' }, { scope: 'Scope 2', submitted: 880, limit: 900, status: 'within' }, { scope: 'Scope 3', submitted: 220, limit: 300, status: 'within' }, { scope: 'Total CO₂e', submitted: 8900, limit: 8700, status: 'exceeded' }], score: 50, sector: 'Energy' },
    { company: 'AgroChem United', limits: [{ scope: 'Scope 1', submitted: 1800, limit: 2000, status: 'within' }, { scope: 'Scope 2', submitted: 620, limit: 650, status: 'within' }, { scope: 'Scope 3', submitted: 230, limit: 200, status: 'exceeded' }, { scope: 'Total CO₂e', submitted: 2650, limit: 3000, status: 'within' }], score: 75, sector: 'Agriculture' },
];

export default function AuditorBlockchain() {
    const [tab, setTab] = useState<'records' | 'compliance'>('records');
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [selectedRecord, setSelectedRecord] = useState<typeof records[0] | null>(null);
    const [hashInput, setHashInput] = useState('');
    const [verifyResult, setVerifyResult] = useState<'found' | 'notfound' | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<string>(complianceData[0].company);

    const handleCopy = (hash: string, i: number) => {
        navigator.clipboard.writeText(hash);
        setCopiedIdx(i);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    const handleVerify = () => {
        if (!hashInput.trim()) { toast.error('Enter a hash to verify'); return; }
        const found = records.some(r => r.hash === hashInput.trim() || r.txHash === hashInput.trim());
        setVerifyResult(found ? 'found' : 'notfound');
    };

    const exportCSV = () => {
        const header = 'Report ID,Company,Period,Decision,CO2e,Tx Hash,Hash,Verification Status,Date\n';
        const rows = records.map(r => `${r.id},${r.company},${r.period},${r.decision},${r.co2},${r.txHash},${r.hash},${r.verificationStatus},${r.onChainDate}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'audit_records.csv'; a.click();
        toast.success('CSV exported');
    };

    const companyData = complianceData.find(c => c.company === selectedCompany)!;

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
                <div className="space-y-5">
                    {/* Records Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                <span className="font-black text-gray-900">My Submitted Reports — Polygon Network</span>
                            </div>
                            <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 transition-colors">
                                <span className="material-symbols-outlined text-sm">download</span>
                                Export CSV
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3 text-left">Report ID</th>
                                        <th className="px-5 py-3 text-left">Company</th>
                                        <th className="px-5 py-3 text-left">Period</th>
                                        <th className="px-5 py-3 text-left">Decision</th>
                                        <th className="px-5 py-3 text-left">Block Hash</th>
                                        <th className="px-5 py-3 text-left">Status</th>
                                        <th className="px-5 py-3 text-left">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {records.map((r, i) => (
                                        <tr key={i} onClick={() => setSelectedRecord(r)} className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedRecord?.id === r.id ? 'bg-green-50' : ''}`}>
                                            <td className="px-5 py-4 font-mono text-xs font-bold text-gray-700">{r.id}</td>
                                            <td className="px-5 py-4 font-bold text-gray-900">{r.company}</td>
                                            <td className="px-5 py-4 text-gray-600">{r.period}</td>
                                            <td className="px-5 py-4">
                                                <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${r.decision === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.decision}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs text-[#1A7A4A]">{r.hash.slice(0, 12)}...</span>
                                                    <button onClick={e => { e.stopPropagation(); handleCopy(r.hash, i); }} className="text-gray-300 hover:text-gray-600 transition-colors">
                                                        <span className="material-symbols-outlined text-sm">{copiedIdx === i ? 'check' : 'content_copy'}</span>
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-xs font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">{r.verificationStatus}</span>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-gray-400 font-mono">{r.onChainDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Per-Record Detail View */}
                    {selectedRecord && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-black text-gray-900">Report Detail — {selectedRecord.id}</h3>
                                <button onClick={() => setSelectedRecord(null)} className="text-gray-400 hover:text-gray-700">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-3">
                                    <div><p className="text-xs text-gray-400 uppercase">Company</p><p className="font-bold text-gray-900">{selectedRecord.company}</p></div>
                                    <div><p className="text-xs text-gray-400 uppercase">Period</p><p className="font-bold text-gray-900">{selectedRecord.period}</p></div>
                                    <div><p className="text-xs text-gray-400 uppercase">Decision</p>
                                        <span className={`text-xs font-black px-2 py-1 rounded-lg ${selectedRecord.decision === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedRecord.decision}</span>
                                    </div>
                                    <div><p className="text-xs text-gray-400 uppercase">CO₂e</p><p className="font-bold text-gray-900">{selectedRecord.co2}</p></div>
                                    <div><p className="text-xs text-gray-400 uppercase">Verification Status</p><span className="text-xs font-bold text-violet-700 bg-violet-100 px-2 py-1 rounded-full">{selectedRecord.verificationStatus}</span></div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase">Report Hash (SHA-256)</p>
                                        <p className="font-mono text-xs text-[#1A7A4A] break-all bg-gray-50 rounded-lg p-2 mt-1">{selectedRecord.hash}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase">TX Hash</p>
                                        <p className="font-mono text-xs text-gray-600 break-all bg-gray-50 rounded-lg p-2 mt-1">{selectedRecord.txHash}</p>
                                    </div>
                                    <div><p className="text-xs text-gray-400 uppercase">Auditor(s)</p>
                                        <p className="font-medium text-gray-900">{selectedRecord.auditor1}{selectedRecord.auditor2 ? ` + ${selectedRecord.auditor2}` : ''}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-3 flex-wrap">
                                <button className="flex items-center gap-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors">
                                    <span className="material-symbols-outlined text-sm">download</span>
                                    Download BRSR PDF
                                </button>
                                <a href={`https://amoy.polygonscan.com/tx/${selectedRecord.txHash}`} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm font-bold text-[#1A7A4A] border border-[#1A7A4A]/30 rounded-xl px-4 py-2 hover:bg-green-50 transition-colors">
                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                    View on Polygonscan ↗
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Hash Integrity Checker */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-black text-gray-900 mb-1">Hash Integrity Checker</h3>
                        <p className="text-xs text-gray-400 mb-4">Paste any report hash or TX hash to verify it exists on-chain</p>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={hashInput}
                                onChange={e => { setHashInput(e.target.value); setVerifyResult(null); }}
                                placeholder="Paste SHA-256 report hash or 0x TX hash..."
                                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 focus:border-[#1A7A4A]"
                            />
                            <button onClick={handleVerify} className="bg-[#1A7A4A] text-white font-bold px-5 py-3 rounded-xl hover:bg-[#15613b] transition-colors text-sm">
                                Verify
                            </button>
                        </div>
                        {verifyResult === 'found' && (
                            <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-600">verified</span>
                                <div>
                                    <p className="font-bold text-green-800 text-sm">✅ Found on-chain</p>
                                    <p className="text-xs text-green-700">This hash is recorded on the Polygon blockchain. The report is tamper-proof and verified.</p>
                                </div>
                            </div>
                        )}
                        {verifyResult === 'notfound' && (
                            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-600">cancel</span>
                                <div>
                                    <p className="font-bold text-red-800 text-sm">❌ Not found on-chain</p>
                                    <p className="text-xs text-red-700">This hash was not found in any on-chain audit record. It may be invalid or tampered.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tab === 'compliance' && (
                <div className="space-y-5">
                    {/* Company Selector */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Select Industry</label>
                        <select
                            value={selectedCompany}
                            onChange={e => setSelectedCompany(e.target.value)}
                            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 focus:border-[#1A7A4A] w-full max-w-xs"
                        >
                            {complianceData.map(c => (
                                <option key={c.company} value={c.company}>{c.company}</option>
                            ))}
                        </select>
                    </div>

                    {/* Compliance Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-black text-gray-900">Compliance Check — {companyData.company}</h3>
                                <p className="text-xs text-gray-400">{companyData.sector} Sector</p>
                            </div>
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 font-black text-sm ${companyData.score >= 90 ? 'border-green-500 text-green-600' : companyData.score >= 70 ? 'border-amber-500 text-amber-600' : 'border-red-500 text-red-600'}`}>
                                {companyData.score}%
                            </div>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                                <tr>
                                    <th className="px-5 py-3 text-left">Emission Scope</th>
                                    <th className="px-5 py-3 text-right">Submitted (tCO₂e)</th>
                                    <th className="px-5 py-3 text-right">Govt Limit (tCO₂e)</th>
                                    <th className="px-5 py-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {companyData.limits.map((l, i) => (
                                    <tr key={i} className={l.status === 'exceeded' ? 'bg-red-50' : 'hover:bg-gray-50'}>
                                        <td className="px-5 py-3.5 font-medium text-gray-900">{l.scope}</td>
                                        <td className={`px-5 py-3.5 text-right font-black ${l.status === 'exceeded' ? 'text-red-600' : 'text-gray-900'}`}>{l.submitted.toLocaleString()}</td>
                                        <td className="px-5 py-3.5 text-right text-gray-600">{l.limit.toLocaleString()}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-xs font-black px-2 py-1 rounded-lg ${l.status === 'within' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {l.status === 'within' ? '✅ Within Limit' : '❌ Exceeded'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-700">
                                Overall Compliance Score: <span className={`${companyData.score >= 90 ? 'text-green-600' : companyData.score >= 70 ? 'text-amber-600' : 'text-red-600'}`}>{companyData.score}%</span>
                            </p>
                            {companyData.score < 75 && (
                                <button
                                    onClick={() => toast.success('Industry flagged for regulatory review. Government G3 notified.')}
                                    className="flex items-center gap-1.5 text-xs font-bold text-red-600 border border-red-300 bg-red-50 rounded-xl px-4 py-2 hover:bg-red-100 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">flag</span>
                                    Flag for Regulatory Review
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
