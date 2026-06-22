import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const activityIcons: Record<string, { icon: string; bg: string; color: string }> = {
    submitted:         { icon: 'cloud_upload', bg: 'bg-blue-50', color: 'text-blue-600' },
    pending_issuance:  { icon: 'check_circle', bg: 'bg-green-50', color: 'text-green-600' },
    ai_flagged:        { icon: 'warning', bg: 'bg-red-50', color: 'text-red-600' },
    pending:           { icon: 'hourglass_empty', bg: 'bg-amber-50', color: 'text-amber-600' },
    approved:          { icon: 'verified', bg: 'bg-emerald-50', color: 'text-emerald-600' },
    rejected:          { icon: 'cancel', bg: 'bg-red-50', color: 'text-red-600' },
    credits_issued:    { icon: 'generating_tokens', bg: 'bg-violet-50', color: 'text-violet-600' },
    default:           { icon: 'description', bg: 'bg-gray-50', color: 'text-gray-500' },
};

const statusLabel: Record<string, { text: string; color: string }> = {
    submitted:         { text: 'Submitted', color: 'bg-blue-100 text-blue-700' },
    pending:           { text: 'Pending', color: 'bg-amber-100 text-amber-700' },
    pending_govt_assignment: { text: 'Queued', color: 'bg-orange-100 text-orange-700' },
    under_audit:       { text: 'Under Audit', color: 'bg-purple-100 text-purple-700' },
    approved:          { text: 'Approved', color: 'bg-green-100 text-green-700' },
    rejected:          { text: 'Rejected', color: 'bg-red-100 text-red-700' },
    ai_flagged:        { text: 'AI Flagged', color: 'bg-red-100 text-red-700' },
    pending_issuance:  { text: 'Credits Pending', color: 'bg-violet-100 text-violet-700' },
    credits_issued:    { text: 'Credits Issued ✓', color: 'bg-emerald-100 text-emerald-700' },
};

