import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';

const emissionsData = [
    { name: 'Jan', value: 1200, target: 2000 },
    { name: 'Feb', value: 1900, target: 2000 },
    { name: 'Mar', value: 1500, target: 2000 },
    { name: 'Apr', value: 2100, target: 2000 },
    { name: 'May', value: 1800, target: 2000 },
    { name: 'Jun', value: 2400, target: 2000 },
    { name: 'Jul', value: 1600, target: 2000 },
    { name: 'Aug', value: 1750, target: 2000 },
];

const recentActivity = [
    { id: 1, type: 'credit_purchase', label: 'Purchased Credits', amount: '100 CCR', date: '15 Mar 2026', status: 'completed', statusColor: 'bg-emerald-100 text-emerald-700' },
    { id: 2, type: 'emission_report', label: 'Q1 Emission Report', amount: '450 tCO₂e', date: '10 Mar 2026', status: 'verified', statusColor: 'bg-blue-100 text-blue-700' },
    { id: 3, type: 'credit_retirement', label: 'Retired Credits', amount: '50 CCR', date: '01 Mar 2026', status: 'processing', statusColor: 'bg-amber-100 text-amber-700' },
    { id: 4, type: 'ai_flag', label: 'AI Anomaly Cleared', amount: 'Scope 2 data', date: '28 Feb 2026', status: 'cleared', statusColor: 'bg-purple-100 text-purple-700' },
];

const activityIcons: Record<string, { icon: string; bg: string; color: string }> = {
    credit_purchase: { icon: 'shopping_cart', bg: 'bg-emerald-50', color: 'text-emerald-600' },
    emission_report: { icon: 'cloud_upload', bg: 'bg-blue-50', color: 'text-blue-600' },
    credit_retirement: { icon: 'local_fire_department', bg: 'bg-amber-50', color: 'text-amber-600' },
    ai_flag: { icon: 'psychology', bg: 'bg-purple-50', color: 'text-purple-600' },
};

