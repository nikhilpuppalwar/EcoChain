import { useState } from 'react';
import toast from 'react-hot-toast';

const logs = [
    { id: 'L001', user: 'raj@steelmax.com', role: 'industry', action: 'SUBMISSION_CREATE', detail: 'Created emission report SUB-2024-0084', ip: '192.168.1.42', ts: '2026-03-08 14:23', risk: 'none' },
    { id: 'L002', user: 'jane@greenaudit.co', role: 'auditor', action: 'AUDIT_APPROVE', detail: 'Approved SUB-2024-0081 and signed', ip: '10.0.0.5', ts: '2026-03-08 12:10', risk: 'none' },
    { id: 'L003', user: 'unknown@hacker.io', role: '—', action: 'LOGIN_FAIL', detail: '5 failed login attempts in 2 minutes', ip: '45.33.32.156', ts: '2026-03-08 11:45', risk: 'HIGH' },
    { id: 'L004', user: 'arjun@coaltech.com', role: 'industry', action: 'DATA_TAMPER_ATTEMPT', detail: 'Attempted to edit locked submission SUB-2024-0068', ip: '172.17.0.3', ts: '2026-03-08 10:20', risk: 'MEDIUM' },
    { id: 'L005', user: 'priya@moecc.gov.in', role: 'government', action: 'CREDIT_APPROVE', detail: 'Approved carbon credit tokenization for SteelMax', ip: '10.0.0.10', ts: '2026-03-07 16:30', risk: 'none' },
    { id: 'L006', user: 'admin@ecochain.dev', role: 'admin', action: 'CONFIG_UPDATE', detail: 'Updated anomaly threshold 70→75', ip: '127.0.0.1', ts: '2026-03-07 09:15', risk: 'none' },
];

export default function AdminLogs() {
    const [search, setSearch] = useState('');
    const [riskFilter, setRiskFilter] = useState('all');

    const riskColors: Record<string, string> = {
        HIGH: 'bg-red-100 text-red-700',
        MEDIUM: 'bg-orange-100 text-orange-700',
        none: 'bg-gray-100 text-gray-400',
    };

    const filtered = logs.filter(l =>
        (riskFilter === 'all' || l.risk === riskFilter) &&
        (!search || l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()))
    );

    const flagged = logs.filter(l => l.risk !== 'none');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Activity Logs & Security</h1>
                <p className="text-gray-400 text-sm mt-1">Complete platform audit trail and security events</p>
            </div>

            {/* Flagged alerts */}
            {flagged.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <h3 className="font-black text-red-700 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined">warning</span>
                        {flagged.length} Security Events Require Attention
                    </h3>
                    <div className="space-y-3">
                        {flagged.map(f => (
                            <div key={f.id} className="flex items-center justify-between bg-white rounded-xl p-4 border border-red-100">
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{f.action.replace(/_/g, ' ')}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{f.detail} · IP: {f.ip}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${riskColors[f.risk]}`}>{f.risk}</span>
                                    <button onClick={() => toast.success(`IP ${f.ip} blocked!`)} className="text-xs font-bold text-red-600 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">Block IP</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                    <input className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" placeholder="Search by user, action..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {['all', 'HIGH', 'MEDIUM', 'none'].map(r => (
                    <button key={r} onClick={() => setRiskFilter(r)} className={`px-4 py-2.5 rounded-xl text-sm font-bold capitalize transition-all border ${riskFilter === r ? 'bg-[#1A7A4A] text-white border-[#1A7A4A]' : 'bg-white text-gray-500 border-gray-200'}`}>
                        {r === 'none' ? 'Normal' : r}
                    </button>
                ))}
            </div>

            {/* Log table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <tr>
                                <th className="px-5 py-3 text-left">User</th>
                                <th className="px-5 py-3 text-left">Role</th>
                                <th className="px-5 py-3 text-left">Action</th>
                                <th className="px-5 py-3 text-left">Detail</th>
                                <th className="px-5 py-3 text-left">IP</th>
                                <th className="px-5 py-3 text-left">Risk</th>
                                <th className="px-5 py-3 text-left">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(l => (
                                <tr key={l.id} className={`hover:bg-gray-50 transition-colors ${l.risk !== 'none' ? 'bg-red-50/30' : ''}`}>
                                    <td className="px-5 py-4 text-xs font-mono text-gray-700">{l.user}</td>
                                    <td className="px-5 py-4 capitalize text-gray-500 text-xs">{l.role}</td>
                                    <td className="px-5 py-4"><span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{l.action}</span></td>
                                    <td className="px-5 py-4 text-xs text-gray-500 max-w-48 truncate">{l.detail}</td>
                                    <td className="px-5 py-4 font-mono text-xs text-gray-400">{l.ip}</td>
                                    <td className="px-5 py-4"><span className={`text-xs font-black px-2 py-0.5 rounded-full ${riskColors[l.risk]}`}>{l.risk === 'none' ? '—' : l.risk}</span></td>
                                    <td className="px-5 py-4 text-xs text-gray-400 font-mono">{l.ts}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* GDPR tool */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-gray-900 mb-2">GDPR Data Deletion Tool</h3>
                <p className="text-xs text-gray-400 mb-4">Permanently delete all personal data for a user on verified request.</p>
                <div className="flex gap-3">
                    <input className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200" placeholder="Enter user email to delete..." />
                    <button onClick={() => toast.error('This action is irreversible — disabled in demo')} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-colors text-sm">
                        <span className="material-symbols-outlined text-sm">delete_forever</span>
                        Delete Data
                    </button>
                </div>
            </div>
        </div>
    );
}
