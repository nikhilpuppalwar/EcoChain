import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import api from '../lib/api';
import toast from 'react-hot-toast';

/* ─── Shared sub-components ─────────────────────────── */

export function ProfileAvatar({ name, email, role }: { name: string; email: string; role: string }) {
    const initials = name
        ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : email?.[0]?.toUpperCase() || 'U';

    const roleColors: Record<string, string> = {
        industry:   'from-emerald-500 to-teal-600',
        government: 'from-violet-500 to-purple-700',
        auditor:    'from-blue-500 to-cyan-600',
        admin:      'from-slate-600 to-slate-800',
    };

    const roleLabels: Record<string, string> = {
        industry: 'Industry Portal', government: 'Government Portal',
        auditor: 'Auditor Portal', admin: 'Admin Portal',
    };

    return (
        <div className="flex flex-col items-center">
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${roleColors[role] || 'from-slate-400 to-slate-600'} flex items-center justify-center shadow-lg mb-3`}>
                <span className="text-3xl font-black text-white font-['Syne',sans-serif]">{initials}</span>
            </div>
            <p className="font-bold text-slate-900 text-lg font-['Syne',sans-serif]">{name || email}</p>
            <p className="text-slate-500 text-sm">{email}</p>
            <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                role === 'industry'   ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                role === 'government' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                role === 'auditor'    ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                       'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
                {roleLabels[role] || role}
            </span>
        </div>
    );
}

export function ProfileCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1A7A4A] text-xl">{icon}</span>
                <h3 className="font-bold text-slate-800 font-['Syne',sans-serif]">{title}</h3>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

export function FormField({
    label, value, onChange, placeholder = '', type = 'text', disabled = false, hint
}: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; type?: string; disabled?: boolean; hint?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/30 focus:border-[#1A7A4A] transition-all disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
            />
            {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        </div>
    );
}

/* ─── Blockchain Wallet Linker (shared across all portals) ──── */
export function WalletSection({ walletAddress, onLinked }: { walletAddress?: string; onLinked: (addr: string) => void }) {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const [linking, setLinking] = useState(false);

    const handleLink = async () => {
        if (!address) return toast.error('Connect your wallet first');
        setLinking(true);
        try {
            const res = await api.patch('/profile/wallet', { walletAddress: address });
            onLinked(address);
            toast.success(res.data.message || 'Wallet linked to your profile!');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to link wallet');
        } finally {
            setLinking(false);
        }
    };

    const shortAddr = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;

    return (
        <div className="space-y-4">
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Connected Wallet</p>
                {walletAddress ? (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                        <span className="material-symbols-outlined text-emerald-600">verified</span>
                        <div>
                            <p className="text-sm font-bold text-emerald-800 font-mono">{shortAddr(walletAddress)}</p>
                            <p className="text-xs text-emerald-600">Verified on-chain</p>
                        </div>
                        <a
                            href={`https://polygonscan.com/address/${walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto text-xs text-emerald-700 hover:underline flex items-center gap-1"
                        >
                            View <span className="material-symbols-outlined text-sm">open_in_new</span>
                        </a>
                    </div>
                ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-300">account_balance_wallet</span>
                        No wallet linked yet
                    </div>
                )}
            </div>

            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rainbow Kit</p>
                <ConnectButton />
            </div>

            {isConnected && address && address !== walletAddress && (
                <button
                    onClick={handleLink}
                    disabled={linking}
                    className="w-full py-2.5 bg-[#1A7A4A] text-white rounded-xl text-sm font-bold hover:bg-[#14613B] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    {linking ? 'Linking...' : 'Link This Wallet to Profile'}
                    {!linking && <span className="material-symbols-outlined text-[18px]">link</span>}
                </button>
            )}
        </div>
    );
}

/* ─── Change Password Section (shared) ──────────────────────── */
export function ChangePasswordSection() {
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [saving, setSaving] = useState(false);

    const handleChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) {
            return toast.error('New passwords do not match');
        }
        if (form.newPassword.length < 8) {
            return toast.error('New password must be at least 8 characters');
        }
        setSaving(true);
        try {
            await api.patch('/profile/change-password', {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            toast.success('Password changed successfully');
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleChange} className="space-y-4">
            <FormField
                label="Current Password"
                type="password"
                value={form.currentPassword}
                onChange={v => setForm(f => ({ ...f, currentPassword: v }))}
                placeholder="••••••••"
            />
            <FormField
                label="New Password"
                type="password"
                value={form.newPassword}
                onChange={v => setForm(f => ({ ...f, newPassword: v }))}
                placeholder="Min. 8 characters"
            />
            <FormField
                label="Confirm New Password"
                type="password"
                value={form.confirmPassword}
                onChange={v => setForm(f => ({ ...f, confirmPassword: v }))}
                placeholder="Repeat new password"
            />
            <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-colors disabled:opacity-60"
            >
                {saving ? 'Updating...' : 'Update Password'}
            </button>
        </form>
    );
}

/* ─── Profile Stats Card ──────────────────────────── */
export function StatBadge({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
    return (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${color}`}>
            <span className="material-symbols-outlined text-xl">{icon}</span>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
                <p className="text-xl font-black font-['Syne',sans-serif]">{value}</p>
            </div>
        </div>
    );
}
