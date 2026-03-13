import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const submissions = [
    {
        id: 'SUB-2025-001', period: 'Q1 2025', submitted: '2025-04-05', status: 'approved', co2: 4200, credits: 840,
        progress: 100, auditor: 'Dr. Kenji Tanaka', blockchainTx: '0x8a7c...2b9f', certIssued: true,
        steps: [
            { label: 'Submitted', done: true, date: '2025-04-05' },
            { label: 'Assigned to Auditor', done: true, date: '2025-04-06' },
            { label: 'AI Pre-screening', done: true, date: '2025-04-06' },
            { label: 'Auditor Review', done: true, date: '2025-04-10' },
            { label: 'Gov Approval', done: true, date: '2025-04-12' },
            { label: 'Credits Issued', done: true, date: '2025-04-13' },
        ],
    },
    {
        id: 'SUB-2025-002', period: 'Q2 2025', submitted: '2025-07-08', status: 'rejected', co2: 5100, credits: 0,
        progress: 40, auditor: 'Jane Doe', blockchainTx: null, certIssued: false,
        rejectionReason: 'Scope 2 emission data inconsistency detected. Invoice data does not match reported electricity usage by more than 15%.',
        steps: [
            { label: 'Submitted', done: true, date: '2025-07-08' },
            { label: 'Assigned to Auditor', done: true, date: '2025-07-09' },
            { label: 'AI Pre-screening', done: true, date: '2025-07-09' },
            { label: 'Auditor Review', done: false, date: null },
            { label: 'Gov Approval', done: false, date: null },
            { label: 'Credits Issued', done: false, date: null },
        ],
    },
    {
        id: 'SUB-2025-003', period: 'Q3 2025', submitted: '2025-10-02', status: 'under_review', co2: 3850, credits: 0,
        progress: 60, auditor: 'Aisha Mohammed', blockchainTx: null, certIssued: false,
        steps: [
            { label: 'Submitted', done: true, date: '2025-10-02' },
            { label: 'Assigned to Auditor', done: true, date: '2025-10-03' },
            { label: 'AI Pre-screening', done: true, date: '2025-10-03' },
            { label: 'Auditor Review', done: false, date: null },
            { label: 'Gov Approval', done: false, date: null },
            { label: 'Credits Issued', done: false, date: null },
        ],
    },
];

