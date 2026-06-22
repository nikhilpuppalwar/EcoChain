import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
    ProfileAvatar, ProfileCard, FormField,
    WalletSection, ChangePasswordSection, StatBadge
} from '../../components/ProfileShared';

const SPECIALIZATIONS = [
    'Scope 1 Emissions', 'Scope 2 Emissions', 'Scope 3 Emissions',
    'GHG Protocol', 'ISO 14064', 'Renewable Energy', 'Carbon Markets',
    'Industrial Processes', 'Agriculture', 'Transport',
];

export default function AuditorProfile() {
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState<any>({});
    const [walletAddress, setWalletAddress] = useState('');
    const [activeTab, setActiveTab] = useState<'profile' | 'credentials' | 'blockchain' | 'security'>('profile');

    const [form, setForm] = useState({
        name: '', organization: '', designation: '', licenseNumber: '',
        yearsExperience: '', specialization: [] as string[],
    });

    useEffect(() => {
        const load = async () => {
            try {
                const [profileRes, statsRes] = await Promise.all([
                    api.get('/profile/me'),
                    api.get('/profile/stats'),
                ]);
                const data = profileRes.data.data;
                const ap = data.auditorProfile || {};
                setForm({
                    name:            ap.name            || '',
                    organization:    ap.organization    || '',
                    designation:     ap.designation     || '',
                    licenseNumber:   ap.licenseNumber   || '',
                    yearsExperience: ap.yearsExperience?.toString() || '',
                    specialization:  ap.specialization  || [],
                });
                setWalletAddress(data.walletAddress || '');
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
            const res = await api.patch('/profile/auditor', {
                ...form,
                yearsExperience: Number(form.yearsExperience),
            });
            setUser({ ...user, auditorProfile: res.data.data.auditorProfile });
            toast.success('Profile saved successfully');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const toggleSpec = (spec: string) => {
        setForm(f => ({
            ...f,
            specialization: f.specialization.includes(spec)
                ? f.specialization.filter(s => s !== spec)
                : [...f.specialization, spec],
        }));
    };

    const tabs = [
        { key: 'profile', label: 'Profile', icon: 'person' },
        { key: 'credentials', label: 'Credentials', icon: 'fact_check' },
        { key: 'blockchain', label: 'Blockchain', icon: 'link' },
        { key: 'security', label: 'Security', icon: 'shield' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <span className="material-symbols-outlined">manage_accounts</span>
                    <h1 className="text-2xl font-bold font-['Syne',sans-serif] text-slate-800">Auditor Profile</h1>
                </div>
                <p className="text-sm text-slate-500">Manage your auditor credentials, specializations, license information and wallet.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBadge label="Audits Completed" value={stats.auditsCompleted ?? '—'} icon="task_alt" color="bg-blue-50 border-blue-200 text-blue-700" />
                <StatBadge label="Active Assignments" value={stats.activeAssignments ?? '—'} icon="assignment" color="bg-amber-50 border-amber-200 text-amber-700" />
                <StatBadge label="Experience" value={form.yearsExperience ? `${form.yearsExperience} yrs` : '—'} icon="history" color="bg-violet-50 border-violet-200 text-violet-700" />
                <StatBadge label="License Status" value={user?.auditorProfile?.status || '—'} icon="verified" color="bg-green-50 border-green-200 text-green-700" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center">
                        <ProfileAvatar
                            name={form.name}
                            email={user?.email || ''}
                            role="auditor"
                        />
                        <div className="mt-4 w-full space-y-3">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">License Number</p>
                                <p className="text-sm font-mono text-slate-700">{form.licenseNumber || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Organization</p>
                                <p className="text-sm text-slate-700">{form.organization || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Specializations</p>
                                <div className="flex flex-wrap gap-1">
                                    {form.specialization.length > 0 ? form.specialization.map(s => (
                                        <span key={s} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">{s}</span>
                                    )) : <span className="text-sm text-slate-400">None set</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
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
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {activeTab === 'profile' && (
                        <ProfileCard title="Personal Information" icon="person">
                            <form onSubmit={handleSave} className="space-y-4">
                                <FormField label="Email Address" value={user?.email || ''} onChange={() => {}} disabled />
                                <FormField label="Full Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Your full name" />
                                <FormField label="Designation" value={form.designation} onChange={v => setForm(f => ({ ...f, designation: v }))} placeholder="Senior Auditor, Chief Verifier, etc." />
                                <FormField label="Organization" value={form.organization} onChange={v => setForm(f => ({ ...f, organization: v }))} placeholder="Bureau Veritas, TÜV SÜD, etc." />
                                <FormField label="Years of Experience" type="number" value={form.yearsExperience} onChange={v => setForm(f => ({ ...f, yearsExperience: v }))} placeholder="5" />
                                <button type="submit" disabled={saving} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-60">
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </ProfileCard>
                    )}

                    {activeTab === 'credentials' && (
                        <ProfileCard title="License & Specializations" icon="fact_check">
                            <form onSubmit={handleSave} className="space-y-5">
                                <FormField
                                    label="License Number"
                                    value={form.licenseNumber}
                                    onChange={v => setForm(f => ({ ...f, licenseNumber: v }))}
                                    placeholder="GHG-AUD-2021-0042"
                                />

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Specializations (select all that apply)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {SPECIALIZATIONS.map(spec => (
                                            <button
                                                key={spec}
                                                type="button"
                                                onClick={() => toggleSpec(spec)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                                                    form.specialization.includes(spec)
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'
                                                }`}
                                            >
                                                {spec}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">PKI Signature Status</p>
                                    <p className="text-sm text-slate-600">Your digital signature is used to sign audit reports on-chain via <code className="bg-slate-200 px-1 rounded text-xs">AuditRegistry.sol</code>.</p>
                                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Active
                                    </span>
                                </div>

                                <button type="submit" disabled={saving} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-60">
                                    {saving ? 'Saving...' : 'Update Credentials'}
                                </button>
                            </form>
                        </ProfileCard>
                    )}

                    {activeTab === 'blockchain' && (
                        <ProfileCard title="Blockchain & Wallet" icon="link">
                            <div className="space-y-4">
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Auditor On-Chain Role</p>
                                    <p className="text-sm text-slate-600">Your wallet is used to sign final audit reports submitted to <code className="bg-slate-200 px-1 rounded text-xs">AuditRegistry.sol</code>. Each signature creates an immutable audit trail on Polygon.</p>
                                </div>
                                <WalletSection walletAddress={walletAddress} onLinked={setWalletAddress} />
                            </div>
                        </ProfileCard>
                    )}

                    {activeTab === 'security' && (
                        <ProfileCard title="Security Settings" icon="shield">
                            <ChangePasswordSection />
                        </ProfileCard>
                    )}
                </div>
            </div>
        </div>
    );
}
