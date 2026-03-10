import { useState } from 'react';

type Category = 'all' | 'compliance' | 'credits' | 'system' | 'auditor';

const allNotifications = [
    { id: 1, type: 'compliance', icon: 'admin_panel_settings', title: 'Compliance Deadline Reminder', body: 'Q3 2025 emission report due in 7 days. Ensure all Scope 1, 2, and 3 data is uploaded.', time: '2h ago', read: false, urgent: true },
    { id: 2, type: 'credits', icon: 'token', title: 'Carbon Credits Issued', body: 'You have earned 840 carbon credits for Q1 2025. Credits are now available in your wallet.', time: '1 day ago', read: false, urgent: false },
    { id: 3, type: 'auditor', icon: 'fact_check', title: 'Auditor Assigned — Q3 2025', body: 'Dr. Kenji Tanaka from CarbonVerify Ltd. has been assigned to review your Q3 2025 submission.', time: '2 days ago', read: true, urgent: false },
    { id: 4, type: 'compliance', icon: 'warning', title: 'Submission Rejected — Q2 2025', body: 'Your Q2 2025 submission was rejected due to data inconsistency in Scope 2. Please review and resubmit.', time: '5 days ago', read: true, urgent: true },
    { id: 5, type: 'system', icon: 'info', title: 'Platform Maintenance Scheduled', body: 'EcoChain will undergo a 2-hour maintenance window on March 15, 2025, from 02:00–04:00 AM IST.', time: '1 week ago', read: true, urgent: false },
    { id: 6, type: 'credits', icon: 'price_check', title: 'Credit Price Update', body: 'Carbon credit market price updated to $26.80/tCO₂e. Your portfolio value has increased by 4.2%.', time: '1 week ago', read: true, urgent: false },
    { id: 7, type: 'auditor', icon: 'assignment_turned_in', title: 'Audit Complete — Q1 2025', body: 'Q1 2025 audit by Dr. Kenji Tanaka is complete. Report has been submitted to the government for approval.', time: '2 weeks ago', read: true, urgent: false },
    { id: 8, type: 'system', icon: 'security', title: 'New Login Detected', body: 'A login was detected from a new device (Windows, Chrome). If this was not you, please change your password.', time: '3 weeks ago', read: true, urgent: false },
];

const preferences = [
    { key: 'compliance_deadline', label: 'Compliance Deadlines', description: 'Reminders before submission due date', email: true, sms: true, push: true },
    { key: 'credit_issued', label: 'Credits Issued', description: 'When new carbon credits are added to your wallet', email: true, sms: false, push: true },
    { key: 'submission_status', label: 'Submission Status', description: 'Approval, rejection, and auditor updates', email: true, sms: true, push: true },
    { key: 'market_price', label: 'Market Price Alerts', description: 'Significant credit price movements', email: false, sms: false, push: true },
    { key: 'system_alerts', label: 'System Alerts', description: 'Maintenance windows and security events', email: true, sms: false, push: false },
];

const categoryConfig: Record<string, { label: string; icon: string; color: string }> = {
    compliance: { label: 'Compliance', icon: 'admin_panel_settings', color: 'text-red-600 bg-red-50' },
    credits: { label: 'Credits', icon: 'token', color: 'text-green-600 bg-green-50' },
    auditor: { label: 'Auditor', icon: 'fact_check', color: 'text-violet-600 bg-violet-50' },
    system: { label: 'System', icon: 'info', color: 'text-blue-600 bg-blue-50' },
};

export default function IndustryNotifications() {
    const [filter, setFilter] = useState<Category>('all');
    const [tab, setTab] = useState<'inbox' | 'preferences'>('inbox');
    const [prefs, setPrefs] = useState(preferences);
    const [notifications, setNotifications] = useState(allNotifications);

    const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);
    const unread = notifications.filter(n => !n.read).length;

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const markRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const togglePref = (key: string, field: 'email' | 'sms' | 'push') => {
        setPrefs(prev => prev.map(p => p.key === key ? { ...p, [field]: !p[field] } : p));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        Notifications
                        {unread > 0 && (
                            <span className="w-6 h-6 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">{unread}</span>
                        )}
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Compliance alerts, credit updates, and auditor messages</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                    {[{ id: 'inbox', label: 'Inbox' }, { id: 'preferences', label: 'Preferences' }].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id as 'inbox' | 'preferences')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.id ? 'bg-[#1A7A4A] text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {tab === 'inbox' && (
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Category sidebar */}
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Filter</p>
                        {[
                            { id: 'all', label: 'All', icon: 'inbox', count: notifications.length },
                            ...Object.entries(categoryConfig).map(([id, c]) => ({
                                id, label: c.label, icon: c.icon, count: notifications.filter(n => n.type === id).length
                            })),
                        ].map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setFilter(cat.id as Category)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${filter === cat.id ? 'bg-[#1A7A4A] text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                                    {cat.label}
                                </div>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{cat.count}</span>
                            </button>
                        ))}

                        {unread > 0 && (
                            <button onClick={markAllRead} className="w-full mt-4 text-xs font-bold text-[#1A7A4A] hover:underline text-left px-2">
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notifications feed */}
                    <div className="lg:col-span-3 space-y-2">
                        {filtered.length === 0 && (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-300">
                                <span className="material-symbols-outlined text-4xl">notifications_off</span>
                                <p className="mt-2 text-sm">No notifications in this category</p>
                            </div>
                        )}
                        {filtered.map(n => {
                            const cc = categoryConfig[n.type];
                            return (
                                <div
                                    key={n.id}
                                    onClick={() => markRead(n.id)}
                                    className={`bg-white rounded-2xl border p-5 cursor-pointer hover:shadow-md transition-all ${!n.read ? 'border-[#1A7A4A]/30 bg-green-50/20' : 'border-gray-100'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cc.color}`}>
                                            <span className="material-symbols-outlined text-sm">{n.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className={`font-bold text-sm ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                                                {n.urgent && <span className="text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">Urgent</span>}
                                                {!n.read && <span className="w-2 h-2 bg-[#1A7A4A] rounded-full ml-auto flex-shrink-0" />}
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed">{n.body}</p>
                                            <p className="text-xs text-gray-300 mt-1.5">{n.time}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {tab === 'preferences' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1A7A4A]">tune</span>
                        <h2 className="font-black text-gray-900">Notification Preferences</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <tr>
                                <th className="px-5 py-3 text-left">Notification Type</th>
                                <th className="px-5 py-3 text-center">Email</th>
                                <th className="px-5 py-3 text-center">SMS</th>
                                <th className="px-5 py-3 text-center">Push</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {prefs.map(p => (
                                <tr key={p.key} className="hover:bg-gray-50">
                                    <td className="px-5 py-4">
                                        <p className="font-bold text-gray-900">{p.label}</p>
                                        <p className="text-xs text-gray-400">{p.description}</p>
                                    </td>
                                    {(['email', 'sms', 'push'] as const).map(channel => (
                                        <td key={channel} className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => togglePref(p.key, channel)}
                                                className={`w-11 h-6 rounded-full transition-all relative ${p[channel] ? 'bg-[#1A7A4A]' : 'bg-gray-200'}`}
                                                aria-label={`Toggle ${channel} for ${p.label}`}
                                            >
                                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${p[channel] ? 'left-5' : 'left-0.5'}`} />
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-5 border-t border-gray-100 flex justify-end">
                        <button className="bg-[#1A7A4A] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#2E9E68] transition-colors">Save Preferences</button>
                    </div>
                </div>
            )}
        </div>
    );
}