const trendData = [
    { q: 'Q1 24', co2: 5400 }, { q: 'Q2 24', co2: 5100 }, { q: 'Q3 24', co2: 4800 },
    { q: 'Q4 24', co2: 4500 }, { q: 'Q1 25', co2: 4200 }, { q: 'Q2 25', co2: 5100 }, { q: 'Q3 25', co2: 3850 },
];

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    approved: { label: 'Approved', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
    under_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    pending: { label: 'Pending', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
    correction_requested: { label: 'Correction Requested', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
    awaiting_second_auditor: { label: 'Wait 2nd Auditor', color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
    pending_govt_assignment: { label: 'Wait Govt Assgn', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
};

export default function SubmissionTracker() {
    const [selected, setSelected] = useState(submissions[0]);
    const [showResubmit, setShowResubmit] = useState(false);

    const cfg = statusConfig[selected.status] ?? statusConfig.pending;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Submission Tracker</h1>
                <p className="text-gray-400 text-sm mt-1">Track your emission report status, review feedback, and resubmit rejected reports</p>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Submissions', value: '3', icon: 'assignment', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Approved', value: '1', icon: 'check_circle', color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Rejected', value: '1', icon: 'cancel', color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Under Review', value: '1', icon: 'schedule', color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                            <span className={`material-symbols-outlined text-sm ${s.color}`}>{s.icon}</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{s.value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Submissions list */}
                <div className="space-y-3">
                    {submissions.map(s => {
                        const c = statusConfig[s.status] ?? statusConfig.pending;
                        return (
                            <div
                                key={s.id}
                                onClick={() => { setSelected(s); setShowResubmit(false); }}
                                className={`bg-white rounded-2xl border p-5 cursor-pointer hover:shadow-md transition-all ${selected.id === s.id ? 'border-[#1A7A4A] shadow-md' : 'border-gray-100'}`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-black text-gray-900 text-sm">{s.id}</p>
                                        <p className="text-xs text-gray-400">{s.period}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.color}`}>{c.label}</span>
                                </div>
                                {/* Progress bar */}
                                <div className="mt-3">
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${s.status === 'rejected' ? 'bg-red-400' : s.status === 'approved' ? 'bg-green-500' : 'bg-amber-400'}`}
                                            style={{ width: `${s.progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-xs text-gray-400">Progress</span>
                                        <span className="text-xs font-bold text-gray-600">{s.progress}%</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Emission trend mini chart */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">CO₂ Trend (tCO₂e)</p>
                        <ResponsiveContainer width="100%" height={100}>
                            <LineChart data={trendData}>
                                <XAxis dataKey="q" tick={{ fontSize: 9 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="co2" stroke="#1A7A4A" strokeWidth={2} dot={{ r: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Detail panel */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                            </div>
                            <h2 className="text-xl font-black text-gray-900">{selected.id}</h2>
                            <p className="text-sm text-gray-400">Period: {selected.period} · Submitted: {selected.submitted}</p>
                        </div>
                        {selected.certIssued && (
                            <button className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 font-bold text-sm px-4 py-2 rounded-xl hover:bg-green-100 transition-colors">
                                <span className="material-symbols-outlined text-sm">download</span>
                                Certificate
                            </button>
                        )}
                        {selected.status === 'rejected' && !showResubmit && (
                            <button
                                onClick={() => setShowResubmit(true)}
                                className="flex items-center gap-2 bg-[#1A7A4A] text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#2E9E68] transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">refresh</span>
                                Resubmit
                            </button>
                        )}
                    </div>

                    {/* Timeline steps */}
                    <div className="mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Review Pipeline</p>
                        <div className="relative">
                            {selected.steps.map((step, i) => (
                                <div key={i} className="flex items-start gap-4 mb-4 last:mb-0">
                                    <div className="relative flex flex-col items-center">
                                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 flex-shrink-0 ${step.done ? 'bg-[#1A7A4A] border-[#1A7A4A]' : 'bg-white border-gray-200'}`}>
                                            {step.done ? (
                                                <span className="material-symbols-outlined text-white text-sm">check</span>
                                            ) : (
                                                <span className="w-2 h-2 rounded-full bg-gray-200 block" />
                                            )}
                                        </div>
                                        {i < selected.steps.length - 1 && (
                                            <div className={`w-0.5 h-8 ${selected.steps[i + 1].done ? 'bg-[#1A7A4A]' : 'bg-gray-100'}`} />
                                        )}
                                    </div>
                                    <div className="pt-0.5 flex-1">
                                        <p className={`text-sm font-bold ${step.done ? 'text-gray-900' : 'text-gray-300'}`}>{step.label}</p>
                                        {step.date && <p className="text-xs text-gray-400">{step.date}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Key metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="font-black text-gray-900">{selected.co2.toLocaleString()}</p>
                            <p className="text-xs text-gray-400">tCO₂e Reported</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className={`font-black ${selected.credits > 0 ? 'text-green-600' : 'text-gray-300'}`}>{selected.credits}</p>
                            <p className="text-xs text-gray-400">Credits Earned</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="font-black text-gray-900 text-sm">{selected.auditor}</p>
                            <p className="text-xs text-gray-400">Assigned Auditor</p>
                        </div>
                    </div>

                    {/* Rejection reason */}
                    {'rejectionReason' in selected && selected.rejectionReason && !showResubmit && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-red-500 text-sm">error</span>
                                <p className="font-bold text-red-700 text-sm">Rejection Reason</p>
                            </div>
                            <p className="text-sm text-red-600">{selected.rejectionReason}</p>
                        </div>
                    )}

                    {/* Resubmit form */}
                    {showResubmit && (
                        <div className="border border-dashed border-[#1A7A4A]/30 rounded-xl p-5 bg-green-50/40">
                            <p className="font-black text-gray-900 mb-4 text-sm">Resubmit — {selected.id}</p>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Corrected Scope 2 (MWh)</label>
                                    <input className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 bg-white" placeholder="Enter corrected value" type="number" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Supporting Document</label>
                                    <div className="mt-1 border border-dashed border-gray-200 rounded-xl p-4 text-center text-gray-400 text-sm cursor-pointer hover:border-[#1A7A4A]/40 hover:bg-green-50 transition-all flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-sm">upload_file</span>
                                        Upload corrected invoice / meter reading
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Remarks to Auditor</label>
                                    <textarea className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 bg-white resize-none" rows={2} placeholder="Explain the correction..." />
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button className="flex-1 py-2.5 bg-[#1A7A4A] text-white font-bold text-sm rounded-xl hover:bg-[#2E9E68] transition-colors">Submit Correction</button>
                                    <button onClick={() => setShowResubmit(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Blockchain tx */}
                    {selected.blockchainTx && (
                        <div className="flex items-center gap-2 mt-4 border border-gray-100 p-3 rounded-xl bg-gray-50">
                            <span className="material-symbols-outlined text-[#1A7A4A] text-sm">link</span>
                            <span className="text-xs text-gray-500">Blockchain TX:</span>
                            <span className="text-xs font-mono text-[#1A7A4A] font-bold">{selected.blockchainTx}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
