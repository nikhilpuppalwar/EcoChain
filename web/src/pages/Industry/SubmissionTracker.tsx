import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const statusConfig: Record<string, { label: string; color: string; dot: string; progress: number }> = {
    draft:                    { label: 'Draft', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400', progress: 10 },
    submitted:                { label: 'Submitted', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', progress: 20 },
    pending:                  { label: 'Pending', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400', progress: 15 },
    ai_checking:              { label: 'AI Checking', color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500', progress: 30 },
    ai_flagged:               { label: 'AI Flagged', color: 'bg-red-100 text-red-700', dot: 'bg-red-500', progress: 35 },
    pending_govt_assignment:  { label: 'Pending Assignment', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', progress: 40 },
    pending_audit:            { label: 'Pending Audit', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', progress: 50 },
    under_review:             { label: 'Under Review', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', progress: 60 },
    awaiting_second_auditor:  { label: 'Awaiting 2nd Auditor', color: 'bg-cyan-100 text-cyan-700', dot: 'bg-cyan-500', progress: 75 },
    correction_requested:     { label: 'Correction Required', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', progress: 35 },
    pending_issuance:         { label: 'Credits Pending', color: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500', progress: 90 },
    approved:                 { label: 'Approved', color: 'bg-green-100 text-green-700', dot: 'bg-green-500', progress: 95 },
    rejected:                 { label: 'Rejected', color: 'bg-red-100 text-red-700', dot: 'bg-red-500', progress: 100 },
    credits_issued:           { label: 'Credits Issued', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', progress: 100 },
};

const PIPELINE_STEPS = [
    { label: 'Submitted',          statuses: ['submitted', 'pending', 'ai_checking', 'ai_flagged', 'pending_govt_assignment', 'pending_audit', 'under_review', 'awaiting_second_auditor', 'approved', 'pending_issuance', 'credits_issued'] },
    { label: 'AI Pre-screening',   statuses: ['pending_govt_assignment', 'pending_audit', 'under_review', 'awaiting_second_auditor', 'approved', 'pending_issuance', 'credits_issued'] },
    { label: 'Auditor Assigned',   statuses: ['pending_audit', 'under_review', 'awaiting_second_auditor', 'approved', 'pending_issuance', 'credits_issued'] },
    { label: 'Auditor Review',     statuses: ['approved', 'pending_issuance', 'credits_issued'] },
    { label: 'Credits Pending',    statuses: ['pending_issuance', 'credits_issued'] },
    { label: 'Credits Issued',     statuses: ['credits_issued'] },
];

export default function SubmissionTracker() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [detailData, setDetailData] = useState<any>(null);
    const [showResubmit, setShowResubmit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [trendData, setTrendData] = useState<any[]>([]);

    // Resubmit form state
    const [correctionNote, setCorrectionNote] = useState('');
    const [newQuantity, setNewQuantity] = useState('');
    const [newSource, setNewSource] = useState('');
    const [newNotes, setNewNotes] = useState('');
    const [isSubmittingResubmit, setIsSubmittingResubmit] = useState(false);

    const fetchSubmissions = async (selectId?: string) => {
        try {
            const res = await api.get('/emissions?limit=20');
            const data: any[] = res.data.data || [];
            setSubmissions(data);
            
            if (data.length > 0) {
                const toSelect = selectId ? data.find(s => s._id === selectId) : data[0];
                const activeSelection = toSelect || data[0];
                setSelected(activeSelection);
                fetchTimeline(activeSelection._id);
            }

            // Build trend from sorted entries
            const sorted = [...data].sort((a, b) => {
                if (a.periodYear !== b.periodYear) return a.periodYear - b.periodYear;
                return a.periodMonth - b.periodMonth;
            }).slice(-8);

            const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            setTrendData(sorted.map(e => ({
                q: `${monthNames[(e.periodMonth || 1) - 1]} ${String(e.periodYear).slice(2)}`,
                co2: e.quantityTonnes || 0
            })));
        } catch (err) {
            toast.error('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const fetchTimeline = async (id: string) => {
        setDetailLoading(true);
        try {
            const res = await api.get(`/emissions/${id}/timeline`);
            setDetailData(res.data.data);
            
            // Pre-populate resubmit form fields
            if (res.data.data?.emission) {
                const em = res.data.data.emission;
                setNewQuantity(em.quantityTonnes?.toString() || '');
                setNewSource(em.emissionSource || '');
                setNewNotes(em.notes || '');
            }
        } catch (err) {
            toast.error('Failed to load timeline details');
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleSelect = (sub: any) => {
        setSelected(sub);
        setShowResubmit(false);
        setCorrectionNote('');
        fetchTimeline(sub._id);
    };

    const handleResubmitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;

        setIsSubmittingResubmit(true);
        try {
            await api.patch(`/emissions/${selected._id}/resubmit`, {
                correctionNote,
                quantityTonnes: parseFloat(newQuantity),
                emissionSource: newSource,
                notes: newNotes
            });
            toast.success('Correction submitted successfully!');
            setShowResubmit(false);
            setCorrectionNote('');
            // Reload submission list and keep current selected active
            await fetchSubmissions(selected._id);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to submit correction');
        } finally {
            setIsSubmittingResubmit(false);
        }
    };

    if (loading) return <div className="py-12 text-center text-gray-400">Loading submissions...</div>;

    if (submissions.length === 0) return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
            <span className="material-symbols-outlined text-5xl text-gray-200 mb-3">cloud_upload</span>
            <h2 className="text-xl font-black text-gray-900 mb-1">No submissions yet</h2>
            <p className="text-gray-400 text-sm mb-4">Start by logging your first emission data</p>
            <Link to="/industry/emissions/new" className="bg-[#1A7A4A] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#14613B] transition-colors">Log Emissions →</Link>
        </div>
    );

    const cfg = selected ? (statusConfig[selected.status] ?? statusConfig.pending) : statusConfig.pending;

    const counts = {
        total: submissions.length,
        approved: submissions.filter(s => s.status === 'approved' || s.status === 'credits_issued').length,
        rejected: submissions.filter(s => s.status === 'rejected').length,
        pending: submissions.filter(s => !['approved', 'rejected', 'credits_issued'].includes(s.status)).length,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Submission Tracker</h1>
                <p className="text-gray-400 text-sm mt-1">Live status of your emission reports, review pipeline, and blockchain records</p>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Submissions', value: counts.total, icon: 'assignment', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Approved/Issued', value: counts.approved, icon: 'check_circle', color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Rejected', value: counts.rejected, icon: 'cancel', color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'In Progress', value: counts.pending, icon: 'schedule', color: 'text-amber-600', bg: 'bg-amber-50' },
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
                        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                        const periodLabel = `${monthNames[(s.periodMonth || 1) - 1]} ${s.periodYear}`;
                        return (
                            <div key={s._id} onClick={() => handleSelect(s)}
                                className={`bg-white rounded-2xl border p-5 cursor-pointer hover:shadow-md transition-all ${selected?._id === s._id ? 'border-[#1A7A4A] shadow-md' : 'border-gray-100'}`}>
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-black text-gray-900 text-sm">{s.emissionSource || 'Emission Report'}</p>
                                        <p className="text-xs text-gray-400">{periodLabel}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.color}`}>{c.label}</span>
                                </div>
                                <div className="mt-3">
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all ${s.status === 'rejected' ? 'bg-red-400' : s.status === 'approved' || s.status === 'credits_issued' ? 'bg-green-500' : 'bg-amber-400'}`}
                                            style={{ width: `${c.progress}%` }} />
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-xs text-gray-400">{(s.quantityTonnes || 0).toLocaleString()} tCO₂e</span>
                                        <span className="text-xs font-bold text-gray-600">{c.progress}%</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* CO2 trend chart */}
                    {trendData.length > 0 && (
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
                    )}
                </div>

                {/* Detail panel */}
                <div className="lg:col-span-2 space-y-6">
                    {detailLoading ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center py-12 text-gray-400">
                            Loading timeline & audit status...
                        </div>
                    ) : selected && detailData ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-gray-100">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900">{detailData.emission?.emissionSource || 'Emission Report'}</h2>
                                    <p className="text-sm text-gray-400 mt-0.5">
                                        Period: {detailData.emission?.periodMonth}/{detailData.emission?.periodYear} · Submitted: {new Date(detailData.emission?.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {['rejected', 'correction_requested'].includes(selected.status) && !showResubmit && (
                                        <button onClick={() => setShowResubmit(true)} className="flex items-center gap-2 bg-[#1A7A4A] text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#2E9E68] transition-colors">
                                            <span className="material-symbols-outlined text-sm">refresh</span> Modify & Resubmit
                                        </button>
                                    )}
                                    {(selected.status === 'pending_issuance' || selected.status === 'credits_issued') && (
                                        <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 font-bold text-sm px-4 py-2 rounded-xl">
                                            <span className="material-symbols-outlined text-sm">generating_tokens</span>
                                            {selected.status === 'credits_issued' ? 'Credits Issued!' : 'Credits Being Minted'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Resubmit form */}
                            {showResubmit && (
                                <form onSubmit={handleResubmitSubmit} className="border border-dashed border-[#1A7A4A]/30 rounded-xl p-5 bg-green-50/40 space-y-4">
                                    <p className="font-black text-gray-900 text-sm">Submit Correction / Revision</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Quantity (tCO₂e)</label>
                                            <input 
                                                type="number" 
                                                required
                                                value={newQuantity} 
                                                onChange={(e) => setNewQuantity(e.target.value)}
                                                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 bg-white" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Emission Source</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={newSource} 
                                                onChange={(e) => setNewSource(e.target.value)}
                                                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 bg-white" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">General Notes</label>
                                        <textarea 
                                            value={newNotes} 
                                            onChange={(e) => setNewNotes(e.target.value)}
                                            rows={2}
                                            className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 bg-white resize-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Correction Remarks for Auditor</label>
                                        <textarea 
                                            required
                                            value={correctionNote} 
                                            onChange={(e) => setCorrectionNote(e.target.value)}
                                            rows={2}
                                            placeholder="Explain what has been corrected..." 
                                            className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 bg-white resize-none" 
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <button 
                                            type="button"
                                            onClick={() => setShowResubmit(false)} 
                                            className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={isSubmittingResubmit}
                                            className="py-2 px-6 bg-[#1A7A4A] text-white font-bold text-sm rounded-xl hover:bg-[#2E9E68] transition-colors disabled:opacity-50"
                                        >
                                            {isSubmittingResubmit ? 'Submitting...' : 'Submit Revision'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Key metrics */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                    <p className="font-black text-lg text-slate-800">{(detailData.emission?.quantityTonnes || 0).toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">tCO₂e Reported</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                    <p className="font-black text-lg text-slate-800">{detailData.emission?.location || 'Not Specified'}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Location</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                    <p className="font-black text-lg text-slate-800">{detailData.emission?.auditType === 'dual' ? 'Dual' : 'Single'}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Audit Type</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                    <p className="font-black text-lg text-slate-800">{detailData.emission?.periodMonth}/{detailData.emission?.periodYear}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Period</p>
                                </div>
                            </div>

                            {/* Pipeline steps */}
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Review Pipeline</p>
                                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    {PIPELINE_STEPS.map((step, i) => {
                                        const done = step.statuses.includes(selected.status);
                                        return (
                                            <div key={i} className="flex md:flex-col items-center gap-3 md:gap-1 flex-1 relative w-full">
                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 flex-shrink-0 ${done ? 'bg-[#1A7A4A] border-[#1A7A4A] text-white shadow-sm' : 'bg-white border-gray-200 text-gray-300'}`}>
                                                    {done ? <span className="material-symbols-outlined text-sm font-bold">check</span> : <span className="text-xs font-bold">{i + 1}</span>}
                                                </div>
                                                <p className={`text-xs font-bold text-center ${done ? 'text-slate-800' : 'text-gray-400'}`}>{step.label}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* AI result if available */}
                            {detailData.aiResult && (
                                <div className={`rounded-xl p-5 border ${detailData.aiResult.riskFlag === 'RED' ? 'bg-red-50 border-red-200' : detailData.aiResult.riskFlag === 'YELLOW' ? 'bg-amber-50 border-amber-200' : 'bg-green-50/70 border-green-200'}`}>
                                    <div className="flex items-center justify-between border-b border-gray-200/50 pb-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
                                            <p className="font-bold text-sm text-gray-900">AI Pre-Screening Assessment</p>
                                        </div>
                                        <span className={`text-xs font-black px-2 py-1 rounded-full ${detailData.aiResult.riskFlag === 'RED' ? 'bg-red-100 text-red-700' : detailData.aiResult.riskFlag === 'YELLOW' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                            {detailData.aiResult.riskFlag} — {detailData.aiResult.riskScore}/100 Risk Score
                                        </span>
                                    </div>
                                    {detailData.aiResult.explanation && (
                                        <p className="text-xs text-gray-700 leading-relaxed">{detailData.aiResult.explanation}</p>
                                    )}
                                    {detailData.aiResult.expectedEmission && (
                                        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200/30 text-xs">
                                            <div>
                                                <p className="text-gray-400">Benchmark Expected</p>
                                                <p className="font-bold text-slate-700">{Math.round(detailData.aiResult.expectedEmission)} tCO₂e</p>
                                            </div>
                                            {detailData.aiResult.benchmarkDeviationPct && (
                                                <div>
                                                    <p className="text-gray-400">Deviation</p>
                                                    <p className={`font-bold ${Math.abs(detailData.aiResult.benchmarkDeviationPct) > 20 ? 'text-red-600' : 'text-slate-700'}`}>
                                                        {detailData.aiResult.benchmarkDeviationPct > 0 ? '+' : ''}{Math.round(detailData.aiResult.benchmarkDeviationPct)}%
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Rejection / Correction reason */}
                            {selected.status === 'rejected' && detailData.emission?.rejectionReason && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-red-500 text-sm">error</span>
                                        <p className="font-bold text-red-700 text-sm">Rejection Reason</p>
                                    </div>
                                    <p className="text-sm text-red-600">{detailData.emission.rejectionReason}</p>
                                </div>
                            )}

                            {selected.status === 'correction_requested' && detailData.auditSummary?.correctionRequired && (
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-orange-500 text-sm">warning</span>
                                        <p className="font-bold text-orange-700 text-sm">Correction Note from Auditor</p>
                                    </div>
                                    <p className="text-sm text-orange-800 font-semibold mb-2">{detailData.auditSummary.correctionRequired.correctionNote}</p>
                                    {detailData.auditSummary.correctionRequired.fieldsToFix?.length > 0 && (
                                        <div>
                                            <p className="text-xs text-orange-700 font-bold uppercase tracking-wider">Required Fields to Fix:</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {detailData.auditSummary.correctionRequired.fieldsToFix.map((f: string) => (
                                                    <span key={f} className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">{f}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Detailed Audit & Ledger History (Timeline) */}
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Audit Trail & Ledger Events</p>
                                <div className="border-l-2 border-slate-100 ml-4 pl-6 space-y-6">
                                    {detailData.timeline?.map((step: any, idx: number) => (
                                        <div key={idx} className="relative">
                                            {/* Dot / Icon */}
                                            <span className="absolute -left-10 top-0.5 bg-white p-1 rounded-full border border-slate-200 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-slate-500 text-[16px]">{step.icon || 'circle'}</span>
                                            </span>
                                            
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <p className="text-sm font-bold text-slate-800">{step.label}</p>
                                                    <span className="text-[10px] text-gray-400 font-mono">{new Date(step.at).toLocaleString()}</span>
                                                </div>
                                                <p className="text-xs text-slate-600">{step.detail}</p>
                                                
                                                {/* Blockchain cryptographic links */}
                                                {(step.txHash || step.dataHash) && (
                                                    <div className="flex flex-col gap-1 p-2 bg-slate-50 rounded-lg border border-slate-100 mt-1 font-mono text-[10px] text-slate-500">
                                                        {step.txHash && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-violet-600 font-bold">TX:</span>
                                                                <span className="truncate max-w-[200px] sm:max-w-xs">{step.txHash}</span>
                                                                <span className="material-symbols-outlined text-[10px] text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => { navigator.clipboard.writeText(step.txHash); toast.success('Copied Tx Hash'); }}>content_copy</span>
                                                            </div>
                                                        )}
                                                        {step.dataHash && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[#1A7A4A] font-bold">HASH:</span>
                                                                <span className="truncate max-w-[200px] sm:max-w-xs">{step.dataHash}</span>
                                                                <span className="material-symbols-outlined text-[10px] text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => { navigator.clipboard.writeText(step.dataHash); toast.success('Copied Data Hash'); }}>content_copy</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center py-12 text-gray-400">
                            Select a submission to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
