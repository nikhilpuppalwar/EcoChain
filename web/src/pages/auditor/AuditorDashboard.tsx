import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useState } from 'react';

const stats = [
    { label: 'Assigned Industries', value: '12', icon: 'factory', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Audits', value: '4', icon: 'schedule', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Completed This Period', value: '28', icon: 'check_circle', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Approval Rate', value: '91%', icon: 'thumb_up', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg Turnaround', value: '2.4 days', icon: 'timer', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Dual Audits Active', value: '2', icon: 'group', color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

const monthlyWork = [
    { month: 'Aug', completed: 6, rejected: 1 },
    { month: 'Sep', completed: 8, rejected: 2 },
    { month: 'Oct', completed: 9, rejected: 0 },
    { month: 'Nov', completed: 11, rejected: 1 },
    { month: 'Dec', completed: 10, rejected: 2 },
    { month: 'Jan', completed: 8, rejected: 0 },
];

const approvalTrend = [
    { month: 'Aug', rate: 86 },
    { month: 'Sep', rate: 80 },
    { month: 'Oct', rate: 100 },
    { month: 'Nov', rate: 92 },
    { month: 'Dec', rate: 83 },
    { month: 'Jan', rate: 91 },
];

const upcomingDeadlines = [
    { company: 'SteelMax Industries', period: 'Q4 2024', deadline: 'Mar 10, 2026', priority: 'URGENT', days: 2 },
    { company: 'AgroChem United', period: 'Q4 2024', deadline: 'Mar 14, 2026', priority: 'HIGH', days: 6 },
    { company: 'CoalTech Energy', period: 'Q4 2024', deadline: 'Mar 18, 2026', priority: 'NORMAL', days: 10 },
    { company: 'GreenTransport Co.', period: 'Annual 2024', deadline: 'Mar 22, 2026', priority: 'NORMAL', days: 14 },
];

const activeAssignments = [
    { id: 'SUB-2024-0084', company: 'SteelMax Industries', period: 'Q4 2024', aiFlag: '🔴', assignedDate: 'Mar 7', status: 'Pending Review', auditType: 'dual' },
    { id: 'SUB-2024-0081', company: 'AgroChem United', period: 'Q4 2024', aiFlag: '🟡', assignedDate: 'Mar 8', status: 'In Progress', auditType: 'single' },
    { id: 'SUB-2024-0078', company: 'CoalTech Energy', period: 'Q4 2024', aiFlag: '🟢', assignedDate: 'Mar 9', status: 'Awaiting 2nd Signature', auditType: 'dual' },
    { id: 'SUB-2024-0075', company: 'GreenTransport Co.', period: 'Annual 2024', aiFlag: '🟢', assignedDate: 'Mar 10', status: 'Pending Review', auditType: 'single' },
];

const recentActivity = [
    { event: 'Approved SolarEdge Industries Q3 submission', time: '1 hr ago', icon: 'check_circle', color: 'text-green-600' },
    { event: 'Flagged AgroChem submission — anomaly in Scope 1', time: '3 hr ago', icon: 'warning', color: 'text-orange-600' },
    { event: 'Assigned new audit: CoalTech Energy', time: 'Yesterday', icon: 'assignment', color: 'text-blue-600' },
    { event: 'Requested correction: GreenTransport missing docs', time: 'Yesterday', icon: 'assignment_return', color: 'text-amber-600' },
    { event: 'Rejected AgroChem Q2 submission — inconsistent data', time: '3 days ago', icon: 'cancel', color: 'text-red-600' },
];

const CERT_DAYS_REMAINING = 28; // simulated cert expiry
const SHOW_DUAL_NOTICE = true;

export default function AuditorDashboard() {
    const [dismissCert, setDismissCert] = useState(false);
    const [dismissDual, setDismissDual] = useState(false);

    const priorityColors: Record<string, string> = {
        URGENT: 'bg-red-100 text-red-700',
        HIGH: 'bg-orange-100 text-orange-700',
        NORMAL: 'bg-gray-100 text-gray-600',
    };

    const statusColors: Record<string, string> = {
        'Pending Review': 'bg-amber-100 text-amber-700',
        'In Progress': 'bg-blue-100 text-blue-700',
        'Awaiting 2nd Signature': 'bg-purple-100 text-purple-700',
    };

    return (
        <div className="space-y-5">
            {/* Cert Expiry Warning */}
            {!dismissCert && CERT_DAYS_REMAINING <= 30 && (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-amber-600">badge</span>
                        <div>
                            <p className="font-bold text-amber-800 text-sm">Certification Expiry Warning</p>
                            <p className="text-xs text-amber-700">Your ISO 14064 certification expires in <strong>{CERT_DAYS_REMAINING} days</strong>. Renew to continue auditing.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="text-xs font-bold text-amber-700 underline hover:no-underline">Renew Cert</button>
                        <button onClick={() => setDismissCert(true)} className="text-amber-400 hover:text-amber-700 transition-colors">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Dual Audit Notice */}
            {!dismissDual && SHOW_DUAL_NOTICE && (
                <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-2xl px-5 py-3.5">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-purple-600">group</span>
                        <div>
                            <p className="font-bold text-purple-800 text-sm">Dual Audit — You are Auditor 2</p>
                            <p className="text-xs text-purple-700">
                                <strong>SteelMax Industries</strong> — Dr. Sarah Jenkins (Auditor 1) has submitted: <span className="font-bold text-green-700 bg-green-100 px-1.5 rounded-md">Approved</span>. Review their findings before submitting yours.
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setDismissDual(true)} className="text-purple-400 hover:text-purple-700 transition-colors ml-4 flex-shrink-0">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
            )}

            <div>
                <h1 className="text-2xl font-black text-gray-900">Auditor Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">Welcome back — {activeAssignments.length} audits awaiting your review</p>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                            <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{s.value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts + upcoming deadlines */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Performance chart */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-1">Monthly Audit Performance</h2>
                    <p className="text-xs text-gray-400 mb-5">Completed vs rejected per month</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={monthlyWork}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="completed" fill="#1A7A4A" radius={[4, 4, 0, 0]} name="Approved" />
                            <Bar dataKey="rejected" fill="#ef4444" radius={[4, 4, 0, 0]} name="Rejected" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Approval rate trend */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-1">Approval Rate Trend</h2>
                    <p className="text-xs text-gray-400 mb-5">Last 6 months (%)</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={approvalTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(v) => [`${v}%`, 'Approval Rate']} />
                            <Line type="monotone" dataKey="rate" stroke="#1A7A4A" strokeWidth={2.5} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Upcoming deadlines */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-4">Upcoming Deadlines</h2>
                    <div className="space-y-3">
                        {upcomingDeadlines.map((d, i) => (
                            <div key={i} className={`flex items-center justify-between py-3 border-b border-gray-50 last:border-0 ${d.days <= 3 ? 'bg-red-50 -mx-2 px-2 rounded-xl' : ''}`}>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{d.company}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{d.period} · Due: {d.deadline}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${priorityColors[d.priority]}`}>{d.priority}</span>
                                    <span className={`text-xs font-mono font-bold ${d.days <= 3 ? 'text-red-600' : 'text-gray-400'}`}>{d.days}d</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Assignments + Activity Feed */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Active assignments */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-4">My Active Assignments</h2>
                    <div className="space-y-2">
                        {activeAssignments.map((a, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-xl -mx-2 px-2 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{a.aiFlag}</span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-900 text-sm">{a.company}</p>
                                            {a.auditType === 'dual' && (
                                                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700">DUAL</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">{a.period} · Assigned {a.assignedDate}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${statusColors[a.status] || 'bg-gray-100 text-gray-500'}`}>{a.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {recentActivity.map((a, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className={`material-symbols-outlined ${a.color} text-xl flex-shrink-0 mt-0.5`}>{a.icon}</span>
                                <div>
                                    <p className="text-sm text-gray-700">{a.event}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
