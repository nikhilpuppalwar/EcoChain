import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

const CERT_DAYS_REMAINING = 28; // simulated cert expiry
const SHOW_DUAL_NOTICE = true;

export default function AuditorDashboard() {
    const navigate = useNavigate();
    const [dismissCert, setDismissCert] = useState(false);
    const [dismissDual, setDismissDual] = useState(false);
    
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const { user, logout } = useAuthStore();
    const [isRejected, setIsRejected] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [name, setName] = useState('');
    const [organization, setOrganization] = useState('');
    const [designation, setDesignation] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [yearsExperience, setYearsExperience] = useState('');
    const [specialization, setSpecialization] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await api.get('/profile/me');
                if (res.data.success) {
                    const u = res.data.data;
                    if (u) {
                        setName(u.auditorProfile?.name || '');
                        setOrganization(u.auditorProfile?.organization || '');
                        setDesignation(u.auditorProfile?.designation || '');
                        setLicenseNumber(u.auditorProfile?.licenseNumber || '');
                        setYearsExperience(u.auditorProfile?.yearsExperience || '');
                        setSpecialization(u.auditorProfile?.specialization || []);
                        if (u.auditorProfile?.status === 'rejected') {
                            setIsRejected(true);
                            setRejectionReason(u.auditorProfile?.rejectionReason || 'Certification documents could not be verified.');
                            setLoading(false);
                            return;
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        checkStatus();
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            if (user?.auditorProfile?.status === 'rejected') {
                return;
            }
            try {
                const res = await api.get('/audit/dashboard-stats');
                setDashboardData(res.data.data);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load dashboard statistics');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    const handleResubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.patch('/profile/resubmit-auditor', {
                name,
                organization,
                designation,
                licenseNumber,
                yearsExperience: Number(yearsExperience),
                specialization,
            });
            if (res.data.success) {
                toast.success('Application resubmitted successfully! Your account is now pending review.');
                logout();
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to resubmit application.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSpecChange = (spec: string) => {
        if (specialization.includes(spec)) {
            setSpecialization(specialization.filter(s => s !== spec));
        } else {
            setSpecialization([...specialization, spec]);
        }
    };

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

    if (isRejected) {
        return (
            <div className="max-w-2xl mx-auto my-8 space-y-6">
                {/* Red Rejected Alert */}
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col md:flex-row items-start gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-red-600">
                        <span className="material-symbols-outlined text-3xl">cancel</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-red-900 font-syne">Application Rejected</h2>
                        <p className="text-sm text-red-700 mt-1">
                            The regulator has reviewed your auditor profile application and rejected verification.
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
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                            <input 
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A7A4A] focus:outline-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Organization / Firm</label>
                                <input 
                                    type="text"
                                    value={organization}
                                    onChange={e => setOrganization(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A7A4A] focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Designation</label>
                                <input 
                                    type="text"
                                    value={designation}
                                    onChange={e => setDesignation(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A7A4A] focus:outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">License / Certification Number</label>
                                <input 
                                    type="text"
                                    value={licenseNumber}
                                    onChange={e => setLicenseNumber(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A7A4A] focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Years of Experience</label>
                                <input 
                                    type="number"
                                    value={yearsExperience}
                                    onChange={e => setYearsExperience(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1A7A4A] focus:outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Specializations</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {[
                                    'Scope 1 (Direct)', 
                                    'Scope 2 (Indirect)', 
                                    'Scope 3 (Supply Chain)', 
                                    'Energy Sector', 
                                    'Manufacturing & Chemical', 
                                    'Forestry & Agriculture'
                                ].map(spec => (
                                    <label key={spec} className="flex items-center gap-2 px-3 py-2 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer">
                                        <input 
                                            type="checkbox"
                                            checked={specialization.includes(spec)}
                                            onChange={() => handleSpecChange(spec)}
                                            className="rounded text-[#1A7A4A] focus:ring-[#1A7A4A] h-4 w-4"
                                        />
                                        <span className="text-xs text-slate-700">{spec}</span>
                                    </label>
                                ))}
                            </div>
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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
    if (!dashboardData) return <div className="p-8 text-center text-red-500 font-bold">Failed to load dashboard</div>;

    const stats = [
        { label: 'Assigned Industries', value: dashboardData.stats.assignedIndustries, icon: 'factory', color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Audits', value: dashboardData.stats.pendingAudits, icon: 'schedule', color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Completed This Period', value: dashboardData.stats.completedThisPeriod, icon: 'check_circle', color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Approval Rate', value: dashboardData.stats.approvalRate, icon: 'thumb_up', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Dual Audits Active', value: dashboardData.stats.dualAuditsActive, icon: 'group', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

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
                <p className="text-gray-400 text-sm mt-1">Welcome back — {dashboardData.activeAssignments?.length || 0} audits awaiting your review</p>
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
                        <BarChart data={dashboardData.monthlyWork}>
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
                    <p className="text-xs text-gray-400 mb-5">Last month (%)</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={dashboardData.approvalTrend}>
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
                    {dashboardData.upcomingDeadlines?.length ? (
                        <div className="space-y-3">
                            {dashboardData.upcomingDeadlines.map((d: any, i: number) => (
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
                    ) : (
                        <p className="text-sm text-gray-500">No upcoming deadlines.</p>
                    )}
                </div>
            </div>

            {/* Active Assignments + Activity Feed */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Active assignments */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-4">My Active Assignments</h2>
                    {dashboardData.activeAssignments?.length ? (
                        <div className="space-y-2">
                            {dashboardData.activeAssignments.map((a: any, i: number) => (
                                <div onClick={() => navigate(`/auditor/verify/${a.id}`)} key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-xl -mx-2 px-2 transition-colors cursor-pointer">
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
                    ) : (
                        <p className="text-sm text-gray-500">No active assignments.</p>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-4">Recent Activity</h2>
                    {dashboardData.recentActivity?.length ? (
                        <div className="space-y-4">
                            {dashboardData.recentActivity.map((a: any, i: number) => (
                                <div key={i} className="flex items-start gap-3">
                                    <span className={`material-symbols-outlined ${a.color} text-xl flex-shrink-0 mt-0.5`}>{a.icon}</span>
                                    <div>
                                        <p className="text-sm text-gray-700">{a.event}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No recent activity.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
