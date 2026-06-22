import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────
interface AnomalyReport {
    _id: string;
    submission: { _id: string; periodMonth: number; periodYear: number; quantityTonnes: number; emissionSource: string; status: string; createdAt: string };
    company: { name: string; sector: string };
    finalRiskScore: number;
    riskFlag: 'GREEN' | 'YELLOW' | 'RED';
    isFlagged: boolean;
    anomalyScore: number;
    satelliteScore: number;
    benchmarkScore: number;
    anomalyResult: 'NORMAL' | 'ANOMALY';
    benchmarkDeviationPct: number;
    expectedEmission: number;
    smokeDetected: boolean | null;
    explanation: string;
    governmentReviewStatus: 'pending' | 'reviewed' | 'escalated';
    checkedAt: string;
    retriggerCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const flagColor = (flag: string) => {
    if (flag === 'RED')    return { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300',    dot: 'bg-red-500',    badge: 'bg-red-500 text-white' };
    if (flag === 'YELLOW') return { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-300',  dot: 'bg-amber-400',  badge: 'bg-amber-400 text-white' };
    return                        { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300',  dot: 'bg-green-500',  badge: 'bg-green-600 text-white' };
};

const flagIcon = (flag: string) => flag === 'RED' ? '🔴' : flag === 'YELLOW' ? '🟡' : '🟢';

const ScoreBar = ({ label, score, weight, max = 100 }: { label: string; score: number; weight: number; max?: number }) => {
    const pct = Math.min((score / max) * 100, 100);
    const barColor = score > 60 ? 'bg-red-500' : score > 25 ? 'bg-amber-400' : 'bg-green-500';
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">{label} <span className="text-slate-400 font-normal">({weight}% weight)</span></span>
                <span className="font-bold text-slate-800">{score} pts</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

const RiskGauge = ({ score, flag }: { score: number; flag: string }) => {
    const colors = flagColor(flag);
    return (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${colors.bg} ${colors.border}`}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-inner border-2 border-opacity-30 ${colors.text}`} style={{ background: 'rgba(255,255,255,0.6)' }}>
                {score}
            </div>
            <div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Final Risk Score</div>
                <div className={`text-2xl font-black font-syne ${colors.text}`}>{flagIcon(flag)} {flag} FLAG</div>
            </div>
        </div>
    );
};

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function AnomalyDetailPanel({ report, onClose, onRetrigger, onMarkReviewed, onEscalate }: {
    report: AnomalyReport;
    onClose: () => void;
    onRetrigger: (report: AnomalyReport) => void;
    onMarkReviewed: (report: AnomalyReport) => void;
    onEscalate: (report: AnomalyReport) => void;
}) {
    const colors = flagColor(report.riskFlag);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className={`p-6 rounded-t-2xl border-b ${colors.bg} ${colors.border}`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold font-syne text-slate-900">{report.company?.name}</h2>
                            <p className="text-sm text-slate-600 mt-0.5">{report.company?.sector} Sector • {report.submission?.periodMonth}/{report.submission?.periodYear}</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="mt-4">
                        <RiskGauge score={report.finalRiskScore} flag={report.riskFlag} />
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Score Breakdown */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Score Breakdown</h3>
                        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <ScoreBar label="Emission Anomaly (IsolationForest)" score={report.anomalyScore} weight={50} />
                            <ScoreBar label="Satellite Smoke Detection" score={report.satelliteScore} weight={30} max={40} />
                            <ScoreBar label="Sector Benchmark Deviation" score={report.benchmarkScore} weight={20} max={50} />
                            <div className="border-t border-slate-200 pt-3 text-xs space-y-1">
                                <div className="flex justify-between"><span className="text-slate-500">IsolationForest Result</span><span className={`font-bold px-2 py-0.5 rounded ${report.anomalyResult === 'ANOMALY' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{report.anomalyResult}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Smoke Detected</span><span className="font-bold text-slate-700">{report.smokeDetected === true ? '🚨 YES' : report.smokeDetected === false ? '✅ NO' : '⚪ Not checked'}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Benchmark Deviation</span><span className={`font-bold ${report.benchmarkDeviationPct > 20 ? 'text-red-600' : 'text-green-600'}`}>{report.benchmarkDeviationPct > 0 ? '+' : ''}{report.benchmarkDeviationPct}% vs {report.company?.sector} avg</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Expected Emission</span><span className="font-bold text-slate-700">{report.expectedEmission?.toLocaleString()} tCO₂e</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Actual Emission</span><span className="font-bold text-slate-700">{report.submission?.quantityTonnes?.toLocaleString()} tCO₂e</span></div>
                            </div>
                        </div>
                    </div>

                    {/* AI Explanation */}
                    <div className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">AI Explanation</h3>
                        <p className="text-sm text-slate-700 leading-relaxed">"{report.explanation}"</p>
                    </div>

                    {/* Re-trigger info */}
                    {report.retriggerCount > 0 && (
                        <div className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                            ↺ AI has been re-triggered {report.retriggerCount} time{report.retriggerCount > 1 ? 's' : ''} on this submission.
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl grid grid-cols-3 gap-3">
                    <button
                        onClick={() => onRetrigger(report)}
                        className="py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 text-xs flex flex-col items-center gap-1 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                        Re-run AI
                    </button>
                    <button
                        onClick={() => onEscalate(report)}
                        disabled={report.governmentReviewStatus === 'escalated'}
                        className="py-2.5 bg-white border border-amber-200 text-amber-700 font-bold rounded-xl hover:bg-amber-50 text-xs flex flex-col items-center gap-1 transition-colors disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[18px]">report</span>
                        {report.governmentReviewStatus === 'escalated' ? 'Escalated' : 'Escalate'}
                    </button>
                    <button
                        onClick={() => onMarkReviewed(report)}
                        disabled={report.governmentReviewStatus === 'reviewed'}
                        className="py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 text-xs flex flex-col items-center gap-1 transition-colors disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        {report.governmentReviewStatus === 'reviewed' ? 'Reviewed ✓' : 'Mark Reviewed'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GovAIVerifier() {
    const [activeTab, setActiveTab] = useState<'verifier' | 'anomaly'>('verifier');
    const [reports, setReports] = useState<AnomalyReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<AnomalyReport | null>(null);
    const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'reviewed' | 'escalated'>('all');
    const [repeatOffenders, setRepeatOffenders] = useState<any[]>([]);

    const fetchReports = useCallback(async () => {
        try {
            const res = await api.get('/ai/all');
            const data = res.data.data || [];
            setReports(data);
        } catch (err) {
            console.error('Failed to fetch AI reports:', err);
            // Ignore mock fallback, show empty or handle error gracefully
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRepeatOffenders = useCallback(async () => {
        try {
            const res = await api.get('/ai/repeat-offenders');
            setRepeatOffenders(res.data.data || []);
        } catch { /* silently ignore */ }
    }, []);

    useEffect(() => {
        fetchReports();
        fetchRepeatOffenders();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchReports, 30000);
        return () => clearInterval(interval);
    }, [fetchReports, fetchRepeatOffenders]);

    // ── Actions ──────────────────────────────────────────────
    const handleRetrigger = async (report: AnomalyReport) => {
        toast.loading('Re-running AI check...', { id: 'retrigger' });
        try {
            await api.post(`/ai/trigger-check/${report.submission._id}`);
            toast.success('AI re-check complete. Results updated.', { id: 'retrigger' });
            fetchReports();
            setSelectedReport(null);
        } catch {
            toast.error('AI check failed. Service may be offline.', { id: 'retrigger' });
        }
    };

    const handleMarkReviewed = async (report: AnomalyReport) => {
        try {
            await api.patch(`/ai/anomaly/${report._id}/review`, { status: 'reviewed', notes: 'Reviewed by government agent' });
            toast.success('Marked as reviewed');
            fetchReports();
            setSelectedReport(null);
        } catch {
            toast.error('Failed to update review status');
        }
    };

    const handleEscalate = async (report: AnomalyReport) => {
        try {
            await api.patch(`/ai/anomaly/${report._id}/review`, { status: 'escalated', notes: 'Escalated for further investigation' });
            toast.success('Report escalated to admin');
            fetchReports();
            setSelectedReport(null);
        } catch {
            toast.error('Failed to escalate report');
        }
    };

    // ── Filtered lists ───────────────────────────────────────
    const liveSubmissions = reports.slice(0, 10);  // latest 10

    const flaggedReports = reports.filter(r => {
        if (!r.isFlagged) return false;
        const riskOk = riskFilter === 'all' ||
            (riskFilter === 'high'   && r.riskFlag === 'RED') ||
            (riskFilter === 'medium' && r.riskFlag === 'YELLOW') ||
            (riskFilter === 'low'    && r.riskFlag === 'GREEN');
        const revOk = reviewFilter === 'all' || r.governmentReviewStatus === reviewFilter;
        return riskOk && revOk;
    });

    const statsRow = [
        { label: 'Total Checked', value: reports.length, icon: 'analytics', color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'RED Flags', value: reports.filter(r => r.riskFlag === 'RED').length, icon: 'warning', color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'YELLOW Flags', value: reports.filter(r => r.riskFlag === 'YELLOW').length, icon: 'error', color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Pending Review', value: reports.filter(r => r.governmentReviewStatus === 'pending' && r.isFlagged).length, icon: 'pending', color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">AI Verifier & Anomaly Monitor</h1>
                    <p className="text-sm text-slate-500 mt-1">Real-time AI analysis of emission submissions using IsolationForest + Smoke Detection + Sector Benchmarks</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    {(['verifier', 'anomaly'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors capitalize ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab === 'verifier' ? '🤖 AI Verifier' : '🚨 Anomaly Monitor'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statsRow.map(s => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-slate-100 flex items-center gap-3`}>
                        <span className={`material-symbols-outlined text-2xl ${s.color}`}>{s.icon}</span>
                        <div>
                            <div className={`text-2xl font-black font-syne ${s.color}`}>{s.value}</div>
                            <div className="text-xs text-slate-500 font-medium">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ─── AI VERIFIER TAB ─────────────────────────────────── */}
            {activeTab === 'verifier' && (
                <div className="space-y-6">
                    {/* Live Feed */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <h2 className="font-bold text-slate-800">Live Submission Feed</h2>
                            </div>
                            <button onClick={fetchReports} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">refresh</span> Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div className="py-16 text-center text-slate-400">
                                <span className="material-symbols-outlined text-4xl animate-spin mb-3 block">progress_activity</span>
                                Loading AI results...
                            </div>
                        ) : liveSubmissions.length === 0 ? (
                            <div className="py-16 text-center text-slate-400">
                                <span className="material-symbols-outlined text-5xl mb-3 block text-slate-200">psychology</span>
                                <p className="font-medium">No submissions checked yet.</p>
                                <p className="text-xs mt-1">AI results appear here when industries submit emission reports.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3">Industry</th>
                                            <th className="px-6 py-3">Period</th>
                                            <th className="px-6 py-3">Emissions</th>
                                            <th className="px-6 py-3">AI Flag</th>
                                            <th className="px-6 py-3">Risk Score</th>
                                            <th className="px-6 py-3">Checked</th>
                                            <th className="px-6 py-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {liveSubmissions.map(report => {
                                            const c = flagColor(report.riskFlag);
                                            return (
                                                <tr
                                                    key={report._id}
                                                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${report.riskFlag === 'RED' ? 'bg-red-50/30' : ''}`}
                                                    onClick={() => setSelectedReport(report)}
                                                >
                                                    <td className="px-6 py-3">
                                                        <div className="font-bold text-slate-800 text-sm">{report.company?.name}</div>
                                                        <div className="text-xs text-slate-400">{report.company?.sector}</div>
                                                    </td>
                                                    <td className="px-6 py-3 text-sm text-slate-600">
                                                        {report.submission?.periodMonth}/{report.submission?.periodYear}
                                                    </td>
                                                    <td className="px-6 py-3 text-sm font-bold text-slate-800">
                                                        {report.submission?.quantityTonnes?.toLocaleString()} tCO₂e
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${c.badge}`}>
                                                            {flagIcon(report.riskFlag)} {report.riskFlag}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                                                            <span className="font-bold text-slate-800">{report.finalRiskScore}/100</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-xs text-slate-400">
                                                        {new Date(report.checkedAt).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <button
                                                            onClick={e => { e.stopPropagation(); handleRetrigger(report); }}
                                                            className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">refresh</span>
                                                            Re-run
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* AI How it Works */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white">
                        <h3 className="font-bold font-syne text-lg mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-400">psychology</span>
                            AI Risk Score Formula
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {[
                                { icon: 'scatter_plot', label: 'IsolationForest', weight: '50%', detail: '100 pts if anomaly, 0 if normal', color: 'text-blue-400' },
                                { icon: 'satellite', label: 'Smoke Detection', weight: '30%', detail: '40 pts if smoke, 5 pts if clear', color: 'text-purple-400' },
                                { icon: 'leaderboard', label: 'Sector Benchmark', weight: '20%', detail: '5/25/50 pts based on deviation', color: 'text-green-400' },
                            ].map(m => (
                                <div key={m.label} className="bg-white/10 rounded-lg p-4 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`material-symbols-outlined ${m.color}`}>{m.icon}</span>
                                        <span className="font-bold">{m.label}</span>
                                        <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">{m.weight}</span>
                                    </div>
                                    <p className="text-slate-300 text-xs">{m.detail}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-xs text-slate-400 flex gap-4">
                            <span className="text-green-400 font-bold">🟢 GREEN &lt; 25</span>
                            <span className="text-amber-400 font-bold">🟡 YELLOW 25–60</span>
                            <span className="text-red-400 font-bold">🔴 RED &gt; 60</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── ANOMALY MONITOR TAB ─────────────────────────────── */}
            {activeTab === 'anomaly' && (
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            {(['all', 'high', 'medium', 'low'] as const).map(f => (
                                <button key={f} onClick={() => setRiskFilter(f)}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors capitalize ${riskFilter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    {f === 'all' ? 'All Risk' : f === 'high' ? '🔴 High' : f === 'medium' ? '🟡 Medium' : '🟢 Low'}
                                </button>
                            ))}
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            {(['all', 'pending', 'reviewed', 'escalated'] as const).map(f => (
                                <button key={f} onClick={() => setReviewFilter(f)}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors capitalize ${reviewFilter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    {f}
                                </button>
                            ))}
                        </div>
                        <span className="text-xs text-slate-400 ml-auto">{flaggedReports.length} flagged submission{flaggedReports.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Flagged Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-500">warning</span>
                                Flagged Submissions
                            </h2>
                        </div>

                        {flaggedReports.length === 0 ? (
                            <div className="py-16 text-center text-slate-400">
                                <span className="material-symbols-outlined text-5xl mb-3 block text-slate-200">shield_with_heart</span>
                                <p className="font-medium">No flagged submissions matching filter.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3">Industry</th>
                                            <th className="px-6 py-3">Period</th>
                                            <th className="px-6 py-3">Risk Score</th>
                                            <th className="px-6 py-3">Anomaly Type</th>
                                            <th className="px-6 py-3">Flagged On</th>
                                            <th className="px-6 py-3">Review Status</th>
                                            <th className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {flaggedReports.map(report => {
                                            const c = flagColor(report.riskFlag);
                                            const reviewBadge =
                                                report.governmentReviewStatus === 'reviewed'  ? 'bg-green-100 text-green-700' :
                                                report.governmentReviewStatus === 'escalated' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-500';
                                            return (
                                                <tr key={report._id} className={`hover:bg-slate-50 transition-colors ${report.riskFlag === 'RED' ? 'bg-red-50/20' : ''}`}>
                                                    <td className="px-6 py-3">
                                                        <div className="font-bold text-slate-800 text-sm">{report.company?.name}</div>
                                                        <div className="text-xs text-slate-400">{report.company?.sector}</div>
                                                    </td>
                                                    <td className="px-6 py-3 text-sm text-slate-600">{report.submission?.periodMonth}/{report.submission?.periodYear}</td>
                                                    <td className="px-6 py-3">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${c.badge}`}>
                                                            {flagIcon(report.riskFlag)} {report.finalRiskScore}/100
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-xs text-slate-600 max-w-[200px] truncate">{report.anomalyResult === 'ANOMALY' ? '⚡ Emission Outlier' : '📊 Benchmark Exceeded'}</td>
                                                    <td className="px-6 py-3 text-xs text-slate-400">{new Date(report.checkedAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${reviewBadge}`}>
                                                            {report.governmentReviewStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setSelectedReport(report)}
                                                                className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                                                            >View Details</button>
                                                            <button
                                                                onClick={() => handleMarkReviewed(report)}
                                                                disabled={report.governmentReviewStatus === 'reviewed'}
                                                                className="text-xs text-green-600 hover:text-green-800 font-bold disabled:opacity-40"
                                                            >✓ Review</button>
                                                            <button
                                                                onClick={() => handleEscalate(report)}
                                                                disabled={report.governmentReviewStatus === 'escalated'}
                                                                className="text-xs text-amber-600 hover:text-amber-800 font-bold disabled:opacity-40"
                                                            >↑ Escalate</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Repeat Offenders */}
                    {repeatOffenders.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-red-100 bg-red-50/50 flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-500">repeat</span>
                                <h2 className="font-bold text-slate-800">Repeat Offenders</h2>
                                <span className="ml-auto text-xs text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded-full">Flagged 2+ times in last 4 periods</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {repeatOffenders.map((o, i) => (
                                    <div key={i} className="px-6 py-4 flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-slate-800">{o.company?.name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-400">{o.company?.sector} • Flagged {o.count} times</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-red-600">Max Risk: {o.maxRiskScore}/100</div>
                                            <div className="text-xs text-slate-400">Last: {new Date(o.lastFlagDate).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Detail Modal */}
            {selectedReport && (
                <AnomalyDetailPanel
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    onRetrigger={handleRetrigger}
                    onMarkReviewed={handleMarkReviewed}
                    onEscalate={handleEscalate}
                />
            )}
        </div>
    );
}

// ─── Mock data (fallback when API is not available) ───────────────────────────
const MOCK_REPORTS: AnomalyReport[] = [
    {
        _id: 'm1', company: { name: 'Nexus Manufacturing', sector: 'Manufacturing' },
        submission: { _id: 's1', periodMonth: 1, periodYear: 2024, quantityTonnes: 5200, emissionSource: 'Fuel Combustion', status: 'ai_flagged', createdAt: new Date().toISOString() },
        finalRiskScore: 78, riskFlag: 'RED', isFlagged: true,
        anomalyScore: 100, satelliteScore: 40, benchmarkScore: 25,
        anomalyResult: 'ANOMALY', benchmarkDeviationPct: 34.5, expectedEmission: 3867, smokeDetected: true,
        explanation: 'AI detected abnormal emission patterns (IsolationForest flagged as outlier). Smoke detected in imagery. Emissions 34.5% above Manufacturing sector benchmark.',
        governmentReviewStatus: 'pending', checkedAt: new Date().toISOString(), retriggerCount: 0
    },
    {
        _id: 'm2', company: { name: 'TechFusion Inc', sector: 'Technology' },
        submission: { _id: 's2', periodMonth: 3, periodYear: 2024, quantityTonnes: 820, emissionSource: 'Electricity + Transport', status: 'pending_govt_assignment', createdAt: new Date().toISOString() },
        finalRiskScore: 38, riskFlag: 'YELLOW', isFlagged: true,
        anomalyScore: 0, satelliteScore: 5, benchmarkScore: 50,
        anomalyResult: 'NORMAL', benchmarkDeviationPct: 62, expectedEmission: 505, smokeDetected: false,
        explanation: 'Emissions are 62% above sector benchmark for technology.',
        governmentReviewStatus: 'pending', checkedAt: new Date(Date.now() - 3600000).toISOString(), retriggerCount: 0
    },
    {
        _id: 'm3', company: { name: 'Global Logistics Corp', sector: 'Logistics' },
        submission: { _id: 's3', periodMonth: 3, periodYear: 2024, quantityTonnes: 1450, emissionSource: 'Fleet Transport', status: 'pending_govt_assignment', createdAt: new Date().toISOString() },
        finalRiskScore: 12, riskFlag: 'GREEN', isFlagged: false,
        anomalyScore: 0, satelliteScore: 5, benchmarkScore: 5,
        anomalyResult: 'NORMAL', benchmarkDeviationPct: 5.2, expectedEmission: 1378, smokeDetected: null,
        explanation: 'All indicators within normal range.',
        governmentReviewStatus: 'reviewed', checkedAt: new Date(Date.now() - 7200000).toISOString(), retriggerCount: 0
    }
];
