import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import PublicNav from '../../components/PublicNav';

const emissionData = [
    { month: 'Jan 2024', emissions: 4200, credits: 320 },
    { month: 'Mar 2024', emissions: 3900, credits: 410 },
    { month: 'Jun 2024', emissions: 3700, credits: 490 },
    { month: 'Sep 2024', emissions: 3450, credits: 580 },
    { month: 'Dec 2024', emissions: 3200, credits: 670 },
    { month: 'Mar 2025', emissions: 2950, credits: 810 },
];

const leaderboard = [
    { rank: 1, company: 'SolarEdge Industries', sector: 'Energy', reduction: 12400, badge: '🏆' },
    { rank: 2, company: 'GreenTransport Co.', sector: 'Transport', reduction: 9800, badge: '🥈' },
    { rank: 3, company: 'EcoFarm Solutions', sector: 'Agriculture', reduction: 7300, badge: '🥉' },
    { rank: 4, company: 'CleanBuild Corp.', sector: 'Construction', reduction: 5200, badge: '' },
    { rank: 5, company: 'AquaPure Mfg.', sector: 'Manufacturing', reduction: 4100, badge: '' },
];

const activity = [
    { time: '2 min ago', event: 'SolarEdge Industries submission approved', type: 'approved' },
    { time: '15 min ago', event: 'GreenTransport Co. earned 480 carbon credits', type: 'credit' },
    { time: '1 hr ago', event: 'AquaPure Mfg. anomaly detected — resubmission required', type: 'flagged' },
    { time: '3 hr ago', event: 'CleanBuild Corp. audit report published on blockchain', type: 'blockchain' },
    { time: '5 hr ago', event: 'National carbon credit price updated: $24.80/tCO₂e', type: 'market' },
];

const stats = [
    { label: 'Total CO₂ Reduced', value: '2.95M tCO₂e', icon: 'co2', trend: '+8.4%', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Credits Issued', value: '98,500', icon: 'token', trend: '+12.1%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Registered Industries', value: '342', icon: 'factory', trend: '+18', color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Certified Auditors', value: '47', icon: 'fact_check', trend: '+3', color: 'text-cyan-600', bg: 'bg-cyan-50' },
];

export default function PublicDashboard() {
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <PublicNav />

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">National Carbon Dashboard</h1>
                    <p className="text-gray-400 mt-1">Public emission monitoring data · Auto-refreshed every 5 minutes</p>
                </div>

                {/* Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {stats.map(s => (
                        <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                                    <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{s.trend} this month</span>
                            </div>
                            <p className="text-3xl font-black text-gray-900">{s.value}</p>
                            <p className="text-xs text-gray-400 font-medium mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Emission trend chart */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h2 className="font-black text-gray-900 mb-1">National Emission Trend</h2>
                        <p className="text-xs text-gray-400 mb-6">Monthly CO₂ tonnage across all sectors</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={emissionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="emissions" stroke="#1A7A4A" strokeWidth={2.5} dot={{ fill: '#1A7A4A', r: 4 }} name="CO₂e (tonnes)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Credits issued */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h2 className="font-black text-gray-900 mb-1">Carbon Credits Issued</h2>
                        <p className="text-xs text-gray-400 mb-6">Monthly credit tokenization volume</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={emissionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="credits" fill="#1A7A4A" radius={[4, 4, 0, 0]} name="Credits Issued" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Leaderboard + Activity */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Leaderboard */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h2 className="font-black text-gray-900 mb-1">Top Emission Reducers</h2>
                        <p className="text-xs text-gray-400 mb-5">Year-to-date leaders by tCO₂e reduced</p>
                        <div className="space-y-3">
                            {leaderboard.map(l => (
                                <div key={l.rank} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                                    <div className="w-8 text-center">
                                        {l.badge ? <span className="text-xl">{l.badge}</span> : <span className="text-sm font-bold text-gray-300">#{l.rank}</span>}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900 text-sm">{l.company}</p>
                                        <p className="text-xs text-gray-400">{l.sector}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-green-600 text-sm">{l.reduction.toLocaleString()}</p>
                                        <p className="text-xs text-gray-400">tCO₂e</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Activity feed */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <h2 className="font-black text-gray-900">Live Activity Feed</h2>
                        </div>
                        <p className="text-xs text-gray-400 mb-5">Real-time compliance events</p>
                        <div className="space-y-4">
                            {activity.map((a, i) => {
                                const colors: Record<string, string> = {
                                    approved: 'bg-green-100 text-green-600',
                                    credit: 'bg-amber-100 text-amber-600',
                                    flagged: 'bg-red-100 text-red-600',
                                    blockchain: 'bg-blue-100 text-blue-600',
                                    market: 'bg-purple-100 text-purple-600',
                                };
                                const icons: Record<string, string> = {
                                    approved: 'check_circle', credit: 'token', flagged: 'warning',
                                    blockchain: 'link', market: 'trending_up',
                                };
                                return (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colors[a.type]}`}>
                                            <span className="material-symbols-outlined text-sm">{icons[a.type]}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-700">{a.event}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
