import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
    { label: 'Assigned Industries', value: '12', icon: 'factory', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Audits', value: '4', icon: 'schedule', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Completed This Period', value: '28', icon: 'check_circle', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Approval Rate', value: '91%', icon: 'thumb_up', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg Turnaround', value: '2.4 days', icon: 'timer', color: 'text-purple-600', bg: 'bg-purple-50' },
];

const monthlyWork = [
    { month: 'Aug', completed: 6, rejected: 1 },
    { month: 'Sep', completed: 8, rejected: 2 },
    { month: 'Oct', completed: 9, rejected: 0 },
    { month: 'Nov', completed: 11, rejected: 1 },
    { month: 'Dec', completed: 10, rejected: 2 },
    { month: 'Jan', completed: 8, rejected: 0 },
];

const upcomingDeadlines = [
    { company: 'SteelMax Industries', period: 'Q4 2024', deadline: 'Mar 10, 2026', priority: 'URGENT', days: 2 },
    { company: 'AgroChem United', period: 'Q4 2024', deadline: 'Mar 14, 2026', priority: 'HIGH', days: 6 },
    { company: 'CoalTech Energy', period: 'Q4 2024', deadline: 'Mar 18, 2026', priority: 'NORMAL', days: 10 },
    { company: 'GreenTransport Co.', period: 'Annual 2024', deadline: 'Mar 22, 2026', priority: 'NORMAL', days: 14 },
];

const recentActivity = [
    { event: 'Approved SolarEdge Industries Q3 submission', time: '1 hr ago', icon: 'check_circle', color: 'text-green-600' },
    { event: 'Flagged AgroChem submission — pending AI review', time: '3 hr ago', icon: 'warning', color: 'text-orange-600' },
    { event: 'Assigned new audit: CoalTech Energy', time: 'Yesterday', icon: 'assignment', color: 'text-blue-600' },
    { event: 'Certification reminder: expires in 30 days', time: 'Yesterday', icon: 'badge', color: 'text-purple-600' },
];

export default function AuditorDashboard() {
    const priorityColors: Record<string, string> = {
        URGENT: 'bg-red-100 text-red-700',
        HIGH: 'bg-orange-100 text-orange-700',
        NORMAL: 'bg-gray-100 text-gray-600',
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Auditor Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">Welcome back — 4 audits awaiting your review</p>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Performance chart */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-1">Monthly Audit Performance</h2>
                    <p className="text-xs text-gray-400 mb-5">Completed vs rejection breakdown</p>
                    <ResponsiveContainer width="100%" height={220}>
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

                {/* Upcoming deadlines */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-4">Upcoming Deadlines</h2>
                    <div className="space-y-3">
                        {upcomingDeadlines.map((d, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{d.company}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{d.period} · Due: {d.deadline}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${priorityColors[d.priority]}`}>{d.priority}</span>
                                    <span className="text-xs font-mono text-gray-400">{d.days}d</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-black text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    {recentActivity.map((a, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className={`material-symbols-outlined ${a.color}`}>{a.icon}</span>
                            <div>
                                <p className="text-sm text-gray-700">{a.event}</p>
                                <p className="text-xs text-gray-400">{a.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
