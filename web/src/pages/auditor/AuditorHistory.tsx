import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const notifIcons: Record<string, string> = {
    assignment: 'assignment',
    deadline: 'schedule',
    dual_audit: 'group',
    correction: 'assignment_return',
    blockchain: 'link',
    system: 'notification_important',
    report_approved_by_auditor: 'check_circle',
    report_rejected: 'cancel',
    awaiting_second_auditor: 'hourglass_top',
    compliance_alert: 'warning'
};

const notifColors: Record<string, string> = {
    assignment: 'text-blue-600',
    deadline: 'text-orange-600',
    dual_audit: 'text-purple-600',
    correction: 'text-amber-600',
    blockchain: 'text-green-600',
    system: 'text-gray-500',
    report_approved_by_auditor: 'text-green-600',
    report_rejected: 'text-red-600',
    awaiting_second_auditor: 'text-purple-600',
    compliance_alert: 'text-red-600'
};

export default function AuditorHistory() {
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [performanceStats, setPerformanceStats] = useState<any[]>([]);
    const [notifList, setNotifList] = useState<any[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
    const [tab, setTab] = useState<'history' | 'notifications'>('history');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [histRes, notifRes, statsRes] = await Promise.all([
                    api.get('/audit/history'),
                    api.get('/notifications'),
                    api.get('/audit/dashboard-stats') // for performance header
                ]);
                
                // Map the backend structure to the frontend expectations
                const formattedHistory = histRes.data.data.map((h: any) => ({
                    id: h.reportId,
                    company: h.company,
                    period: h.period,
                    decision: h.decision === 'correction_requested' ? 'correction' : h.decision,
                    submittedDate: h.submittedAt,
                    co2: `${h.totalEmissions?.toLocaleString() || 0} tCO₂e`,
                    riskFlag: h.riskFlag || 'green',
                    riskScore: h.riskScore || 0,
                    auditType: h.auditType || 'single',
                    remarks: h.remarks || 'No remarks provided.'
                }));
                setHistoryData(formattedHistory);
                
                const formattedNotifs = notifRes.data.data.map((n: any) => ({
                    id: n._id,
                    type: n.type,
                    message: n.message,
                    time: new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    read: n.isRead,
                    link: n.link || '#'
                }));
                setNotifList(formattedNotifs);

                // Build performance stats from dashboard api
                const dbStats = statsRes.data.data.stats;
                setPerformanceStats([
                    { label: 'Total Audits Completed', value: dbStats.completedThisPeriod, icon: 'check_circle', color: 'text-green-600' },
                    { label: 'Approval Rate', value: dbStats.approvalRate, icon: 'thumb_up', color: 'text-emerald-600' },
                    { label: 'Pending Audits', value: dbStats.pendingAudits, icon: 'schedule', color: 'text-purple-600' },
                    { label: 'Dual Audits', value: dbStats.dualAuditsActive, icon: 'group', color: 'text-indigo-600' },
                ]);
                
            } catch (err) {
                console.error(err);
                toast.error('Failed to load history data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const unreadCount = notifList.filter(n => !n.read).length;

    const markRead = async (id: string) => {
        setNotifList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            await api.patch(`/notifications/${id}/read`);
        } catch (e) {
            console.error('Failed to mark notification read', e);
        }
    };

    const markAllRead = async () => {
        setNotifList(prev => prev.map(n => ({ ...n, read: true })));
        toast.success('All notifications marked as read');
        try {
            await api.patch(`/notifications/read-all`);
        } catch (e) {
            console.error('Failed to mark all read', e);
        }
    };

    const decisionColor = (d: string) => d === 'approved' ? 'bg-green-100 text-green-700' : d === 'correction' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700';
    const flagEmoji = (f: string) => f === 'red' ? '🔴' : f === 'yellow' ? '🟡' : '🟢';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">History & Notifications</h1>
                    <p className="text-gray-400 text-sm mt-1">Your past audits and system notifications</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                    {[{ id: 'history', label: 'My History' }, { id: 'notifications', label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}` }].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id as 'history' | 'notifications')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.id ? 'bg-[#1A7A4A] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {tab === 'history' && (
                <div className="space-y-5">
                    {/* Performance Stats */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {performanceStats.map(s => (
                            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
                                <span className={`material-symbols-outlined text-2xl block mb-1 ${s.color}`}>{s.icon}</span>
                                <p className="font-black text-gray-900 text-lg">{s.value}</p>
                                <p className="text-xs text-gray-400 leading-tight">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* History Table */}
                    <div className="grid lg:grid-cols-5 gap-5">
                        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h2 className="font-black text-gray-900">Past Audits</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Company</th>
                                            <th className="px-4 py-3 text-left">Period</th>
                                            <th className="px-4 py-3 text-left">Decision</th>
                                            <th className="px-4 py-3 text-left">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {historyData.length > 0 ? historyData.map((r, i) => (
                                            <tr key={i} onClick={() => setSelectedRecord(r)} className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedRecord?.id === r.id ? 'bg-green-50' : ''}`}>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <span>{flagEmoji(r.riskFlag)}</span>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">{r.company}</p>
                                                            <p className="text-xs text-gray-400">{r.co2}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-xs text-gray-600">{r.period}</td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`text-xs font-black px-2 py-0.5 rounded-lg capitalize whitespace-nowrap ${decisionColor(r.decision)}`}>{r.decision.replace('_', ' ')}</span>
                                                </td>
                                                <td className="px-4 py-3.5 text-xs text-gray-400 font-mono whitespace-nowrap">{r.submittedDate}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No past audits found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Detail Panel */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            {selectedRecord ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-black text-gray-900">{selectedRecord.company}</h3>
                                        <button onClick={() => setSelectedRecord(null)} className="text-gray-400 hover:text-gray-700">
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-400 font-mono">{selectedRecord.id}</div>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-xs text-gray-400 mb-0.5">Period</p>
                                            <p className="font-bold text-gray-900">{selectedRecord.period}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-xs text-gray-400 mb-0.5">Audit Type</p>
                                            <p className="font-bold text-gray-900 capitalize">{selectedRecord.auditType}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-xs text-gray-400 mb-0.5">Total CO₂e</p>
                                            <p className="font-bold text-gray-900">{selectedRecord.co2}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-xs text-gray-400 mb-0.5">AI Risk</p>
                                            <p className="font-bold text-gray-900">{flagEmoji(selectedRecord.riskFlag)} {selectedRecord.riskScore}/100</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400 uppercase mb-2 font-bold">Decision</p>
                                        <span className={`text-sm font-black px-3 py-1.5 rounded-xl capitalize ${decisionColor(selectedRecord.decision)}`}>{selectedRecord.decision}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase mb-2 font-bold">Auditor Remarks</p>
                                        <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed italic">"{selectedRecord.remarks}"</p>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button className="flex-1 border border-gray-200 rounded-xl py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                                            <span className="material-symbols-outlined text-sm">download</span>
                                            BRSR PDF
                                        </button>
                                        <button className="flex-1 border border-gray-200 rounded-xl py-2.5 text-xs font-bold text-[#1A7A4A] hover:bg-green-50 transition-colors flex items-center justify-center gap-1.5">
                                            <span className="material-symbols-outlined text-sm">link</span>
                                            View On-Chain
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <span className="material-symbols-outlined text-5xl text-gray-200 mb-3">history</span>
                                    <p className="font-bold text-gray-400">Select an audit record</p>
                                    <p className="text-xs text-gray-300 mt-1">View full details, remarks, and blockchain reference</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {tab === 'notifications' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-600">{unreadCount} unread notifications</p>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs font-bold text-[#1A7A4A] hover:underline flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">mark_email_read</span>
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                        {notifList.length > 0 ? notifList.map(n => (
                            <div key={n.id} className={`flex items-start gap-4 p-5 transition-colors hover:bg-gray-50 ${!n.read ? 'bg-blue-50/40' : ''}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${!n.read ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    <span className={`material-symbols-outlined text-sm ${notifColors[n.type] || 'text-gray-500'}`}>{notifIcons[n.type] || 'info'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm leading-relaxed ${!n.read ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {!n.read && (
                                        <button onClick={() => markRead(n.id)} className="text-xs font-bold text-[#1A7A4A] hover:underline whitespace-nowrap">
                                            Mark read
                                        </button>
                                    )}
                                    {n.link && n.link !== '#' && (
                                        <a href={n.link} className="text-xs font-bold text-gray-400 hover:text-gray-700 flex items-center gap-0.5">
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </a>
                                    )}
                                    {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-gray-500">No notifications</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
