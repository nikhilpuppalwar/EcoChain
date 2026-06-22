import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend, Cell } from 'recharts';
import api from '../../lib/api';

const quickLinks = [
    { label: 'Monitor Industries', to: '/gov/monitoring', icon: 'factory', color: 'bg-violet-50 text-violet-600' },
    { label: 'Sector Analytics', to: '/gov/analytics', icon: 'analytics', color: 'bg-blue-50 text-blue-600' },
    { label: 'Blockchain Records', to: '/gov/blockchain', icon: 'link', color: 'bg-teal-50 text-teal-600' },
    { label: 'Send Alerts', to: '/gov/notifications', icon: 'campaign', color: 'bg-amber-50 text-amber-600' },
];

export default function GovDashboard() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRegistered: 0,
        pendingReports: 0,
        creditsIssued: 0,
        complianceRate: 100
    });
    const [pendingActions, setPendingActions] = useState<any[]>([]);
    const [nationalEmissionsData, setNationalEmissionsData] = useState<any[]>([]);
    const [aiForecast, setAiForecast] = useState<any[]>([]);
    const [sectorCompliance, setSectorCompliance] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/gov/dashboard/stats');
                if (response.data?.success) {
                    const data = response.data.data;
                    setStats({
                        totalRegistered: data.totalRegistered || 0,
                        pendingReports: data.pendingReports || 0,
                        creditsIssued: data.creditsIssued || 0,
                        complianceRate: data.complianceRate || 100
                    });
                    setPendingActions(data.pendingActions || []);
                    setNationalEmissionsData(data.nationalEmissionsData || []);
                    setAiForecast(data.aiForecast || []);
                    setSectorCompliance(data.sectorCompliance || []);
                }
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Loading live dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">Government Regulator Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">National Carbon Compliance Overview &amp; Approval Queue.</p>
                </div>
                <Link to="/gov/reports" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2 self-start">
                    <span className="material-symbols-outlined text-[18px]">rule</span>
                    Review Queue ({stats.pendingReports})
                </Link>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Registered Orgs', value: String(stats.totalRegistered), icon: 'corporate_fare', sub: '+3 this week', bg: 'bg-blue-50', color: 'text-blue-600' },
                    { label: 'Action Required', value: String(stats.pendingReports), icon: 'pending_actions', sub: 'Reports pending', bg: 'bg-amber-50', color: 'text-amber-600' },
                    { label: 'Credits Issued', value: `${(stats.creditsIssued / 1000).toFixed(1)}k`, icon: 'toll', sub: 'Minted on Blockchain', bg: 'bg-green-50', color: 'text-[#1A7A4A]' },
                    { label: 'Compliance Rate', value: `${stats.complianceRate}%`, icon: 'donut_large', sub: 'Target: 95%', bg: 'bg-indigo-50', color: 'text-indigo-600' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 ${s.bg} rounded-lg`}>
                                <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
                        </div>
                        <h3 className={`text-3xl font-bold font-syne ${s.color}`}>{s.value}</h3>
                        <p className="text-xs text-slate-400 mt-2">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Quick nav links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickLinks.map(l => (
                    <Link key={l.to} to={l.to} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all">
                        <div className={`w-9 h-9 rounded-xl ${l.color} flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-sm">{l.icon}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-700">{l.label}</span>
                        <span className="material-symbols-outlined text-gray-300 text-sm ml-auto">arrow_forward</span>
                    </Link>
                ))}
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="font-bold text-lg font-syne text-slate-800">National Emissions Trend</h3>
                            <p className="text-xs text-slate-500">Aggregated reported emissions vs. national targets</p>
                        </div>
                        <select className="bg-slate-50 border border-slate-200 text-sm font-medium rounded-lg px-3 py-1.5 focus:outline-none">
                            <option>2024 (YTD)</option><option>2023</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={nationalEmissionsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorEmission" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `${Number(v) / 1000}k`} />
                            <Tooltip formatter={v => [`${Number(v).toLocaleString()} tCO₂e`]} />
                            <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorEmission)" name="Emissions" />
                            <Area type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Target" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold font-syne text-slate-800">Priority Queue</h3>
                        <Link to="/gov/reports" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
                    </div>
                    <ul className="divide-y divide-slate-100 flex-1">
                        {pendingActions.map(action => (
                            <li key={action.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 cursor-pointer">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${action.type === 'registration' ? 'bg-purple-50 text-purple-600' : 'bg-red-50 text-red-600'}`}>
                                    <span className="material-symbols-outlined text-[16px]">{action.type === 'registration' ? 'domain_verification' : 'assignment_late'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800">{action.type === 'registration' ? 'New Industry Reg' : 'Emission Report'}</p>
                                    <p className="text-xs text-slate-600 truncate">{action.company}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{action.submitted}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                        <Link to="/gov/reports" className="w-full py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center">
                            Open Full Queue
                        </Link>
                    </div>
                </div>
            </div>

            {/* Charts row 2: AI Forecast + Sector Compliance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-bold text-lg font-syne text-slate-800 flex items-center gap-2 mb-1">
                        AI Emission Forecast
                        <span className="text-xs bg-violet-100 text-violet-600 font-bold px-2 py-0.5 rounded-full">AI</span>
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">ML-projected national CO₂e for rest of year (dashed = forecast)</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={aiForecast} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${Number(v) / 1000}k`} axisLine={false} tickLine={false} />
                            <Tooltip formatter={v => [`${Number(v).toLocaleString()} tCO₂e`]} />
                            <Legend />
                            <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} name="Actual" connectNulls={false} />
                            <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 3 }} name="AI Forecast" connectNulls={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-bold text-lg font-syne text-slate-800 mb-1">Sector Compliance Rate</h3>
                    <p className="text-xs text-slate-500 mb-4">Current compliance % by sector vs. targets</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={sectorCompliance} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} axisLine={false} />
                            <YAxis dataKey="sector" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={85} />
                            <Tooltip formatter={v => [`${v}%`]} />
                            <Bar dataKey="rate" radius={[0, 4, 4, 0]} name="Compliance %">
                                {sectorCompliance.map((entry, i) => (
                                    <Cell key={i} fill={entry.rate >= entry.target ? '#1A7A4A' : entry.rate >= 80 ? '#f59e0b' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#1A7A4A] inline-block" />On Target</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />Near Target</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" />Below Target</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
