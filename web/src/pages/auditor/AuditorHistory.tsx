import { useState } from 'react';

const history = [
    { id: 'AUD-2024-0084', company: 'SteelMax Industries', period: 'Q4 2024', decision: 'Approved', date: '2026-03-07', co2: '4,200 tCO₂e', score: 91 },
    { id: 'AUD-2024-0081', company: 'GreenTransport Co.', period: 'Q3 2024', decision: 'Approved', date: '2026-02-28', co2: '1,400 tCO₂e', score: 98 },
    { id: 'AUD-2024-0078', company: 'AgroChem United', period: 'Q2 2024', decision: 'Rejected', date: '2026-02-14', co2: '6,500 tCO₂e', score: 0 },
    { id: 'AUD-2024-0075', company: 'SolarEdge Industries', period: 'Q2 2024', decision: 'Approved', date: '2026-01-15', co2: '3,800 tCO₂e', score: 99 },
    { id: 'AUD-2024-0068', company: 'CoalTech Energy', period: 'Q1 2024', decision: 'Approved', date: '2025-12-20', co2: '7,900 tCO₂e', score: 82 },
];

const notifications = [
    { id: 1, type: 'assignment', title: 'New Audit Assigned', body: 'AgroChem United Q4 2024 — deadline March 14', time: '2 hr ago', read: false },
    { id: 2, type: 'deadline', title: 'Deadline Approaching', body: 'SteelMax Industries — 2 days remaining', time: '4 hr ago', read: false },
    { id: 3, type: 'resubmit', title: 'Resubmission Received', body: 'GreenTransport Co. resubmitted Q3 data with corrections', time: 'Yesterday', read: true },
    { id: 4, type: 'system', title: 'AI Model Updated', body: 'Anomaly detection model retrained with updated baselines', time: '2 days ago', read: true },
    { id: 5, type: 'cert', title: 'Certification Expiry Reminder', body: 'Your ISO 14064 certification expires in 28 days', time: '3 days ago', read: true },
];

export default function AuditorHistory() {
    const [tab, setTab] = useState<'history' | 'notifications'>('history');
    const [selectedHistory, setSelectedHistory] = useState<typeof history[0] | null>(null);

    const notifIcons: Record<string, string> = {
        assignment: 'assignment',
        deadline: 'schedule',
        resubmit: 'refresh',
        system: 'computer',
        cert: 'badge',
    };

    const notifColors: Record<string, string> = {
        assignment: 'text-blue-600 bg-blue-50',
        deadline: 'text-orange-600 bg-orange-50',
        resubmit: 'text-purple-600 bg-purple-50',
        system: 'text-gray-600 bg-gray-100',
        cert: 'text-amber-600 bg-amber-50',
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">History & Notifications</h1>
                    <p className="text-gray-400 text-sm mt-1">Audit history and notification inbox</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                    {['history', 'notifications'].map(t => (
                        <button key={t} onClick={() => setTab(t as 'history' | 'notifications')} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${tab === t ? 'bg-[#1A7A4A] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                            {t}
                            {t === 'notifications' && (
                                <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">2</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {tab === 'history' && (
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3 text-left">Company</th>
                                    <th className="px-5 py-3 text-left">Period</th>
                                    <th className="px-5 py-3 text-left">CO₂e</th>
                                    <th className="px-5 py-3 text-left">Decision</th>
                                    <th className="px-5 py-3 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {history.map((h, i) => (
                                    <tr key={i} onClick={() => setSelectedHistory(h)} className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedHistory?.id === h.id ? 'bg-green-50 border-l-4 border-l-[#1A7A4A]' : ''}`}>
                                        <td className="px-5 py-4 font-bold text-gray-900">{h.company}</td>
                                        <td className="px-5 py-4 text-gray-600">{h.period}</td>
                                        <td className="px-5 py-4 font-mono text-gray-700">{h.co2}</td>
                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-black px-2 py-1 rounded-lg ${h.decision === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{h.decision}</span>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-gray-400">{h.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {selectedHistory ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-black text-gray-900">Audit Detail</h3>
                                <button onClick={() => setSelectedHistory(null)} className="text-gray-400 hover:text-gray-700">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Company</p>
                                    <p className="font-black text-gray-900 mt-1">{selectedHistory.company}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Report ID</p>
                                    <p className="font-mono text-sm text-gray-700 mt-1">{selectedHistory.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Reporting Period</p>
                                    <p className="text-gray-900 mt-1">{selectedHistory.period}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Total CO₂e</p>
                                    <p className="font-black text-gray-900 mt-1">{selectedHistory.co2}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Compliance Score</p>
                                    <div className={`inline-flex items-center gap-1 mt-1 font-black text-lg ${selectedHistory.score >= 90 ? 'text-green-600' : selectedHistory.score >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                                        {selectedHistory.score > 0 ? `${selectedHistory.score}%` : 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Final Decision</p>
                                    <span className={`inline-block mt-1 text-sm font-black px-3 py-1 rounded-xl ${selectedHistory.decision === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedHistory.decision}</span>
                                </div>
                                <button className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                    <span className="material-symbols-outlined text-sm">download</span>
                                    Download Audit Report
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center text-center p-8">
                            <div className="text-gray-300">
                                <span className="material-symbols-outlined text-5xl">assignment</span>
                                <p className="text-sm font-medium mt-2">Click a row to view details</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {tab === 'notifications' && (
                <div className="space-y-3">
                    {notifications.map(n => (
                        <div key={n.id} className={`bg-white rounded-2xl border p-5 shadow-sm flex items-start gap-4 ${!n.read ? 'border-[#1A7A4A]/30' : 'border-gray-100'}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notifColors[n.type]}`}>
                                <span className="material-symbols-outlined text-sm">{notifIcons[n.type]}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-black text-gray-900 text-sm">{n.title}</p>
                                    {!n.read && <span className="w-2 h-2 bg-[#1A7A4A] rounded-full" />}
                                </div>
                                <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                            </div>
                            <span className="text-xs text-gray-400 flex-shrink-0">{n.time}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
