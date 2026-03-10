import { useState } from 'react';
import toast from 'react-hot-toast';

const sent = [
    { id: 1, title: 'Q4 2024 Submission Deadline Reminder', recipients: 'All Industries', type: 'Deadline', date: '2025-12-15', delivered: 342, status: 'Sent' },
    { id: 2, title: 'New Emission Limit Policy 2025', recipients: 'All Industries + Auditors', type: 'Policy', date: '2025-01-01', delivered: 389, status: 'Sent' },
    { id: 3, title: 'System Maintenance Notice — March 9', recipients: 'All Users', type: 'System', date: '2026-03-06', delivered: 401, status: 'Sent' },
];

export default function GovNotifications() {
    const [tab, setTab] = useState<'compose' | 'history'>('compose');
    const [form, setForm] = useState({ title: '', type: '', recipients: [] as string[], message: '', schedule: false, scheduleDate: '' });

    const recipientOptions = ['All Industries', 'All Auditors', 'Government Officials', 'Specific Sector: Manufacturing', 'Specific Sector: Energy'];
    const typeOptions = ['Deadline Reminder', 'Policy Update', 'System Alert', 'Credit Notification', 'Compliance Warning'];

    const handleSend = () => {
        if (!form.title || !form.type || !form.message) { toast.error('Fill all required fields'); return; }
        toast.success(form.schedule ? 'Notification scheduled!' : 'Notification sent to all recipients!');
        setForm({ title: '', type: '', recipients: [], message: '', schedule: false, scheduleDate: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Notifications & Alerts</h1>
                    <p className="text-gray-400 text-sm mt-1">Compose and send alerts to industry, auditors, or government users</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                    {['compose', 'history'].map(t => (
                        <button key={t} onClick={() => setTab(t as 'compose' | 'history')} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${tab === t ? 'bg-[#1A7A4A] text-white' : 'text-gray-500 hover:text-gray-900'}`}>{t}</button>
                    ))}
                </div>
            </div>

            {tab === 'compose' && (
                <div className="max-w-2xl space-y-5">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                        <h3 className="font-black text-gray-900">Compose Notification</h3>
                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-1.5">Notification Title *</label>
                            <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" placeholder="Q4 Deadline Reminder..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-1.5">Notification Type *</label>
                            <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                <option value="">Select type...</option>
                                {typeOptions.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-2">Recipients *</label>
                            <div className="flex flex-wrap gap-2">
                                {recipientOptions.map(r => (
                                    <button type="button" key={r} onClick={() => {
                                        const newR = form.recipients.includes(r) ? form.recipients.filter(x => x !== r) : [...form.recipients, r];
                                        setForm({ ...form, recipients: newR });
                                    }} className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition-all ${form.recipients.includes(r) ? 'bg-[#1A7A4A] text-white border-[#1A7A4A]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#1A7A4A]/40'}`}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-1.5">Message *</label>
                            <textarea rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 resize-none" placeholder="Write your notification message here..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                        </div>
                        <div className="flex items-center justify-between py-3 border-t border-gray-50">
                            <div>
                                <p className="font-black text-gray-900 text-sm">Schedule for Later</p>
                                <p className="text-xs text-gray-400">Instead of sending right now</p>
                            </div>
                            <button type="button" onClick={() => setForm({ ...form, schedule: !form.schedule })} className={`relative w-12 h-6 rounded-full transition-colors ${form.schedule ? 'bg-[#1A7A4A]' : 'bg-gray-200'}`}>
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.schedule ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>
                        {form.schedule && (
                            <div>
                                <label className="block text-sm font-black text-gray-700 mb-1.5">Schedule Date & Time</label>
                                <input type="datetime-local" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" value={form.scheduleDate} onChange={e => setForm({ ...form, scheduleDate: e.target.value })} />
                            </div>
                        )}
                        <button onClick={handleSend} className="w-full bg-[#1A7A4A] text-white font-black py-4 rounded-xl hover:bg-[#15613b] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1A7A4A]/20">
                            <span className="material-symbols-outlined text-sm">{form.schedule ? 'schedule' : 'send'}</span>
                            {form.schedule ? 'Schedule Notification' : 'Send Now'}
                        </button>
                    </div>
                </div>
            )}

            {tab === 'history' && (
                <div className="space-y-3">
                    {sent.map(s => (
                        <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-blue-500">notifications</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-gray-900">{s.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">To: {s.recipients} · {s.date}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-[#1A7A4A] text-sm">{s.delivered}</p>
                                <p className="text-xs text-gray-400">delivered</p>
                            </div>
                            <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-full">{s.status}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
