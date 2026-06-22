import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function IndustryCompliance() {
    const { user } = useAuthStore();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchCompliance = async () => {
        setLoading(true);
        try {
            const res = await api.get('/emissions/my-compliance');
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load your compliance data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompliance();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <span className="mt-3 text-slate-500 font-medium text-sm">Loading your compliance data...</span>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <span className="material-symbols-outlined text-5xl text-slate-300">error_outline</span>
                <p className="text-slate-500">Unable to load compliance data.</p>
                <button onClick={fetchCompliance} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    const { company, compliance, monthlyData, statusCounts } = data;
    const statusColor = compliance.status === 'Compliant'
        ? { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500', accent: '#1A7A4A' }
        : compliance.status === 'At Risk'
        ? { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-400', accent: '#d97706' }
        : { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: 'bg-red-500', accent: '#dc2626' };

    const statusIcon = compliance.status === 'Compliant' ? 'verified' : compliance.status === 'At Risk' ? 'warning' : 'dangerous';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">My Compliance Status</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Track your organization's carbon emission performance against your allocated budget.
                    </p>
                </div>
                <button
                    onClick={fetchCompliance}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    Refresh
                </button>
            </div>

            {/* Hero Compliance Card */}
            <div className={`rounded-2xl border-2 ${statusColor.border} ${statusColor.bg} p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${compliance.status === 'Compliant' ? 'bg-emerald-100' : compliance.status === 'At Risk' ? 'bg-amber-100' : 'bg-red-100'}`}>
                        <span className={`material-symbols-outlined text-4xl ${statusColor.text}`}>{statusIcon}</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Current Compliance Status</p>
                        <h2 className={`text-3xl font-bold font-syne ${statusColor.text}`}>{compliance.status}</h2>
                        <p className="text-sm text-slate-600 mt-0.5">{company.name} · {company.sector}</p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-bold font-syne ${compliance.percentOfCap > 100 ? 'text-red-600' : 'text-slate-800'}`}>
                            {compliance.percentOfCap}%
                        </span>
                        <span className="text-slate-500 text-sm">of annual cap used</span>
                    </div>
                    <div className="w-full md:w-64 h-3 bg-white/60 rounded-full overflow-hidden border border-white">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${statusColor.bar}`}
                            style={{ width: `${Math.min(compliance.percentOfCap, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-500">
                        {compliance.netEmissions.toLocaleString()} tCO₂e used of {company.cap.toLocaleString()} tCO₂e cap
                    </p>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Annual Carbon Cap', value: `${company.cap.toLocaleString()} tCO₂e`, icon: 'flag', color: 'text-slate-700' },
                    { label: 'Net Emissions (Approved)', value: `${compliance.netEmissions.toLocaleString()} tCO₂e`, icon: 'factory', color: compliance.percentOfCap > 100 ? 'text-red-600' : 'text-slate-700' },
                    { label: 'Carbon Credits Offset', value: `${company.creditBalance.toLocaleString()} CCR`, icon: 'eco', color: 'text-emerald-600' },
                    { label: 'Remaining Budget', value: `${compliance.remainingBudget.toLocaleString()} tCO₂e`, icon: 'savings', color: compliance.remainingBudget <= 0 ? 'text-red-600' : 'text-blue-600' },
                ].map((m) => (
                    <div key={m.label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`material-symbols-outlined text-[20px] ${m.color}`}>{m.icon}</span>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{m.label}</p>
                        </div>
                        <p className={`text-xl font-bold font-syne ${m.color}`}>{m.value}</p>
                    </div>
                ))}
            </div>

            {/* Penalty Banner (show only if penalty > 0) */}
            {company.penalty > 0 && (
                <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-5 flex items-start gap-4">
                    <span className="material-symbols-outlined text-red-500 text-3xl shrink-0">gavel</span>
                    <div>
                        <h3 className="font-bold text-red-900 font-syne text-lg">Compliance Penalty Assessed</h3>
                        <p className="text-sm text-red-700 mt-0.5">
                            Your organization has been assessed a total penalty of{' '}
                            <strong className="font-bold">₹{company.penalty.toLocaleString()}</strong> by the regulatory authority for exceeding your allocated carbon budget.
                        </p>
                        <p className="text-xs text-red-600 mt-2 font-medium">
                            To clear this penalty, reduce your net emissions below the cap by purchasing carbon credits from the marketplace or reducing direct emissions.
                        </p>
                        <Link
                            to="/industry/marketplace"
                            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                            Buy Carbon Credits
                        </Link>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Emission Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 font-syne text-lg">Monthly Emissions vs Cap</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Approved emission reports broken down by month</p>
                    </div>
                    <div className="p-6 h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} width={40} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: 'DM Sans' }}
                                    formatter={(val: any, name: string) => [`${Number(val).toLocaleString()} tCO₂e`, name === 'emissions' ? 'Emissions' : 'Monthly Cap']}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '16px' }} formatter={(v) => v === 'emissions' ? 'Monthly Emissions' : 'Monthly Cap'} />
                                <ReferenceLine y={company.cap / 12} stroke="#f87171" strokeDasharray="4 2" strokeWidth={1.5} />
                                <Bar dataKey="cap" name="cap" fill="#E2E8F0" barSize={16} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="emissions" name="emissions" fill={statusColor.accent} barSize={16} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Report Status Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 font-syne text-lg">Report Status</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Overview of all submitted emission reports</p>
                    </div>
                    <div className="p-6 flex-1 space-y-4">
                        {[
                            { label: 'Approved', count: statusCounts.approved, icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Under Review', count: statusCounts.under_review, icon: 'pending', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Awaiting Submission', count: statusCounts.submitted, icon: 'schedule', color: 'text-amber-600', bg: 'bg-amber-50' },
                            { label: 'Correction Requested', count: statusCounts.correction_requested, icon: 'edit_note', color: 'text-orange-600', bg: 'bg-orange-50' },
                            { label: 'Rejected', count: statusCounts.rejected, icon: 'cancel', color: 'text-red-600', bg: 'bg-red-50' },
                        ].map((s) => (
                            <div key={s.label} className={`flex items-center justify-between p-3 rounded-xl ${s.bg}`}>
                                <div className="flex items-center gap-2.5">
                                    <span className={`material-symbols-outlined text-[20px] ${s.color}`}>{s.icon}</span>
                                    <span className="text-sm font-semibold text-slate-700">{s.label}</span>
                                </div>
                                <span className={`text-lg font-bold font-syne ${s.color}`}>{s.count}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-slate-100">
                        <Link
                            to="/industry/tracker"
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
                            View Submission Tracker
                        </Link>
                    </div>
                </div>
            </div>

            {/* Action Tips */}
            {compliance.status !== 'Compliant' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 font-syne text-base mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">tips_and_updates</span>
                        Recommended Actions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { icon: 'shopping_cart', title: 'Buy Carbon Credits', desc: 'Purchase verified carbon credits on the marketplace to offset excess emissions.', href: '/industry/marketplace', color: 'emerald' },
                            { icon: 'monitoring', title: 'Review AI Forecast', desc: 'Use AI-powered forecast to identify upcoming high-emission periods.', href: '/industry/ai-forecast', color: 'blue' },
                            { icon: 'description', title: 'Submit More Data', desc: 'Make sure all approved emission reports are up to date and accurate.', href: '/industry/emissions/new', color: 'violet' },
                        ].map((tip) => (
                            <Link
                                key={tip.title}
                                to={tip.href}
                                className={`flex flex-col gap-2 p-4 rounded-xl border border-${tip.color}-100 bg-${tip.color}-50 hover:bg-${tip.color}-100 transition-colors group`}
                            >
                                <span className={`material-symbols-outlined text-${tip.color}-600 text-2xl`}>{tip.icon}</span>
                                <p className={`font-bold text-${tip.color}-900 text-sm`}>{tip.title}</p>
                                <p className={`text-xs text-${tip.color}-700`}>{tip.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
