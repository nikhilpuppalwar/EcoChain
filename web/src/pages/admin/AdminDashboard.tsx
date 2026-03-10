import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const health = [
    { label: 'Platform Uptime', value: '99.97%', icon: 'check_circle', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Users (24h)', value: '148', icon: 'people', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Submissions Today', value: '23', icon: 'upload', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'API Errors (24h)', value: '2', icon: 'bug_report', color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Blockchain Status', value: 'LIVE', icon: 'link', color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const userCounts = [
    { role: 'Government', count: 12, icon: 'account_balance', color: 'text-blue-600', bg: 'bg-blue-50' },
    { role: 'Auditors', count: 47, icon: 'fact_check', color: 'text-violet-600', bg: 'bg-violet-50' },
    { role: 'Industries', count: 342, icon: 'factory', color: 'text-green-600', bg: 'bg-green-50' },
];

const platformStats = [
    { label: 'Credits Minted', value: '1.24M tCO₂e', icon: 'token', color: 'text-amber-600' },
    { label: 'Credits Traded', value: '892K tCO₂e', icon: 'swap_horiz', color: 'text-blue-600' },
    { label: 'Credits Retired', value: '456K tCO₂e', icon: 'local_fire_department', color: 'text-red-600' },
    { label: 'Market Volume', value: '₹22.4M', icon: 'attach_money', color: 'text-green-600' },
];

const activityData = [
    { day: 'Mon', logins: 42, submissions: 8 },
    { day: 'Tue', logins: 58, submissions: 12 },
    { day: 'Wed', logins: 51, submissions: 9 },
    { day: 'Thu', logins: 67, submissions: 15 },
    { day: 'Fri', logins: 73, submissions: 18 },
    { day: 'Sat', logins: 29, submissions: 5 },
    { day: 'Sun', logins: 19, submissions: 3 },
];

const recentActivity = [
    { event: '23 industries submitted emission data today', type: 'submission', time: '5 min ago' },
    { event: 'New industry registered: HeavyMetal Corp.', type: 'registration', time: '1 hr ago' },
    { event: 'AI model anomaly rate: 4.2% (normal range)', type: 'ai', time: '2 hr ago' },
    { event: 'Govt official Dr. Patel approved 5 credits', type: 'credit', time: '3 hr ago' },
    { event: 'System backup completed successfully', type: 'system', time: '6 hr ago' },
];

export default function AdminDashboard() {
    const typeMap: Record<string, { icon: string; color: string }> = {
        submission: { icon: 'upload', color: 'text-purple-600 bg-purple-50' },
        registration: { icon: 'person_add', color: 'text-green-600 bg-green-50' },
        ai: { icon: 'psychology', color: 'text-blue-600 bg-blue-50' },
        credit: { icon: 'token', color: 'text-amber-600 bg-amber-50' },
        system: { icon: 'computer', color: 'text-gray-600 bg-gray-100' },
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Platform Admin Dashboard</h1>
                    <p className="text-gray-400 text-sm mt-1">System health, user overview, and platform statistics</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-xl border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-green-700">All systems operational</span>
                </div>
            </div>

            {/* Health stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {health.map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                            <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
                        </div>
                        <p className="text-xl font-black text-gray-900">{s.value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Activity chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-1">Weekly Platform Activity</h2>
                    <p className="text-xs text-gray-400 mb-5">Daily logins and submissions</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={activityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="logins" stroke="#1A7A4A" strokeWidth={2} dot={{ r: 3 }} name="Logins" />
                            <Line type="monotone" dataKey="submissions" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Submissions" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* User overview */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-4">User Overview</h2>
                    <div className="space-y-3">
                        {userCounts.map(u => (
                            <div key={u.role} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl ${u.bg} flex items-center justify-center`}>
                                        <span className={`material-symbols-outlined text-sm ${u.color}`}>{u.icon}</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{u.role}</span>
                                </div>
                                <span className="text-2xl font-black text-gray-900">{u.count}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400 text-center">Total users: <span className="font-black text-gray-900">401</span></p>
                    </div>
                </div>
            </div>

            {/* Platform stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {platformStats.map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <span className={`material-symbols-outlined text-2xl ${s.color}`}>{s.icon}</span>
                        <p className="text-2xl font-black text-gray-900 mt-2">{s.value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Activity feed */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-black text-gray-900 mb-4">Recent Platform Activity</h2>
                <div className="space-y-3">
                    {recentActivity.map((a, i) => (
                        <div key={i} className="flex items-center gap-3 py-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${typeMap[a.type].color}`}>
                                <span className="material-symbols-outlined text-sm">{typeMap[a.type].icon}</span>
                            </div>
                            <p className="text-sm text-gray-700 flex-1">{a.event}</p>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{a.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
