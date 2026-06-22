import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
    ProfileAvatar, ProfileCard, FormField,
    WalletSection, ChangePasswordSection, StatBadge
} from '../../components/ProfileShared';

export default function AdminProfile() {
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState<any>({});
    const [walletAddress, setWalletAddress] = useState('');
    const [activeTab, setActiveTab] = useState<'profile' | 'platform' | 'blockchain' | 'security'>('profile');
    const [name, setName] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const [profileRes, statsRes] = await Promise.all([
                    api.get('/profile/me'),
                    api.get('/profile/stats'),
                ]);
                const data = profileRes.data.data;
                setName(data.adminProfile?.name || '');
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
            const res = await api.patch('/profile/admin', { name });
            setUser({ ...user, adminProfile: res.data.data.adminProfile });
            toast.success('Profile saved');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { key: 'profile', label: 'Profile', icon: 'person' },
        { key: 'platform', label: 'Platform Info', icon: 'settings' },
        { key: 'blockchain', label: 'Blockchain', icon: 'link' },
        { key: 'security', label: 'Security', icon: 'shield' },
    ];

    const platformConfig = [
        { label: 'Backend URL', value: 'http://localhost:5001' },
        { label: 'AI Service URL', value: 'http://localhost:8000' },
        { label: 'Blockchain Network', value: 'Polygon / Anvil (Local)' },
        { label: 'MongoDB', value: 'mongodb://localhost:27017/ecochain' },
        { label: 'Platform Version', value: 'EcoChain v1.0.0' },
        { label: 'Hackathon Mode', value: 'Enabled' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin w-8 h-8 border-4 border-slate-700 border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <div className="flex items-center gap-2 text-slate-700 mb-1">
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                    <h1 className="text-2xl font-bold font-['Syne',sans-serif] text-slate-800">Admin Profile</h1>
                </div>
                <p className="text-sm text-slate-500">Manage your administrator account, platform configuration, and blockchain wallet.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBadge label="Total Users" value={stats.totalUsers ?? '—'} icon="people" color="bg-slate-100 border-slate-300 text-slate-700" />
                <StatBadge label="Super Admin" value={user?.adminProfile?.superAdmin ? 'Yes' : 'No'} icon="verified_user" color="bg-amber-50 border-amber-200 text-amber-700" />
                <StatBadge label="Platform" value={stats.platform || 'EcoChain'} icon="hub" color="bg-blue-50 border-blue-200 text-blue-700" />
                <StatBadge label="Status" value="Active" icon="check_circle" color="bg-green-50 border-green-200 text-green-700" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center">
                        <ProfileAvatar
                            name={name}
                            email={user?.email || ''}
                            role="admin"
                        />
                        <div className="mt-4 w-full space-y-3">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Admin Type</p>
                                <p className="text-sm text-slate-700">{user?.adminProfile?.superAdmin ? 'Super Administrator' : 'Administrator'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Access Level</p>
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                                    Full Platform Access
                                </span>
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
                                        ? 'bg-slate-800 text-white font-bold'
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
                        <ProfileCard title="Admin Account" icon="person">
                            <form onSubmit={handleSave} className="space-y-4">
                                <FormField label="Email Address" value={user?.email || ''} onChange={() => {}} disabled />
                                <FormField label="Display Name" value={name} onChange={setName} placeholder="Admin display name" />
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Role</p>
                                    <p className="text-sm font-bold text-slate-800">{user?.adminProfile?.superAdmin ? '🔴 Super Administrator — Full Control' : '🟡 Administrator — Standard Access'}</p>
                                </div>
                                <button type="submit" disabled={saving} className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-colors disabled:opacity-60">
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </ProfileCard>
                    )}

                    {activeTab === 'platform' && (
                        <ProfileCard title="Platform Configuration" icon="settings">
                            <div className="space-y-3">
                                {platformConfig.map(item => (
                                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                                        <span className="text-sm font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <p className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">warning</span>
                                    Admin Notice
                                </p>
                                <p className="text-xs text-amber-700">Platform config changes require backend environment updates. Contact DevOps for production deployments.</p>
                            </div>
                        </ProfileCard>
                    )}

                    {activeTab === 'blockchain' && (
                        <ProfileCard title="Blockchain & Wallet" icon="link">
                            <div className="space-y-4">
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Admin Blockchain Access</p>
                                    <p className="text-sm text-slate-600">Admin wallets can be used to monitor all on-chain transactions and interact with deployed contracts for maintenance and oversight.</p>
                                </div>
                                <WalletSection walletAddress={walletAddress} onLinked={setWalletAddress} />
                            </div>
                        </ProfileCard>
                    )}

                    {activeTab === 'security' && (
                        <ProfileCard title="Security Settings" icon="shield">
                            <ChangePasswordSection />
                            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">security</span>
                                    Security Recommendation
                                </p>
                                <p className="text-xs text-red-700">As an administrator, use a strong unique password and consider enabling 2FA for additional security.</p>
                            </div>
                        </ProfileCard>
                    )}
                </div>
            </div>
        </div>
    );
}
