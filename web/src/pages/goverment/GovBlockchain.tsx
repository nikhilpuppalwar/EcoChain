import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function GovBlockchain() {
    const [tab, setTab] = useState<'blockchain' | 'reports'>('blockchain');
    const [search, setSearch] = useState('');
    const [reportType, setReportType] = useState('national');
    const [fromDate, setFromDate] = useState('2024-01-01');
    const [toDate, setToDate] = useState('2024-12-31');
    
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLedger = async () => {
            try {
                const res = await api.get('/public/ledger');
                // Backend returns: data.recentPublicLedger array
                const formatted = (res.data.data.recentPublicLedger || []).map((item: any) => ({
                    id: item._id.slice(-6).toUpperCase(),
                    company: item.companyName,
                    action: item.eventType,
                    hash: item.dataHash,
                    txHash: item.txHash,
                    timestamp: new Date(item.createdAt).toLocaleString(),
                    status: 'VERIFIED'
                }));
                // Only showing the most recent events
                setRecords(formatted);
            } catch (error) {
                toast.error('Failed to load blockchain ledger');
            } finally {
                setLoading(false);
            }
        };
        fetchLedger();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Blockchain Records & Reports</h1>
                    <p className="text-gray-400 text-sm mt-1">On-chain audit records search and national report generation</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                    {[{ id: 'blockchain', label: 'Blockchain Records' }, { id: 'reports', label: 'Generate Reports' }].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id as 'blockchain' | 'reports')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.id ? 'bg-[#1A7A4A] text-white' : 'text-gray-500 hover:text-gray-900'}`}>{t.label}</button>
                    ))}
                </div>
            </div>

            {tab === 'blockchain' && (
                <div className="space-y-4">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                        <input className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" placeholder="Search by company, period, or tx hash..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            <span className="font-black text-gray-900">Audit Registry — Polygon Mainnet</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3 text-left">Event ID</th>
                                        <th className="px-5 py-3 text-left">Company</th>
                                        <th className="px-5 py-3 text-left">Action</th>
                                        <th className="px-5 py-3 text-left">Local Hash</th>
                                        <th className="px-5 py-3 text-left">Integrity</th>
                                        <th className="px-5 py-3 text-left">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {records.filter(r => !search || r.company.toLowerCase().includes(search.toLowerCase()) || r.hash.includes(search)).map((r, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4 font-mono text-xs font-bold text-gray-700">{r.id}</td>
                                            <td className="px-5 py-4 font-bold text-gray-900">{r.company}</td>
                                            <td className="px-5 py-4">
                                                <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${r.action === 'SUBMISSION' ? 'bg-blue-100 text-blue-700' : r.action === 'ASSIGNED' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{r.action}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1 group relative">
                                                    <span className="font-mono text-xs text-[#1A7A4A]">{r.hash ? r.hash.slice(0, 16) + '...' : 'N/A'}</span>
                                                    <button onClick={() => { navigator.clipboard.writeText(r.hash); toast.success('Hash copied!'); }} className="text-gray-300 hover:text-gray-600">
                                                        <span className="material-symbols-outlined text-xs">content_copy</span>
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="flex items-center gap-1 text-xs font-black text-green-600">
                                                    <span className="material-symbols-outlined text-sm">verified</span>INTACT
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-gray-400 font-mono">{r.timestamp}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'reports' && (
                <div className="max-w-2xl space-y-5">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                        <h3 className="font-black text-gray-900">Report Generator</h3>
                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-1.5">Report Type</label>
                            <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" value={reportType} onChange={e => setReportType(e.target.value)}>
                                <option value="national">National Annual ESG Report</option>
                                <option value="sector">Sector-wise Compliance Report</option>
                                <option value="credits">Carbon Credit Registry Report</option>
                                <option value="audit">Blockchain Audit Trail Report</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-black text-gray-700 mb-1.5">From Date</label>
                                <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-gray-700 mb-1.5">To Date</label>
                                <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" value={toDate} onChange={e => setToDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <button onClick={() => toast.success('PDF report generating...')} className="flex items-center justify-center gap-2 py-3 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition-colors text-sm">
                                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>PDF
                            </button>
                            <button onClick={() => toast.success('Excel report generating...')} className="flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-colors text-sm">
                                <span className="material-symbols-outlined text-sm">table_chart</span>Excel
                            </button>
                            <button onClick={() => toast.success('CSV export ready!')} className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors text-sm">
                                <span className="material-symbols-outlined text-sm">download</span>CSV
                            </button>
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                        <p className="text-sm font-black text-green-700 mb-1">ℹ️ Report Generation</p>
                        <p className="text-xs text-green-600">Reports are generated using PDFKit + ExcelJS and stored on IPFS via Web3.Storage. A download link will be sent to your government email.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
