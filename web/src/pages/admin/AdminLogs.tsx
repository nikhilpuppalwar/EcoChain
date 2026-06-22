import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function AdminLogs() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const eventConfig: Record<string, { color: string; label: string; icon: string }> = {
        SUBMISSION: { color: 'bg-blue-100 text-blue-700', label: 'Submission', icon: 'upload' },
        ASSIGNED:   { color: 'bg-amber-100 text-amber-700', label: 'Assigned', icon: 'assignment_ind' },
        AUDIT:      { color: 'bg-purple-100 text-purple-700', label: 'Audit', icon: 'fact_check' },
        MINT:       { color: 'bg-green-100 text-green-700', label: 'Mint/Credits', icon: 'generating_tokens' },
    };

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/public/ledger');
                const events = res.data.data?.recentPublicLedger || [];
                setLogs(events);
            } catch (err) {
                toast.error('Failed to load activity logs');
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const eventTypes = ['all', ...Object.keys(eventConfig)];

    const filtered = logs.filter(l =>
        (typeFilter === 'all' || l.eventType === typeFilter) &&
        (!search || (l.companyName || '').toLowerCase().includes(search.toLowerCase()) ||
            (l.txHash || '').toLowerCase().includes(search.toLowerCase()) ||
            (l.details || '').toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Activity Logs & Audit Trail</h1>
                <p className="text-gray-400 text-sm mt-1">Blockchain-anchored platform activity — immutable record of all workflow events</p>
            </div>

            <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-48 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                    <input className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" placeholder="Search by company, tx hash, or details..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {eventTypes.map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-2.5 rounded-xl text-xs font-bold capitalize transition-all border ${typeFilter === t ? 'bg-[#1A7A4A] text-white border-[#1A7A4A]' : 'bg-white text-gray-500 border-gray-200'}`}>{t === 'all' ? 'All Events' : eventConfig[t]?.label || t}</button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="font-black text-gray-900">Blockchain Event Log ({filtered.length} events)</span>
                    </div>
                </div>
                {loading ? (
                    <div className="py-12 text-center text-gray-400">Loading activity log...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3 text-left">Event Type</th>
                                    <th className="px-5 py-3 text-left">Company</th>
                                    <th className="px-5 py-3 text-left">Period</th>
                                    <th className="px-5 py-3 text-left">Details</th>
                                    <th className="px-5 py-3 text-left">TX Hash</th>
                                    <th className="px-5 py-3 text-left">Actor</th>
                                    <th className="px-5 py-3 text-left">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.length > 0 ? filtered.map((l, i) => {
                                    const cfg = eventConfig[l.eventType] || eventConfig.SUBMISSION;
                                    const txShort = l.txHash ? `${l.txHash.slice(0, 10)}...${l.txHash.slice(-6)}` : 'N/A';
                                    return (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg ${cfg.color}`}>
                                                    <span className="material-symbols-outlined text-[12px]">{cfg.icon}</span>
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 font-bold text-gray-900">{l.companyName}</td>
                                            <td className="px-5 py-4 text-gray-500 text-xs">{l.period || '—'}</td>
                                            <td className="px-5 py-4 text-xs text-gray-500 max-w-48 truncate" title={l.details}>{l.details}</td>
                                            <td className="px-5 py-4 font-mono text-xs text-blue-600">{txShort}</td>
                                            <td className="px-5 py-4 text-xs capitalize text-gray-500">{l.actor || '—'}</td>
                                            <td className="px-5 py-4 text-xs text-gray-400">{new Date(l.createdAt).toLocaleString()}</td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                                        <span className="material-symbols-outlined text-4xl block mb-2 text-gray-200">link_off</span>
                                        No blockchain events recorded yet. Events appear when industry submits reports.
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
