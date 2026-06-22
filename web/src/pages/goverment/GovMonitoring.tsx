import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function GovMonitoring() {
    const [tab, setTab] = useState<'industries' | 'auditors'>('industries');
    const [search, setSearch] = useState('');
    const [industries, setIndustries] = useState<any[]>([]);
    const [auditors, setAuditors] = useState<any[]>([]);
    const [selectedIndustry, setSelectedIndustry] = useState<any | null>(null);
    const [selectedAuditor, setSelectedAuditor] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [industryRes, auditorRes] = await Promise.all([
                    api.get('/gov/companies'),
                    api.get('/audit/available-auditors')
                ]);

                const companyData = industryRes.data.data.map((c: any) => ({
                    id: c._id,
                    name: c.name,
                    sector: c.sector || 'General',
                    co2: c.totalEmissions || 0,
                    credits: c.creditBalance || 0,
                    status: c.complianceStatus || 'compliant',
                    region: c.state || 'N/A',
                    registrationNumber: c.registrationNumber || 'N/A',
                    adminEmail: c.adminUser?.email || 'N/A'
                }));
                setIndustries(companyData);

                const auditorData = auditorRes.data.data.map((a: any) => ({
                    id: a._id,
                    name: a.name,
                    org: a.organization || 'Independent',
                    certs: a.specializations?.join(', ') || 'N/A',
                    approved: 0,
                    pending: a.activeAssignmentCount || 0,
                    email: a.email
                }));
                setAuditors(auditorData);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load monitoring data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const emissionTrend = [
        { q: 'Q1', co2: 4800 }, { q: 'Q2', co2: 4200 }, { q: 'Q3', co2: 4400 }, { q: 'Q4', co2: selectedIndustry?.co2 || 4200 }
    ];

    const filtered = industries.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.sector.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <div className="p-8 text-center text-gray-500">Loading monitoring data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Industry & Auditor Monitoring</h1>
                    <p className="text-gray-400 text-sm mt-1">Live industry data and auditor profiles</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                    {['industries', 'auditors'].map(t => (
                        <button key={t} onClick={() => setTab(t as 'industries' | 'auditors')} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${tab === t ? 'bg-[#1A7A4A] text-white' : 'text-gray-500 hover:text-gray-900'}`}>{t}</button>
                    ))}
                </div>
            </div>

            {tab === 'industries' && (
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                            <input className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" placeholder="Search industry or sector..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3 text-left">Company</th>
                                        <th className="px-5 py-3 text-left">Sector</th>
                                        <th className="px-5 py-3 text-right">CO₂e (t)</th>
                                        <th className="px-5 py-3 text-right">Credits</th>
                                        <th className="px-5 py-3 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.length > 0 ? filtered.map(i => (
                                        <tr key={i.id} onClick={() => setSelectedIndustry(i)} className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedIndustry?.id === i.id ? 'bg-green-50 border-l-4 border-l-[#1A7A4A]' : ''}`}>
                                            <td className="px-5 py-4 font-bold text-gray-900">{i.name}</td>
                                            <td className="px-5 py-4 text-gray-500 text-xs">{i.sector}</td>
                                            <td className="px-5 py-4 text-right font-mono text-sm font-bold text-gray-900">{i.co2.toLocaleString()}</td>
                                            <td className="px-5 py-4 text-right font-mono text-sm font-bold text-[#1A7A4A]">{i.credits}</td>
                                            <td className="px-5 py-4">
                                                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${i.status === 'compliant' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{i.status}</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500">No industries registered yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {selectedIndustry ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                            <button onClick={() => setSelectedIndustry(null)} className="text-gray-400 hover:text-gray-700 text-sm flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">close</span> Close
                            </button>
                            <div>
                                <p className="font-black text-gray-900 text-lg">{selectedIndustry.name}</p>
                                <p className="text-sm text-gray-400">{selectedIndustry.sector} · {selectedIndustry.region}</p>
                                <p className="text-xs text-gray-400 mt-1">Reg: {selectedIndustry.registrationNumber}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[{ label: 'Annual CO₂e', val: `${selectedIndustry.co2.toLocaleString()} t` }, { label: 'Carbon Credits', val: `${selectedIndustry.credits}` }].map(m => (
                                    <div key={m.label} className="bg-gray-50 rounded-xl p-3 text-center">
                                        <p className="font-black text-gray-900 text-lg">{m.val}</p>
                                        <p className="text-xs text-gray-400">{m.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Emission Trend</p>
                                <ResponsiveContainer width="100%" height={120}>
                                    <LineChart data={emissionTrend}>
                                        <XAxis dataKey="q" tick={{ fontSize: 9 }} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="co2" stroke="#1A7A4A" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="text-xs text-gray-400">Admin: {selectedIndustry.adminEmail}</div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center text-center">
                            <div className="text-gray-300 p-6">
                                <span className="material-symbols-outlined text-4xl">factory</span>
                                <p className="text-sm mt-1">Click a row for details</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {tab === 'auditors' && (
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-3">
                        {auditors.length > 0 ? auditors.map(a => (
                            <div key={a.id} onClick={() => setSelectedAuditor(a)} className={`bg-white rounded-2xl border p-5 shadow-sm cursor-pointer hover:shadow-md transition-all ${selectedAuditor?.id === a.id ? 'border-[#1A7A4A]' : 'border-gray-100'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center font-black text-violet-600">{a.name[0]}</div>
                                    <div className="flex-1">
                                        <p className="font-black text-gray-900">{a.name}</p>
                                        <p className="text-xs text-gray-400">{a.org} · {a.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-[#1A7A4A]">{a.approved} approved</p>
                                        <p className="text-xs text-orange-500">{a.pending} active</p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">No auditors registered yet.</div>
                        )}
                    </div>
                    {selectedAuditor ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                            <button onClick={() => setSelectedAuditor(null)} className="text-gray-400 hover:text-gray-700 text-sm flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">close</span>Close
                            </button>
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center font-black text-violet-600 text-xl mx-auto">{selectedAuditor.name[0]}</div>
                                <p className="font-black text-gray-900 mt-3">{selectedAuditor.name}</p>
                                <p className="text-sm text-gray-400">{selectedAuditor.org}</p>
                                <p className="text-xs text-gray-400">{selectedAuditor.email}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-green-50 rounded-xl p-3 text-center"><p className="font-black text-green-600 text-xl">{selectedAuditor.approved}</p><p className="text-xs text-gray-400">Approved</p></div>
                                <div className="bg-orange-50 rounded-xl p-3 text-center"><p className="font-black text-orange-600 text-xl">{selectedAuditor.pending}</p><p className="text-xs text-gray-400">Active</p></div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Certifications</p>
                                <p className="text-sm text-gray-700">{selectedAuditor.certs}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center text-center">
                            <div className="text-gray-300 p-6"><span className="material-symbols-outlined text-4xl">fact_check</span><p className="text-sm mt-1">Select an auditor</p></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
