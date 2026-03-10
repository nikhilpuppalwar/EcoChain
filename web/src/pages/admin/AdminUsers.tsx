import { useState } from 'react';

const users = [
    { id: 'U001', name: 'Raj Kumar', email: 'raj@steelmax.com', role: 'industry', status: 'active', company: 'SteelMax Industries', joined: '2024-01-15' },
    { id: 'U002', name: 'Dr. Priya Patel', email: 'priya@moecc.gov.in', role: 'government', status: 'active', company: 'Ministry of Environment', joined: '2024-02-01' },
    { id: 'U003', name: 'Jane Doe', email: 'jane@greenaudit.co', role: 'auditor', status: 'active', company: 'GreenAudit Firm', joined: '2024-03-10' },
    { id: 'U004', name: 'Arjun Singh', email: 'arjun@coaltech.com', role: 'industry', status: 'suspended', company: 'CoalTech Energy', joined: '2024-01-20' },
    { id: 'U005', name: 'Dr. Ravi Mehta', email: 'ravi@epa.gov.in', role: 'government', status: 'pending', company: 'Central Pollution Control', joined: '2024-04-01' },
];

const pendingVerifications = [
    { id: 'P001', company: 'HeavyMetal Corp.', role: 'industry', email: 'contact@heavymetal.com', docType: 'Business Certificate', submitted: 'Mar 5, 2026' },
    { id: 'P002', company: 'EnviroAudit Pro', role: 'auditor', email: 'admin@enviroaudit.com', docType: 'Professional License', submitted: 'Mar 6, 2026' },
];

export default function AdminUsers() {
    const [tab, setTab] = useState<'all' | 'pending'>('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedPending, setSelectedPending] = useState<typeof pendingVerifications[0] | null>(null);

    const roles = ['all', 'industry', 'auditor', 'government'];
    const roleColors: Record<string, string> = {
        industry: 'bg-green-100 text-green-700',
        auditor: 'bg-violet-100 text-violet-700',
        government: 'bg-blue-100 text-blue-700',
    };
    const statusColors: Record<string, string> = {
        active: 'bg-green-100 text-green-700',
        suspended: 'bg-red-100 text-red-700',
        pending: 'bg-amber-100 text-amber-700',
    };

    const filtered = users.filter(u =>
        (roleFilter === 'all' || u.role === roleFilter) &&
        (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">User & Verification Management</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage all platform users and pending verifications</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                    {[{ id: 'all', label: 'All Users' }, { id: 'pending', label: 'Pending Verifications', badge: pendingVerifications.length.toString() }].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id as 'all' | 'pending')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${tab === t.id ? 'bg-[#1A7A4A] text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                            {t.label}
                            {t.badge && <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{t.badge}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {tab === 'all' && (
                <>
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                            <input className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
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
                                {filtered.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#1A7A4A] text-white flex items-center justify-center font-black text-xs">{u.name[0]}</div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{u.name}</p>
                                                    <p className="text-xs text-gray-400">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4"><span className={`text-xs font-black px-2 py-1 rounded-lg capitalize ${roleColors[u.role]}`}>{u.role}</span></td>
                                        <td className="px-5 py-4 text-gray-600">{u.company}</td>
                                        <td className="px-5 py-4"><span className={`text-xs font-black px-2 py-1 rounded-lg capitalize ${statusColors[u.status]}`}>{u.status}</span></td>
                                        <td className="px-5 py-4 text-xs text-gray-400">{u.joined}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="text-xs font-bold text-gray-500 hover:text-gray-900 border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">Edit</button>
                                                {u.status === 'active' ? (
                                                    <button className="text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">Suspend</button>
                                                ) : (
                                                    <button className="text-xs font-bold text-green-600 hover:text-green-800 border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors">Activate</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {tab === 'pending' && (
                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        {pendingVerifications.map(p => (
                            <div key={p.id} onClick={() => setSelectedPending(p)} className={`bg-white rounded-2xl border p-5 shadow-sm cursor-pointer hover:shadow-md transition-all ${selectedPending?.id === p.id ? 'border-[#1A7A4A]' : 'border-gray-100'}`}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-black text-gray-900">{p.company}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{p.email}</p>
                                    </div>
                                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${roleColors[p.role]}`}>{p.role}</span>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-xs text-gray-500">Doc: {p.docType}</span>
                                    <span className="text-xs text-gray-400">Submitted: {p.submitted}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedPending ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-black text-gray-900 mb-4">Review: {selectedPending.company}</h3>
                            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 h-40 flex items-center justify-center mb-4">
                                <div className="text-center text-gray-300">
                                    <span className="material-symbols-outlined text-4xl">picture_as_pdf</span>
                                    <p className="text-sm mt-1">{selectedPending.docType}</p>
                                    <button className="text-xs text-[#1A7A4A] font-bold mt-1 hover:underline">View Document →</button>
                                </div>
                            </div>
                            <div className="space-y-3 mb-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rejection Reason (if rejecting)</label>
                                    <textarea rows={3} className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 resize-none" placeholder="Reason for rejection..." />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="bg-[#1A7A4A] text-white font-black py-3 rounded-xl hover:bg-[#15613b] transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Approve
                                </button>
                                <button className="bg-red-600 text-white font-black py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">cancel</span>
                                    Reject
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center text-center">
                            <div className="text-gray-300 p-8">
                                <span className="material-symbols-outlined text-5xl">person_search</span>
                                <p className="text-sm font-medium mt-2">Select a pending verification to review</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
