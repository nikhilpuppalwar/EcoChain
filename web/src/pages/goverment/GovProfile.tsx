import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

type Tab = 'profile' | 'ministry' | 'security';

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</span>
            <span className="text-sm font-semibold text-slate-700">{value || '—'}</span>
        </div>
    );
}

function FormField({
    label, value, onChange, placeholder, disabled, type = 'text'
}: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; disabled?: boolean; type?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    disabled
                        ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
            />
        </div>
    );
}

export default function GovProfile() {
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState<any>({});
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [changingPwd, setChangingPwd] = useState(false);
    const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });

    const [form, setForm] = useState({
        officerName: '', designation: '', department: '', ministryName: '',
        jurisdiction: '', officialWebsite: '', officeAddress: '', serviceId: '',
    });

    useEffect(() => {
        const load = async () => {
            try {
                const [profileRes, statsRes] = await Promise.all([
                    api.get('/profile/me'),
                    api.get('/profile/stats'),
                ]);
                const gp = profileRes.data.data.governmentProfile || {};
                setForm({
                    officerName: gp.officerName || '',
                    designation: gp.designation || '',
                    department: gp.department || '',
                    ministryName: gp.ministryName || '',
                    jurisdiction: gp.jurisdiction || '',
                    officialWebsite: gp.officialWebsite || '',
                    officeAddress: gp.officeAddress || '',
                    serviceId: gp.serviceId || '',
                });
                setStats(statsRes.data.data || {});
            } catch {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.patch('/profile/government', form);
            setUser({ ...user, governmentProfile: res.data.data.governmentProfile });
            toast.success('Profile updated successfully');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwdForm.next !== pwdForm.confirm) { toast.error('Passwords do not match'); return; }
        if (pwdForm.next.length < 8) { toast.error('Password must be at least 8 characters'); return; }
        setChangingPwd(true);
        try {
            await api.patch('/profile/change-password', { currentPassword: pwdForm.current, newPassword: pwdForm.next });
            toast.success('Password changed successfully');
            setPwdForm({ current: '', next: '', confirm: '' });
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Password change failed');
        } finally {
            setChangingPwd(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
    );

    const initials = (form.officerName || user?.email || 'G').substring(0, 2).toUpperCase();
    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: 'profile', label: 'Officer Info', icon: 'person' },
        { key: 'ministry', label: 'Ministry', icon: 'account_balance' },
        { key: 'security', label: 'Security', icon: 'shield' },
    ];

    return (
        <div className="max-w-5xl space-y-6">
            {/* Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 text-white shadow-xl">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-8 w-48 h-48 rounded-full bg-blue-400 blur-3xl" />
                    <div className="absolute bottom-0 left-16 w-32 h-32 rounded-full bg-indigo-400 blur-2xl" />
                </div>
                <div className="relative p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-3xl font-bold shadow-lg flex-shrink-0">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                user?.governmentProfile?.status === 'approved'
                                    ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                                    : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            }`}>
                                {user?.governmentProfile?.status === 'approved' ? '✓ Verified Officer' : 'Pending Verification'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white/70 border border-white/20">
                                Government Portal
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold font-syne truncate">{form.officerName || user?.email}</h1>
                        <p className="text-blue-200 text-sm mt-0.5">{form.designation || 'Government Officer'} {form.department ? `· ${form.department}` : ''}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{user?.email}</p>
                    </div>
                    {/* Quick Stats */}
                    <div className="flex gap-6 flex-shrink-0">
                        {[
                            { label: 'Pending Reviews', val: stats.pendingReviews ?? '—', icon: 'pending_actions' },
                            { label: 'Credits Issued', val: stats.creditsIssued ?? '—', icon: 'token' },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <span className="material-symbols-outlined text-blue-300 text-xl block mb-1">{s.icon}</span>
                                <p className="text-2xl font-bold font-syne">{s.val}</p>
                                <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Ministry strip */}
                {form.ministryName && (
                    <div className="relative border-t border-white/10 px-8 py-3 flex items-center gap-2 text-sm text-slate-300">
                        <span className="material-symbols-outlined text-[16px] text-blue-300">account_balance</span>
                        <span>{form.ministryName}</span>
                        {form.jurisdiction && <><span className="text-slate-600">·</span><span>{form.jurisdiction}</span></>}
                        {form.serviceId && <><span className="text-slate-600">·</span><span className="font-mono text-xs">{form.serviceId}</span></>}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors text-left border-b border-slate-100 last:border-0 ${
                                    activeTab === tab.key
                                        ? 'bg-blue-600 text-white font-bold'
                                        : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    {/* Read-only info card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                        <InfoRow label="Service ID" value={form.serviceId} />
                        <InfoRow label="Jurisdiction" value={form.jurisdiction} />
                        <InfoRow label="Account Status" value={user?.governmentProfile?.status === 'approved' ? 'Verified' : 'Pending'} />
                        {form.officialWebsite && (
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">Official Website</span>
                                <a href={form.officialWebsite} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                                    {form.officialWebsite}
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Panel */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/60">
                            <h2 className="font-bold text-slate-800 font-syne text-base flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600 text-[20px]">{tabs.find(t => t.key === activeTab)?.icon}</span>
                                {tabs.find(t => t.key === activeTab)?.label}
                            </h2>
                        </div>
                        <div className="p-6">
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <form onSubmit={handleSave} className="space-y-5">
                                    <FormField label="Email Address" value={user?.email || ''} onChange={() => {}} disabled />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="Officer Full Name" value={form.officerName} onChange={v => setForm(f => ({ ...f, officerName: v }))} placeholder="e.g. Rajesh Kumar IAS" />
                                        <FormField label="Designation" value={form.designation} onChange={v => setForm(f => ({ ...f, designation: v }))} placeholder="Joint Secretary, Director..." />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="Service ID / Employee Code" value={form.serviceId} onChange={v => setForm(f => ({ ...f, serviceId: v }))} placeholder="IAS/2019/0234" />
                                        <FormField label="Jurisdiction / Region" value={form.jurisdiction} onChange={v => setForm(f => ({ ...f, jurisdiction: v }))} placeholder="National / State Name" />
                                    </div>
                                    <div className="pt-2">
                                        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 shadow-sm">
                                            {saving ? 'Saving...' : 'Save Officer Info'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Ministry Tab */}
                            {activeTab === 'ministry' && (
                                <form onSubmit={handleSave} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="Ministry Name" value={form.ministryName} onChange={v => setForm(f => ({ ...f, ministryName: v }))} placeholder="Ministry of Environment" />
                                        <FormField label="Department" value={form.department} onChange={v => setForm(f => ({ ...f, department: v }))} placeholder="Climate Action Division" />
                                    </div>
                                    <FormField label="Office Address" value={form.officeAddress} onChange={v => setForm(f => ({ ...f, officeAddress: v }))} placeholder="Indira Paryavaran Bhavan, New Delhi 110003" />
                                    <FormField label="Official Website" value={form.officialWebsite} onChange={v => setForm(f => ({ ...f, officialWebsite: v }))} placeholder="https://moef.gov.in" />
                                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 flex items-start gap-2">
                                        <span className="material-symbols-outlined text-[16px] mt-0.5 text-blue-500">info</span>
                                        <p>Your wallet connected via MetaMask is used to sign carbon credit tokenizations on-chain via <code className="bg-blue-100 px-1 rounded font-mono">CarbonCredit.sol</code> on Polygon.</p>
                                    </div>
                                    <div className="pt-2">
                                        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 shadow-sm">
                                            {saving ? 'Saving...' : 'Update Ministry Details'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <form onSubmit={handleChangePassword} className="space-y-5">
                                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                                        <span className="material-symbols-outlined text-[16px] mt-0.5 text-amber-500">lock</span>
                                        <p>Use a strong password with at least 8 characters, including numbers and symbols. Government accounts are subject to periodic password policy reviews.</p>
                                    </div>
                                    <FormField label="Current Password" type="password" value={pwdForm.current} onChange={v => setPwdForm(p => ({ ...p, current: v }))} placeholder="••••••••" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="New Password" type="password" value={pwdForm.next} onChange={v => setPwdForm(p => ({ ...p, next: v }))} placeholder="Min. 8 characters" />
                                        <FormField label="Confirm New Password" type="password" value={pwdForm.confirm} onChange={v => setPwdForm(p => ({ ...p, confirm: v }))} placeholder="Repeat new password" />
                                    </div>
                                    <div className="pt-2">
                                        <button type="submit" disabled={changingPwd} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 shadow-sm">
                                            {changingPwd ? 'Changing...' : 'Change Password'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