const quickActions = [
    { label: 'Log Emissions', icon: 'add_circle', to: '/industry/emissions/new', color: 'bg-red-50 text-red-600 hover:bg-red-100 border-red-100' },
    { label: 'Submit Report', icon: 'upload_file', to: '/industry/tracker', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100' },
    { label: 'Buy Credits', icon: 'shopping_cart', to: '/industry/marketplace', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100' },
    { label: 'AI Forecast', icon: 'monitoring', to: '/industry/ai-forecast', color: 'bg-violet-50 text-violet-600 hover:bg-violet-100 border-violet-100' },
    { label: 'My Wallet', icon: 'account_balance_wallet', to: '/industry/wallet', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-100' },
    { label: 'ESG Reports', icon: 'description', to: '/industry/reports', color: 'bg-teal-50 text-teal-600 hover:bg-teal-100 border-teal-100' },
];

export default function IndustryDashboard() {
    const { user, logout } = useAuthStore();
    const [aiDismissed, setAiDismissed] = useState(false);
    const [stats, setStats] = useState({ ytdEmissions: 0, credits: 0, pendingCount: 0, compliance: 0, creditBalance: 0 });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [emissionsChart, setEmissionsChart] = useState<any[]>([]);
    const [latestBlockchainEvent, setLatestBlockchainEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isRejected, setIsRejected] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [sector, setSector] = useState('');
    const [state, setState] = useState('');
    const [registrationNo, setRegistrationNo] = useState('');
    const [taxId, setTaxId] = useState('');
    const [annualCarbonBudget, setAnnualCarbonBudget] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await api.get('/profile/me');
                if (res.data.success) {
                    const comp = res.data.data?.company;
                    if (comp) {
                        setCompanyName(comp.name || '');
                        setSector(comp.sector || '');
                        setState(comp.state || '');
                        setRegistrationNo(comp.registrationNo || '');
                        setTaxId(comp.taxId || '');
                        setAnnualCarbonBudget(comp.annualCarbonBudget || '');
                        if (comp.verificationStatus === 'rejected') {
                            setIsRejected(true);
                            setRejectionReason(comp.rejectionReason || 'Verification documents incorrect or incomplete.');
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        checkStatus();
    }, []);

    const handleResubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.patch('/profile/resubmit-industry', {
                companyName,
                sector,
                state,
                registrationNo,
                taxId,
                annualCarbonBudget: Number(annualCarbonBudget),
            });
            if (res.data.success) {
                toast.success('Registration resubmitted successfully! Your account is now pending review.');
                logout();
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to resubmit registration.');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [emRes, walletRes, ledgerRes] = await Promise.allSettled([
                    api.get('/emissions?limit=10'),
                    api.get('/wallet/balance'),
                    api.get('/public/ledger')
                ]);

                let ytdEmissions = 0;
                let pendingCount = 0;
                let chartMap: Record<string, number> = {};
                let activity: any[] = [];

                if (emRes.status === 'fulfilled') {
                    const emissions: any[] = emRes.value.data.data || [];
                    const currentYear = new Date().getFullYear();
                    const ytdEntries = emissions.filter(e => e.periodYear >= currentYear - 1);

                    ytdEmissions = ytdEntries.reduce((sum, e) => sum + (e.quantityTonnes || 0), 0);
                    pendingCount = emissions.filter(e => ['submitted', 'pending', 'pending_govt_assignment', 'under_audit'].includes(e.status)).length;

                    // Chart: last 8 months
                    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                    emissions.slice(0, 8).reverse().forEach((e: any) => {
                        const key = monthNames[(e.periodMonth || 1) - 1];
                        chartMap[key] = (chartMap[key] || 0) + (e.quantityTonnes || 0);
                    });

                    // Recent activity from submissions
                    activity = emissions.slice(0, 5).map((e: any) => ({
                        id: e._id,
                        type: e.status || 'default',
                        label: `${e.emissionSource || 'Emission Report'} — ${e.periodMonth}/${e.periodYear}`,
                        amount: `${(e.quantityTonnes || 0).toLocaleString()} tCO₂e`,
                        date: new Date(e.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
                        status: e.status,
                    }));
                }

                let creditBalance = 0;
                if (walletRes.status === 'fulfilled') {
                    creditBalance = walletRes.value.data.data?.balance || 0;
                }

                // Build chart data
                const currentMonthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                const now = new Date();
                const chartData = Array.from({ length: 6 }, (_, i) => {
                    const monthIdx = (now.getMonth() - 5 + i + 12) % 12;
                    const name = currentMonthNames[monthIdx];
                    return { name, value: chartMap[name] || 0, target: 2000 };
                });
                setEmissionsChart(chartData);

                // Compliance score: if all emissions within target, 100%, otherwise ratio
                const inTarget = chartData.filter(d => d.value <= d.target).length;
                const complianceScore = chartData.length > 0 ? Math.round((inTarget / chartData.length) * 100) : 100;

                // Latest blockchain event for this company
                if (ledgerRes.status === 'fulfilled') {
                    const events = ledgerRes.value.data.data?.recentPublicLedger || [];
                    const companyName = user?.company?.name;
                    const myEvent = companyName ? events.find((e: any) => e.companyName === companyName) : events[0];
                    setLatestBlockchainEvent(myEvent || null);
                }

                setStats({
                    ytdEmissions: Math.round(ytdEmissions),
                    credits: creditBalance,
                    pendingCount,
                    compliance: complianceScore,
                    creditBalance
                });
                setRecentActivity(activity);
            } catch (err) {
                console.error('Dashboard fetch error', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [user]);

    const complianceGauge = [{ name: 'Compliance', value: stats.compliance, fill: stats.compliance >= 80 ? '#1A7A4A' : stats.compliance >= 60 ? '#f59e0b' : '#ef4444' }];

    const statCards = [
        { label: 'YTD Emissions', value: stats.ytdEmissions.toLocaleString(), unit: 'tCO₂e', icon: 'co2', trend: 'Reported this year', trendUp: true, bg: 'bg-red-50', color: 'text-red-600' },
        { label: 'Credit Balance', value: stats.creditBalance.toString(), unit: 'CCR', icon: 'token', trend: 'In wallet', trendUp: null, bg: 'bg-emerald-50', color: 'text-emerald-600' },
        { label: 'Pending Reports', value: stats.pendingCount.toString(), unit: '', icon: 'hourglass_empty', trend: 'Awaiting review', trendUp: null, bg: 'bg-amber-50', color: 'text-amber-600' },
        { label: 'Compliance', value: `${stats.compliance}%`, unit: '', icon: 'admin_panel_settings', trend: 'Target: 95%', trendUp: stats.compliance >= 95 ? false : true, bg: 'bg-violet-50', color: 'text-violet-600' },
    ];

    if (isRejected) {
        return (
            <div className="max-w-2xl mx-auto my-8 space-y-6">
                {/* Red Rejected Alert */}
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col md:flex-row items-start gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-red-600">
                        <span className="material-symbols-outlined text-3xl">cancel</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-red-900 font-syne">Registration Rejected</h2>
                        <p className="text-sm text-red-700 mt-1">
                            The regulator has reviewed your registration details and rejected verification.
                        </p>
                        <div className="mt-4 p-4 bg-white rounded-xl border border-red-100">
                            <p className="text-xs font-bold uppercase tracking-wider text-red-500">Reason for Rejection:</p>
                            <p className="text-sm font-semibold text-slate-800 mt-1">{rejectionReason}</p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-800 font-syne">Modify Details & Resubmit</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Please update any incorrect information and resubmit for verification.</p>
                    </div>

                    <form onSubmit={handleResubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Company Name</label>
                            <input 
                                type="text"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A7A4A] focus:outline-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sector</label>
                                <select 
                                    value={sector}
                                    onChange={e => setSector(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A7A4A] focus:outline-none"
                                    required
                                >
                                    <option value="Energy">Energy</option>
                                    <option value="Cement">Cement</option>
                                    <option value="Steel">Steel</option>
                                    <option value="Mining">Mining</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">State / Province</label>
                                <input 
                                    type="text"
                                    value={state}
                                    onChange={e => setState(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A7A4A] focus:outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Corporate Registration No (CIN)</label>
                                <input 
                                    type="text"
                                    value={registrationNo}
                                    onChange={e => setRegistrationNo(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A7A4A] focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tax ID / PAN</label>
                                <input 
                                    type="text"
                                    value={taxId}
                                    onChange={e => setTaxId(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A7A4A] focus:outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Annual Carbon Budget Target (tCO₂e)</label>
                            <input 
                                type="number"
                                value={annualCarbonBudget}
                                onChange={e => setAnnualCarbonBudget(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A7A4A] focus:outline-none"
                                required
                            />
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={logout}
                                className="px-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-bold transition-colors border border-slate-200"
                            >
                                Log Out
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 py-2.5 bg-[#1A7A4A] hover:bg-[#14613B] text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                            >
                                {submitting ? 'Resubmitting...' : 'Resubmit for Regulator Review'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* AI Status Banner */}
            {!aiDismissed && (
                <div className="bg-violet-50 border border-violet-200 rounded-2xl px-5 py-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-violet-600">psychology</span>
                        </div>
                        <div>
                            <p className="font-bold text-violet-900 text-sm flex items-center gap-2">
                                AI Pre-Screen Active <span className="text-[10px] bg-violet-600 text-white font-bold px-2 py-0.5 rounded-full">AI</span>
                            </p>
                            <p className="text-xs text-violet-700 mt-0.5">
                                Every submission is automatically screened by AI for anomalies before assigning to an auditor.
                                Check your submissions to see your risk scores.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Link to="/industry/tracker" className="text-xs font-bold text-violet-700 bg-white border border-violet-200 px-3 py-1.5 rounded-xl hover:bg-violet-50 transition-colors">View Tracker</Link>
                        <button onClick={() => setAiDismissed(true)} className="p-1.5 text-violet-400 hover:text-violet-600 hover:bg-violet-100 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-base">close</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">
                        Welcome back, {user?.company?.name || 'Industry Partner'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Carbon compliance overview · Updated live</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/industry/emissions/new" className="px-4 py-2.5 bg-white text-[#1A7A4A] border border-[#1A7A4A]/40 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">add</span> Log Emissions
                    </Link>
                    <Link to="/industry/marketplace" className="px-4 py-2.5 bg-[#1A7A4A] text-white rounded-xl text-sm font-bold hover:bg-[#14613B] transition-colors flex items-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">shopping_cart</span> Buy Credits
                    </Link>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(s => (
                    <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 ${s.bg} rounded-xl`}>
                                <span className={`material-symbols-outlined ${s.color} text-xl`}>{s.icon}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <h3 className="text-2xl font-bold font-syne text-slate-800">{loading ? '—' : s.value}</h3>
                            {s.unit && <span className="text-xs text-slate-500 font-medium">{s.unit}</span>}
                        </div>
                        <div className="mt-2 text-xs font-medium text-slate-400">{s.trend}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {quickActions.map(a => (
                    <Link key={a.label} to={a.to} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border ${a.color} transition-colors text-center`}>
                        <span className="material-symbols-outlined text-2xl">{a.icon}</span>
                        <span className="text-[11px] font-bold leading-tight">{a.label}</span>
                    </Link>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Emission Trend Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex justify-between items-start mb-5">
                        <div>
                            <h3 className="font-bold text-lg font-syne text-slate-800">Emissions vs. Monthly Cap</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Monthly tCO₂e reported vs. 2,000 tCO₂e cap</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={emissionsChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="emGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1A7A4A" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#1A7A4A" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={6} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dx={-4} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v: number) => [`${v.toLocaleString()} tCO₂e`]} />
                            <ReferenceLine y={2000} stroke="#ef4444" strokeDasharray="4 2" label={{ value: 'Cap', fill: '#ef4444', fontSize: 10, position: 'right' }} />
                            <Area type="monotone" dataKey="value" stroke="#1A7A4A" strokeWidth={2.5} fillOpacity={1} fill="url(#emGrad)" name="Emissions" dot={{ r: 3, fill: '#1A7A4A' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Right panel: Compliance Gauge + Blockchain status */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col items-center">
                        <h3 className="font-bold text-slate-800 font-syne self-start text-sm mb-2">Compliance Score</h3>
                        <div className="relative w-full h-40 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={160}>
                                <RadialBarChart cx="50%" cy="75%" innerRadius="60%" outerRadius="100%" barSize={16} data={complianceGauge} startAngle={180} endAngle={0}>
                                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                    <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" angleAxisId={0} cornerRadius={8} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute bottom-4 text-center">
                                <p className="text-3xl font-black text-[#1A7A4A] font-syne">{loading ? '—' : `${stats.compliance}%`}</p>
                                <p className="text-xs text-slate-400">Target: 95%</p>
                            </div>
                        </div>
                        <div className="w-full flex justify-between text-xs text-slate-400 mt-1">
                            <span>0%</span>
                            <span className={`font-bold ${stats.compliance >= 95 ? 'text-green-500' : 'text-amber-500'}`}>{stats.compliance >= 95 ? '✓ On Target' : '⚠ Below Target'}</span>
                            <span>100%</span>
                        </div>
                        <Link to="/industry/ai-forecast" className="mt-4 w-full text-center text-xs font-bold text-[#1A7A4A] bg-emerald-50 py-2 rounded-xl hover:bg-emerald-100 transition-colors">Get AI Tips →</Link>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-emerald-600">link</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800">Last On-Chain Record</p>
                            <p className="text-[10px] text-slate-400 truncate font-mono">
                                {latestBlockchainEvent ? `${(latestBlockchainEvent.txHash || 'pending').slice(0, 20)}...` : 'No blockchain events yet'}
                            </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0 ${latestBlockchainEvent ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                            {latestBlockchainEvent ? 'Recorded' : 'Pending'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 font-syne">Recent Submissions</h3>
                    <Link to="/industry/tracker" className="text-xs font-bold text-[#1A7A4A] hover:underline flex items-center gap-1">
                        View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                </div>
                {loading ? (
                    <div className="py-8 text-center text-gray-400 text-sm">Loading activity...</div>
                ) : recentActivity.length > 0 ? (
                    <ul className="divide-y divide-slate-50">
                        {recentActivity.map((a, idx) => {
                            const meta = activityIcons[a.type] || activityIcons.default;
                            const sl = statusLabel[a.status] || { text: a.status, color: 'bg-gray-100 text-gray-600' };
                            return (
                                <li key={idx} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                                        <span className={`material-symbols-outlined text-xl ${meta.color}`}>{meta.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{a.label}</p>
                                        <p className="text-xs text-slate-400">{a.date} · {a.amount}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${sl.color}`}>{sl.text}</span>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="py-10 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl block mb-2 text-slate-200">cloud_upload</span>
                        <p className="text-sm">No submissions yet. <Link to="/industry/emissions/new" className="text-[#1A7A4A] font-bold hover:underline">Log your first emission →</Link></p>
                    </div>
                )}
            </div>
        </div>
    );
}
