import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
    ProfileAvatar, ProfileCard, FormField,
    WalletSection, ChangePasswordSection, StatBadge
} from '../../components/ProfileShared';

const SECTORS = ['Energy', 'Cement', 'Steel', 'Mining', 'Transport', 'Other'];

export default function IndustryProfile() {
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState<any>({});
    const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'blockchain' | 'security'>('profile');

    const [form, setForm] = useState({
        companyName: '', sector: '', state: '', registrationNo: '',
        taxId: '', annualCarbonBudget: '', walletAddress: ''
    });

    useEffect(() => {
        const load = async () => {
            try {
                const [profileRes, statsRes] = await Promise.all([
                    api.get('/profile/me'),
                    api.get('/profile/stats'),
                ]);
                const data = profileRes.data.data;
                const company = data.company || {};
                setForm({
                    companyName: company.name || '',
                    sector: company.sector || '',
                    state: company.state || '',
                    registrationNo: company.registrationNo || '',
                    taxId: company.taxId || '',
                    annualCarbonBudget: company.annualCarbonBudget?.toString() || '',
                    walletAddress: company.walletAddress || '',
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
            const res = await api.patch('/profile/industry', form);
            setUser({ ...user, company: res.data.data.company });
            toast.success('Profile saved successfully');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { key: 'profile', label: 'Profile', icon: 'person' },
        { key: 'company', label: 'Company', icon: 'factory' },
        { key: 'blockchain', label: 'Blockchain', icon: 'link' },
        { key: 'security', label: 'Security', icon: 'shield' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin w-8 h-8 border-4 border-[#1A7A4A] border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <span className="material-symbols-outlined">manage_accounts</span>
                    <h1 className="text-2xl font-bold font-['Syne',sans-serif] text-slate-800">My Profile</h1>
                </div>
                <p className="text-sm text-slate-500">Manage your industry account, company details, and blockchain wallet.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBadge label="Submissions" value={stats.totalSubmissions ?? '—'} icon="cloud_upload" color="bg-emerald-50 border-emerald-200 text-emerald-700" />
                <StatBadge label="AI Forecasts" value={stats.totalForecasts ?? '—'} icon="monitoring" color="bg-blue-50 border-blue-200 text-blue-700" />
                <StatBadge label="Credit Balance" value={user?.company?.creditBalance ?? 0} icon="token" color="bg-violet-50 border-violet-200 text-violet-700" />
                <StatBadge label="Compliance" value={user?.company?.complianceStatus || '—'} icon="admin_panel_settings" color="bg-amber-50 border-amber-200 text-amber-700" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left — Avatar + tabs */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center">
                        <ProfileAvatar
                            name={form.companyName}
                            email={user?.email || ''}
                            role="industry"
                        />
                        <div className="mt-4 w-full">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Registration No.</p>
                            <p className="text-sm font-mono text-slate-700">{form.registrationNo || '—'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-3">Sector</p>
                            <p className="text-sm text-slate-700">{form.sector || '—'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-3">State</p>
                            <p className="text-sm text-slate-700">{form.state || '—'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-3">Member Since</p>
                            <p className="text-sm text-slate-700">{user ? new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}</p>
                        </div>
                    </div>

                    {/* Tab navigation */}
                    <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors text-left border-b border-slate-100 last:border-0 ${
                                    activeTab === tab.key
                                        ? 'bg-[#1A7A4A] text-white font-bold'
                                        : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right — Tab content */}
                <div className="lg:col-span-2 space-y-4">
                    {activeTab === 'profile' && (
                        <ProfileCard title="Account Information" icon="person">
                            <form onSubmit={handleSave} className="space-y-4">
                                <FormField label="Email Address" value={user?.email || ''} onChange={() => {}} disabled hint="Email cannot be changed. Contact support." />
                                <FormField label="Company Name" value={form.companyName} onChange={v => setForm(f => ({ ...f, companyName: v }))} placeholder="Your company name" />
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sector</label>
                                    <select
                                        value={form.sector}
                                        onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/30"
                                    >
                                        <option value="">Select sector</option>
                                        {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <FormField label="State" value={form.state} onChange={v => setForm(f => ({ ...f, state: v }))} placeholder="Maharashtra" />
                                <button type="submit" disabled={saving} className="w-full py-2.5 bg-[#1A7A4A] text-white rounded-xl text-sm font-bold hover:bg-[#14613B] transition-colors disabled:opacity-60">
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </ProfileCard>
                    )}

                    {activeTab === 'company' && (
                        <ProfileCard title="Company Details" icon="factory">
                            <form onSubmit={handleSave} className="space-y-4">
                                <FormField label="CIN / Registration No." value={form.registrationNo} onChange={v => setForm(f => ({ ...f, registrationNo: v }))} placeholder="L12345MH2020PTC123456" />
                                <FormField label="PAN / Tax ID" value={form.taxId} onChange={v => setForm(f => ({ ...f, taxId: v }))} placeholder="AABCC1234D" />
                                <FormField label="Annual Carbon Budget (tCO₂e)" type="number" value={form.annualCarbonBudget} onChange={v => setForm(f => ({ ...f, annualCarbonBudget: v }))} placeholder="10000" />

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Compliance Status</p>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                        user?.company?.complianceStatus === 'compliant' ? 'bg-green-100 text-green-700' :
                                        user?.company?.complianceStatus === 'non-compliant' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                        {user?.company?.complianceStatus || 'pending'}
                                    </span>
                                </div>
                                <button type="submit" disabled={saving} className="w-full py-2.5 bg-[#1A7A4A] text-white rounded-xl text-sm font-bold hover:bg-[#14613B] transition-colors disabled:opacity-60">
                                    {saving ? 'Saving...' : 'Update Company Info'}
                                </button>
                            </form>
                        </ProfileCard>
                    )}

                    {activeTab === 'blockchain' && (
                        <ProfileCard title="Blockchain & Web3 Wallet" icon="link">
                            <div className="space-y-6">
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">On-Chain Identity</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Network</span>
                                            <span className="font-bold text-slate-800">Polygon (Local Anvil)</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Credit Token</span>
                                            <span className="font-bold text-slate-800 font-mono text-xs">{process.env.CARBON_CREDIT_ADDRESS || '0xe7f1...0512'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Carbon Credits</span>
                                            <span className="font-bold text-emerald-700">{user?.company?.creditBalance || 0} CCR</span>
                                        </div>
                                    </div>
                                </div>

                                <WalletSection
                                    walletAddress={form.walletAddress}
                                    onLinked={(addr) => setForm(f => ({ ...f, walletAddress: addr }))}
                                />
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