const quickActions = [
    { label: 'Log Emissions', icon: 'add_circle', to: '/industry/emissions/new', color: 'bg-red-50 text-red-600 hover:bg-red-100 border-red-100' },
    { label: 'Submit Report', icon: 'upload_file', to: '/industry/tracker', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100' },
    { label: 'Buy Credits', icon: 'shopping_cart', to: '/industry/marketplace', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100' },
    { label: 'AI Forecast', icon: 'monitoring', to: '/industry/ai-forecast', color: 'bg-violet-50 text-violet-600 hover:bg-violet-100 border-violet-100' },
    { label: 'My Wallet', icon: 'account_balance_wallet', to: '/industry/wallet', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-100' },
    { label: 'ESG Reports', icon: 'description', to: '/industry/reports', color: 'bg-teal-50 text-teal-600 hover:bg-teal-100 border-teal-100' },
];

// Compliance gauge data
const complianceGauge = [{ name: 'Compliance', value: 83, fill: '#1A7A4A' }];

export default function IndustryDashboard() {
    const { user } = useAuthStore();
    const [aiDismissed, setAiDismissed] = useState(false);

    const stats = [
        { label: 'YTD Emissions', value: '12,500', unit: 'tCO₂e', icon: 'co2', trend: '+2.4% vs last Q', trendUp: true, bg: 'bg-red-50', color: 'text-red-600' },
        { label: 'Active Credits', value: '500', unit: 'CCR', icon: 'token', trend: 'Secure in wallet', trendUp: null, bg: 'bg-emerald-50', color: 'text-emerald-600' },
        { label: 'Pending Retirement', value: '120', unit: 'CCR', icon: 'local_fire_department', trend: 'Awaiting burn', trendUp: null, bg: 'bg-amber-50', color: 'text-amber-600' },
        { label: 'Compliance', value: '83%', unit: '', icon: 'admin_panel_settings', trend: 'Target: 95%', trendUp: false, bg: 'bg-violet-50', color: 'text-violet-600' },
    ];

    return (
        <div className="space-y-6">
            {/* ── AI Status Banner ────────────────────────────────── */}
            {!aiDismissed && (
                <div className="bg-violet-50 border border-violet-200 rounded-2xl px-5 py-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-violet-600">psychology</span>
                        </div>
                        <div>
                            <p className="font-bold text-violet-900 text-sm flex items-center gap-2">
                                AI Pre-Screen Complete
                                <span className="text-[10px] bg-violet-600 text-white font-bold px-2 py-0.5 rounded-full">AI</span>
                            </p>
                            <p className="text-xs text-violet-700 mt-0.5">
                                Your Q3 2025 submission scored <strong>Risk: 12/100</strong> — no anomalies detected by Isolation Forest model.
                                Submission qualifies for expedited auditor review.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Link to="/industry/tracker" className="text-xs font-bold text-violet-700 bg-white border border-violet-200 px-3 py-1.5 rounded-xl hover:bg-violet-50 transition-colors">
                            View Details
                        </Link>
                        <button onClick={() => setAiDismissed(true)} className="p-1.5 text-violet-400 hover:text-violet-600 hover:bg-violet-100 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-base">close</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">
                        Welcome back, {user?.company?.name || 'Industry Partner'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Carbon compliance overview for Q1 2026 · Last updated just now</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/industry/emissions/new" className="px-4 py-2.5 bg-white text-[#1A7A4A] border border-[#1A7A4A]/40 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Log Emissions
                    </Link>
                    <Link to="/industry/marketplace" className="px-4 py-2.5 bg-[#1A7A4A] text-white rounded-xl text-sm font-bold hover:bg-[#14613B] transition-colors flex items-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                        Buy Credits
                    </Link>
                </div>
            </div>

            {/* ── Metrics Grid ────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 ${s.bg} rounded-xl`}>
                                <span className={`material-symbols-outlined ${s.color} text-xl`}>{s.icon}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <h3 className="text-2xl font-bold font-syne text-slate-800">{s.value}</h3>
                            {s.unit && <span className="text-xs text-slate-500 font-medium">{s.unit}</span>}
                        </div>
                        <div className={`mt-2 flex items-center text-xs font-medium ${s.trendUp === true ? 'text-red-600' : s.trendUp === false ? 'text-amber-600' : 'text-slate-400'
                            }`}>
                            {s.trendUp !== null && (
                                <span className="material-symbols-outlined text-[13px] mr-0.5">
                                    {s.trendUp ? 'arrow_upward' : 'arrow_downward'}
                                </span>
                            )}
                            {s.trend}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Quick Actions ───────────────────────────────────── */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {quickActions.map(a => (
                    <Link
                        key={a.label}
                        to={a.to}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border ${a.color} transition-colors text-center`}
                    >
                        <span className="material-symbols-outlined text-2xl">{a.icon}</span>
                        <span className="text-[11px] font-bold leading-tight">{a.label}</span>
                    </Link>
                ))}
            </div>

            {/* ── Charts Row ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Emission Trend Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex justify-between items-start mb-5">
                        <div>
                            <h3 className="font-bold text-lg font-syne text-slate-800">Emissions vs. Monthly Cap</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Monthly tCO₂e reported vs. 2,000 tCO₂e cap</p>
                        </div>
                        <select className="bg-slate-50 border border-slate-200 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-[#1A7A4A]">
                            <option>2026 (YTD)</option>
                            <option>2025</option>
                            <option>2024</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={emissionsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="emGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1A7A4A" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#1A7A4A" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={6} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dx={-4} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
                                formatter={(v: number) => [`${v.toLocaleString()} tCO₂e`]}
                            />
                            <ReferenceLine y={2000} stroke="#ef4444" strokeDasharray="4 2"
                                label={{ value: 'Monthly Cap', fill: '#ef4444', fontSize: 10, position: 'right' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#1A7A4A" strokeWidth={2.5}
                                fillOpacity={1} fill="url(#emGrad)" name="Emissions" dot={{ r: 3, fill: '#1A7A4A' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-[#1A7A4A] rounded-full inline-block" /> Reported Emissions</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-red-400 rounded-full inline-block" /> Monthly Cap (2,000 tCO₂e)</span>
                    </div>
                </div>

                {/* Right panel: Compliance Gauge + Activity */}
                <div className="flex flex-col gap-4">
                    {/* Compliance Gauge */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col items-center">
                        <h3 className="font-bold text-slate-800 font-syne self-start text-sm mb-2">Compliance Score</h3>
                        <div className="relative w-full h-40 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={160}>
                                <RadialBarChart
                                    cx="50%" cy="75%"
                                    innerRadius="60%" outerRadius="100%"
                                    barSize={16}
                                    data={complianceGauge}
                                    startAngle={180} endAngle={0}
                                >
                                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                    <RadialBar
                                        background={{ fill: '#f1f5f9' }}
                                        dataKey="value"
                                        angleAxisId={0}
                                        cornerRadius={8}
                                    />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute bottom-4 text-center">
                                <p className="text-3xl font-black text-[#1A7A4A] font-syne">83%</p>
                                <p className="text-xs text-slate-400">Target: 95%</p>
                            </div>
                        </div>
                        <div className="w-full flex justify-between text-xs text-slate-400 mt-1">
                            <span>0%</span>
                            <span className="font-bold text-amber-500">⚠ Below Target</span>
                            <span>100%</span>
                        </div>
                        <Link to="/industry/ai-forecast" className="mt-4 w-full text-center text-xs font-bold text-[#1A7A4A] bg-emerald-50 py-2 rounded-xl hover:bg-emerald-100 transition-colors">
                            Get AI Reduction Tips →
                        </Link>
                    </div>

                    {/* Mini blockchain status */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-emerald-600">link</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800">Last On-Chain Record</p>
                            <p className="text-[10px] text-slate-400 truncate font-mono">0x1A7A4A...8f2e · Block #9,812</p>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg flex-shrink-0">Confirmed</span>
                    </div>
                </div>
            </div>

            {/* ── Recent Activity ─────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 font-syne">Recent Activity</h3>
                    <Link to="/industry/emissions" className="text-xs font-bold text-[#1A7A4A] hover:underline flex items-center gap-1">
                        View All
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                </div>
                <ul className="divide-y divide-slate-50">
                    {recentActivity.map(a => {
                        const meta = activityIcons[a.type];
                        return (
                            <li key={a.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                                    <span className={`material-symbols-outlined text-xl ${meta.color}`}>{meta.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800">{a.label}</p>
                                    <p className="text-xs text-slate-400">{a.date} · {a.amount}</p>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${a.statusColor}`}>
                                    {a.status}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
