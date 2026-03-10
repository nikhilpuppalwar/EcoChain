import toast from 'react-hot-toast';

const reportTypes = [
    { id: 'esg', label: 'ESG Sustainability Report', icon: 'eco', desc: 'Comprehensive Scope 1, 2 & 3 report with NLG narrative, charts, and AI analysis.' },
    { id: 'carbon', label: 'Carbon Compliance Report', icon: 'analytics', desc: 'Emission vs. baseline comparison, compliance status, and penalty calculation.' },
    { id: 'cert', label: 'Compliance Certificate', icon: 'workspace_premium', desc: 'Official government-signed compliance certificate for public display.' },
];

export default function IndustryReports() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Reports & Compliance Certificates</h1>
                <p className="text-gray-400 text-sm mt-1">Generate, download, or share your verified compliance reports</p>
            </div>

            {/* Report type selector */}
    

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-black text-gray-900 mb-4">Generate for Period</h2>
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Report Type</label>
                        <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40">
                            <option>Annual 2024</option>
                            <option>Q4 2024</option>
                            <option>Q3 2024</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Format</label>
                        <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40">
                            <option>PDF</option>
                            <option>Excel</option>
                            <option>CSV</option>
                        </select>
                    </div>
                    <button onClick={() => toast.success('Report generation queued!')} className="flex items-center gap-2 px-5 py-2.5 bg-[#1A7A4A] text-white font-black rounded-xl hover:bg-[#15613b] transition-colors text-sm">
                        <span className="material-symbols-outlined text-sm">description</span>
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Compliance certificate section */}
            <div className="bg-gradient-to-br from-[#1A7A4A] to-[#0f4d2d] rounded-2xl p-6 text-white">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-white text-2xl">workspace_premium</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-black text-lg mb-1">Compliance Certificate 2024</h3>
                        <p className="text-green-200 text-sm">Issued by: Ministry of Environment · Signed on: Jan 31, 2025</p>
                        <p className="text-green-200 text-sm mt-0.5">Valid for: Annual reporting period 2024 · Blockchain verified</p>
                    </div>
                    <button onClick={() => toast.success('Certificate downloaded!')} className="flex items-center gap-2 bg-white text-[#1A7A4A] font-black px-4 py-2 rounded-xl hover:bg-green-50 transition-colors text-sm flex-shrink-0">
                        <span className="material-symbols-outlined text-sm">download</span>
                        Download Cert
                    </button>
                </div>
            </div>

            {/* Report history */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <h2 className="font-black text-gray-900">Past Reports</h2>
                </div>
                <div className="divide-y divide-gray-50">
                    {[
                        { name: 'Annual Report 2024', date: 'Feb 15, 2025', size: '2.4 MB', type: 'BRSR' },
                    ].map((r, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-red-500 text-sm">picture_as_pdf</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 text-sm">{r.name}</p>
                                <p className="text-xs text-gray-400">{r.date} · {r.size}</p>
                            </div>
                            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${r.type === 'ESG' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{r.type}</span>
                            <button onClick={() => toast.success('Downloading...')} className="text-xs font-bold text-[#1A7A4A] border border-[#1A7A4A]/30 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors">
                                Download
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
