import { useState } from 'react';
import toast from 'react-hot-toast';

const documents = [
    { id: 1, title: 'Emission Reporting Guidelines 2025', status: 'Published', uploadedBy: 'Admin', date: '2025-01-01', category: 'policy' },
    { id: 2, title: 'Carbon Credit Eligibility Criteria', status: 'Published', uploadedBy: 'Admin', date: '2024-09-15', category: 'guideline' },
    { id: 3, title: 'Audit Protocol v2.0', status: 'Draft', uploadedBy: 'Admin', date: '2025-03-01', category: 'protocol' },
];

const faqs: { role: string; q: string; a: string }[] = [
    { role: 'Industry', q: 'How do I submit emission data?', a: 'Log in to your Industry portal and navigate to Emissions > Add New.' },
    { role: 'Auditor', q: 'How do I receive audit assignments?', a: 'Assignments are distributed by the system. Check your Audit Queue and Notifications.' },
    { role: 'Government', q: 'How do I approve carbon credits?', a: 'Navigate to Issue Credits page and review the pending credit requests.' },
];

const emailTemplates = [
    { id: 1, name: 'Submission Received', trigger: 'On industry submit', lastEdited: '2025-01-10' },
    { id: 2, name: 'Audit Assigned', trigger: 'On auditor assignment', lastEdited: '2025-01-08' },
    { id: 3, name: 'Anomaly Flagged', trigger: 'On AI detection', lastEdited: '2025-02-01' },
    { id: 4, name: 'Credits Minted', trigger: 'On credit tokenization', lastEdited: '2025-01-15' },
];

export default function AdminContent() {
    const [tab, setTab] = useState<'docs' | 'faq' | 'templates' | 'announcement'>('docs');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Content & Notifications Config</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage policy docs, FAQs, email templates, and bulk alerts</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                    {[{ id: 'docs', label: 'Documents' }, { id: 'faq', label: 'FAQ' }, { id: 'templates', label: 'Email Templates' }, { id: 'announcement', label: 'Announcement' }].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id as 'docs' | 'faq' | 'templates' | 'announcement')} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${tab === t.id ? 'bg-[#1A7A4A] text-white' : 'text-gray-500 hover:text-gray-900'}`}>{t.label}</button>
                    ))}
                </div>
            </div>

            {tab === 'docs' && (
                <div className="space-y-4">
                    <div className="flex justify-end gap-2">
                        <button className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#1A7A4A] px-4 py-2 rounded-xl hover:bg-[#15613b] transition-colors">
                            <span className="material-symbols-outlined text-sm">upload</span>Upload Document
                        </button>
                    </div>
                    <div className="space-y-3">
                        {documents.map(d => (
                            <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-gray-900">{d.title}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">By {d.uploadedBy} · {d.date} · <span className="capitalize">{d.category}</span></p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${d.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{d.status}</span>
                                    {d.status === 'Draft' && (<button onClick={() => toast.success('Published!')} className="text-xs font-bold text-[#1A7A4A] border border-[#1A7A4A]/30 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors">Publish</button>)}
                                    <button className="text-xs font-bold text-gray-500 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors">Archive</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'faq' && (
                <div className="space-y-4">
                    <button className="flex items-center gap-2 text-sm font-bold text-white bg-[#1A7A4A] px-4 py-2 rounded-xl hover:bg-[#15613b] transition-colors">
                        <span className="material-symbols-outlined text-sm">add</span>Add FAQ
                    </button>
                    <div className="space-y-3">
                        {faqs.map((f, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <span className={`text-xs font-black px-2 py-0.5 rounded-full mb-2 inline-block ${f.role === 'Industry' ? 'bg-green-100 text-green-700' : f.role === 'Auditor' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>{f.role}</span>
                                        <p className="font-black text-gray-900 mt-1">{f.q}</p>
                                        <p className="text-sm text-gray-500 mt-1.5">{f.a}</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button className="text-xs font-bold text-gray-500 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors">Edit</button>
                                        <button onClick={() => toast.error('Deleted (demo)')} className="text-xs font-bold text-red-500 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'templates' && (
                <div className="space-y-3">
                    {emailTemplates.map(t => (
                        <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-blue-500">email</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-gray-900">{t.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Trigger: {t.trigger} · Last edited: {t.lastEdited}</p>
                            </div>
                            <button onClick={() => toast.success('Template editor opened! (demo)')} className="text-xs font-bold text-[#1A7A4A] border border-[#1A7A4A]/30 px-4 py-2 rounded-xl hover:bg-green-50 transition-colors">Edit Template</button>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'announcement' && (
                <div className="max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-black text-gray-900 mb-1.5">Recipients</label>
                        <div className="flex flex-wrap gap-2">
                            {['All Users', 'Industry', 'Auditors', 'Government'].map(r => (
                                <label key={r} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                    <input type="checkbox" className="accent-[#1A7A4A]" />
                                    <span className="text-sm font-bold text-gray-700">{r}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-black text-gray-900 mb-1.5">Notification Type</label>
                        <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40">
                            <option>System Update</option>
                            <option>Deadline Reminder</option>
                            <option>Policy Change</option>
                            <option>Emergency Alert</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-black text-gray-900 mb-1.5">Title</label>
                        <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40" placeholder="Announcement title..." />
                    </div>
                    <div>
                        <label className="block text-sm font-black text-gray-900 mb-1.5">Message</label>
                        <textarea rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 resize-none" placeholder="Announcement body..." />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => toast.success('Announcement sent to all recipients!')} className="flex-1 bg-[#1A7A4A] text-white font-black py-3 rounded-xl hover:bg-[#15613b] transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">send</span>Send Now
                        </button>
                        <button onClick={() => toast.success('Announcement scheduled!')} className="flex-1 border border-gray-200 text-gray-700 font-black py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">schedule</span>Schedule
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
