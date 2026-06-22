import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
    const [tab, setTab] = useState<'all' | 'pending'>('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const roleColors: Record<string, string> = {
        industry: 'bg-green-100 text-green-700',
        auditor: 'bg-violet-100 text-violet-700',
        government: 'bg-blue-100 text-blue-700',
        admin: 'bg-gray-200 text-gray-700',
    };
    const statusColors: Record<string, string> = {
        active: 'bg-green-100 text-green-700',
        suspended: 'bg-red-100 text-red-700',
        pending: 'bg-amber-100 text-amber-700',
    };

    const roles = ['all', 'industry', 'auditor', 'government', 'admin'];

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/auth/users');
                setUsers(res.data.data || []);
            } catch (err: any) {
                // Admin endpoint may return 403 for non-admin - show message
                if (err.response?.status === 403) {
                    toast.error('Admin access required to view all users');
                } else {
                    toast.error('Failed to load users');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const pendingUsers = users.filter(u => u.status === 'pending' || !u.status);

    const filtered = users.filter(u =>
        (roleFilter === 'all' || u.role === roleFilter) &&
        (!search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    );

    const handleToggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">User & Verification Management</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage all platform users across roles</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                    {[{ id: 'all', label: 'All Users' }, { id: 'pending', label: 'Pending', badge: pendingUsers.length.toString() }].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id as 'all' | 'pending')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${tab === t.id ? 'bg-[#1A7A4A] text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                            {t.label}
                            {t.badge && parseInt(t.badge) > 0 && <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{t.badge}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="py-12 text-center text-gray-400">Loading users...</div>
            ) : (
                <>
                    {tab === 'all' && (
                        <>
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                                    <input className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {roles.map(r => (
                                        <button key={r} onClick={() => setRoleFilter(r)} className={`px-4 py-2.5 rounded-xl text-sm font-bold capitalize transition-all border ${roleFilter === r ? 'bg-[#1A7A4A] text-white border-[#1A7A4A]' : 'bg-white text-gray-500 border-gray-200'}`}>{r}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-5 py-3 text-left">User</th>
                                            <th className="px-5 py-3 text-left">Role</th>
                                            <th className="px-5 py-3 text-left">Organization</th>
                                            <th className="px-5 py-3 text-left">Status</th>
                                            <th className="px-5 py-3 text-left">Joined</th>
                                            <th className="px-5 py-3 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filtered.length > 0 ? filtered.map(u => (
                                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#1A7A4A] text-white flex items-center justify-center font-black text-xs">{(u.name || u.email)[0].toUpperCase()}</div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{u.name}</p>
                                                            <p className="text-xs text-gray-400">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4"><span className={`text-xs font-black px-2 py-1 rounded-lg capitalize ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                                                <td className="px-5 py-4 text-gray-600 text-sm">{u.company}</td>
                                                <td className="px-5 py-4"><span className={`text-xs font-black px-2 py-1 rounded-lg capitalize ${statusColors[u.status] || 'bg-gray-100 text-gray-500'}`}>{u.status || 'active'}</span></td>
                                                <td className="px-5 py-4 text-xs text-gray-400">{u.joined}</td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {u.status === 'active' ? (
                                                            <button onClick={() => handleToggleStatus(u.id, u.status)} className="text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">Suspend</button>
                                                        ) : (
                                                            <button onClick={() => handleToggleStatus(u.id, u.status)} className="text-xs font-bold text-green-600 hover:text-green-800 border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors">Activate</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No users found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="p-4 border-t border-gray-100 text-xs text-gray-400">
                                    Showing {filtered.length} of {users.length} total users
                                </div>
                            </div>
                        </>
                    )}

                    {tab === 'pending' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {pendingUsers.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {pendingUsers.map(u => (
                                        <div key={u.id} className="p-5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-black">{(u.name || u.email)[0].toUpperCase()}</div>
                                                <div>
                                                    <p className="font-black text-gray-900">{u.name}</p>
                                                    <p className="text-xs text-gray-400">{u.email} · {u.company}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className={`text-xs font-black px-2 py-1 rounded-lg capitalize ${roleColors[u.role] || 'bg-gray-100'}`}>{u.role}</span>
                                                <button onClick={() => toast.success('User approved')} className="text-xs font-bold bg-[#1A7A4A] text-white px-3 py-1 rounded-lg">Approve</button>
                                                <button onClick={() => toast.error('User rejected')} className="text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-lg">Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-gray-400">
                                    <span className="material-symbols-outlined text-5xl block mb-2 text-gray-200">check_circle</span>
                                    No pending verifications
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
