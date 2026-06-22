import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Submission {
    _id: string;
    company: { _id: string; name: string; sector: string };
    periodMonth: number;
    periodYear: number;
    quantityTonnes: number;
    status: string;
    createdAt: string;
    aiResult?: {
        riskScore: number;
        riskFlag: 'GREEN' | 'YELLOW' | 'RED';
        anomalyDetails?: any;
    } | null;
}

interface Auditor {
    _id: string;
    name: string;
    organization: string;
    specializations: string[];
    activeAssignmentCount: number;
    certExpiryTimestamp?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const flagColor = (flag?: string) => {
    if (flag === 'RED')    return { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300',    badge: 'bg-red-500 text-white' };
    if (flag === 'YELLOW') return { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-300',  badge: 'bg-amber-400 text-white' };
    if (flag === 'GREEN')  return { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300',  badge: 'bg-green-600 text-white' };
    return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', badge: 'bg-slate-200 text-slate-700' };
};

const diffDays = (timestamp?: number) => {
    if (!timestamp) return 999;
    return Math.ceil((timestamp - Date.now()) / (1000 * 60 * 60 * 24));
};

// ─── Assignment Modal ────────────────────────────────────────────────────────
function AssignmentModal({ submission, availableAuditors, onClose, onAssigned }: {
    submission: Submission;
    availableAuditors: Auditor[];
    onClose: () => void;
    onAssigned: () => void;
}) {
    const isHighRisk = submission.aiResult?.riskFlag === 'RED' || (submission.aiResult?.riskScore || 0) > 60;
    const recommendedType = isHighRisk ? 'dual' : 'single';
    
    const [auditType, setAuditType] = useState<'single' | 'dual'>(recommendedType);
    const [primaryAuditorId, setPrimaryAuditorId] = useState<string>('');
    const [secondaryAuditorId, setSecondaryAuditorId] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    // Filter available auditors for secondary dropdown (cannot be same as primary)
    const secondaryOptions = availableAuditors.filter(a => a._id !== primaryAuditorId);
    
    // Suggest picking different organizations
    const primaryOrg = availableAuditors.find(a => a._id === primaryAuditorId)?.organization;

    const handleAssign = async () => {
        if (!primaryAuditorId) {
            toast.error('Please select a primary auditor');
            return;
        }
        if (auditType === 'dual' && !secondaryAuditorId) {
            toast.error('Please select a secondary auditor for dual audit');
            return;
        }

        const auditorIds = auditType === 'dual' ? [primaryAuditorId, secondaryAuditorId] : [primaryAuditorId];

        setSubmitting(true);
        try {
            await api.post('/audit/assign', {
                submissionId: submission._id,
                auditorIds,
                auditType,
                notes: 'Assigned via Government Portal'
            });
            toast.success(`Assigned to ${auditorIds.length} auditor(s) successfully`);
            onAssigned();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Assignment failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRandomAssign = () => {
        if (availableAuditors.length === 0) {
            toast.error('No auditors available');
            return;
        }
        
        // Smart assign: prefer our fast-login demo auditors if they exist in the DB
        // Based on your database, the names are literally "auditor" and "secondary".
        const isAuditor1 = (a: Auditor) => {
            const n = a.name.toLowerCase();
            return n === 'auditor' || n.includes('elena') || n.includes('aud1') || n.includes('auditor 1');
        };
        const isAuditor2 = (a: Auditor) => {
            const n = a.name.toLowerCase();
            return n === 'secondary' || n.includes('chen') || n.includes('aud2') || n.includes('auditor 2');
        };

        let primary = availableAuditors.find(isAuditor1);
        if (!primary) {
            primary = availableAuditors[Math.floor(Math.random() * availableAuditors.length)];
        }
        setPrimaryAuditorId(primary._id);
        
        if (auditType === 'dual') {
            let secondaryPool = availableAuditors.filter(a => a._id !== primary!._id);
            if (secondaryPool.length > 0) {
                let secondary = secondaryPool.find(isAuditor2);
                if (!secondary) {
                    secondary = secondaryPool[Math.floor(Math.random() * secondaryPool.length)];
                }
                setSecondaryAuditorId(secondary._id);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold font-syne text-slate-800">Assign Auditor</h2>
                        <p className="text-sm text-slate-500 mt-1">{submission.company.name} • {submission.periodMonth}/{submission.periodYear}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* AI Context */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">AI Recommendation</div>
                            {isHighRisk ? (
                                <div className="text-sm font-bold text-red-600 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">warning</span> Dual Audit Recommended
                                </div>
                            ) : (
                                <div className="text-sm font-bold text-green-600 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span> Single Audit Sufficient
                                </div>
                            )}
                        </div>
                        {submission.aiResult && (
                            <div className="text-right">
                                <div className="text-xs text-slate-500">Risk Score</div>
                                <div className={`font-bold ${flagColor(submission.aiResult.riskFlag).text}`}>{submission.aiResult.riskScore}/100</div>
                            </div>
                        )}
                    </div>

                    {/* Audit Type Toggle */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Audit Type</label>
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button
                                onClick={() => setAuditType('single')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-colors ${auditType === 'single' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <span className="material-symbols-outlined text-[18px]">person</span> Single
                            </button>
                            <button
                                onClick={() => setAuditType('dual')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-colors ${auditType === 'dual' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <span className="material-symbols-outlined text-[18px]">group</span> Dual
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-slate-700">Select Auditor(s)</label>
                        <button onClick={handleRandomAssign} className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">casino</span> Randomly Assign
                        </button>
                    </div>

                    {/* Dropdowns */}
                    <div className="space-y-4">
                        <div>
                            <select
                                value={primaryAuditorId}
                                onChange={e => setPrimaryAuditorId(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3"
                            >
                                <option value="">-- Choose Primary Auditor --</option>
                                {availableAuditors.map(a => (
                                    <option key={a._id} value={a._id}>
                                        {a.name} ({a.organization}) — Load: {a.activeAssignmentCount} active
                                    </option>
                                ))}
                            </select>
                        </div>

                        {auditType === 'dual' && (
                            <div className="relative">
                                <select
                                    value={secondaryAuditorId}
                                    onChange={e => setSecondaryAuditorId(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3"
                                >
                                    <option value="">-- Choose Secondary Auditor --</option>
                                    {secondaryOptions.map(a => {
                                        const isSameOrg = a.organization === primaryOrg;
                                        return (
                                            <option key={a._id} value={a._id}>
                                                {a.name} ({a.organization}) {isSameOrg ? '⚠️ Same Org' : '✓ Diff Org'} — Load: {a.activeAssignmentCount} active
                                            </option>
                                        );
                                    })}
                                </select>
                                {secondaryAuditorId && secondaryOptions.find(a => a._id === secondaryAuditorId)?.organization === primaryOrg && (
                                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">warning</span>
                                        It is recommended to pick a secondary auditor from a different organization to prevent bias.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800">Cancel</button>
                    <button
                        onClick={handleAssign}
                        disabled={submitting}
                        className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                        {submitting && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                        Confirm Assignment
                    </button>
                </div>
            </div>
        </div>
    );
}


// ─── Main Page ───────────────────────────────────────────────────────────────
export default function GovAuditorAssignment() {
    const [queue, setQueue] = useState<Submission[]>([]);
    const [auditors, setAuditors] = useState<Auditor[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigningSubmission, setAssigningSubmission] = useState<Submission | null>(null);

    const fetchQueue = useCallback(async () => {
        try {
            const res = await api.get('/audit/pending-assignment');
            // If API returns data, use it (even if empty, because empty queue is a valid state)
            const data = res.data.data;
            if (data) {
                 setQueue(data);
            } else {
                 setQueue(MOCK_ASSIGNMENTS);
            }
        } catch (error) {
            toast.error('Failed to load assignment queue, using demo data');
            setQueue(MOCK_ASSIGNMENTS);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleOpenAssignModal = async (submission: Submission) => {
        toast.loading('Fetching available auditors...', { id: 'auditors' });
        try {
            const res = await api.get(`/audit/available?excludeIndustryId=${submission.company._id}`);
            const data = res.data.data || [];
            if (data.length === 0) {
                toast.error('No available auditors found. All auditors may be assigned to this industry already.', { id: 'auditors' });
                return;
            }
            setAuditors(data);
            setAssigningSubmission(submission);
            toast.dismiss('auditors');
        } catch (error) {
            toast.error('Failed to fetch available auditors. Please try again.', { id: 'auditors' });
        }
    };

    const handleAssigned = () => {
        setAssigningSubmission(null);
        fetchQueue();
    };

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    const daysWaiting = (createdAt: string) => {
        return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">Auditor Assignment Queue</h1>
                    <p className="text-sm text-slate-500 mt-1">Assign verified auditors to emission submissions that have passed AI checks</p>
                </div>
                <button onClick={fetchQueue} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="material-symbols-outlined">refresh</span>
                    Refresh Queue
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">assignment_ind</span>
                        Pending Assignments
                        <span className="ml-2 bg-blue-100 text-blue-700 py-0.5 px-2.5 rounded-full text-xs">{queue.length}</span>
                    </h2>
                </div>

                {loading ? (
                    <div className="py-16 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl animate-spin mb-3 block">progress_activity</span>
                        Loading queue...
                    </div>
                ) : queue.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                        <span className="material-symbols-outlined text-5xl mb-3 block text-slate-200">check_circle</span>
                        <p className="font-medium text-slate-600">Great job! The queue is empty.</p>
                        <p className="text-sm mt-1">All submissions have been assigned to auditors.</p>
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
                                    <th className="px-6 py-3">Waiting</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {queue.map(sub => {
                                    const c = flagColor(sub.aiResult?.riskFlag);
                                    const waiting = daysWaiting(sub.createdAt);
                                    return (
                                        <tr key={sub._id} className={`hover:bg-slate-50 transition-colors ${sub.aiResult?.riskFlag === 'RED' ? 'bg-red-50/20 hover:bg-red-50/50' : ''}`}>
                                            <td className="px-6 py-4 border-l-4 border-transparent" style={{ borderColor: sub.aiResult?.riskFlag === 'RED' ? '#ef4444' : 'transparent' }}>
                                                <div className="font-bold text-slate-800 text-sm">{sub.company?.name || 'Unknown Industry'}</div>
                                                <div className="text-xs text-slate-400">{sub.company?.sector || 'Unknown Sector'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {sub.periodMonth}/{sub.periodYear}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                                {sub.quantityTonnes?.toLocaleString()} tCO₂e
                                            </td>
                                            <td className="px-6 py-4">
                                                {sub.aiResult ? (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${c.badge}`}>
                                                        {sub.aiResult.riskFlag === 'RED' ? '🔴' : sub.aiResult.riskFlag === 'YELLOW' ? '🟡' : '🟢'} {sub.aiResult.riskScore}/100
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">No AI Data</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`text-sm font-bold ${waiting > 3 ? 'text-red-600' : 'text-slate-700'}`}>
                                                    {waiting === 0 ? 'Today' : `${waiting} day${waiting > 1 ? 's' : ''}`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleOpenAssignModal(sub)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                                                >
                                                    Assign <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
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

            {assigningSubmission && (
                <AssignmentModal
                    submission={assigningSubmission}
                    availableAuditors={auditors}
                    onClose={() => setAssigningSubmission(null)}
                    onAssigned={handleAssigned}
                />
            )}
        </div>
    );
}

// ─── Mock data (fallback when API is not available/empty) ──────────────────────
const MOCK_ASSIGNMENTS: Submission[] = [
    {
        _id: 'sub1', company: { _id: 'ind1', name: 'Nexus Manufacturing', sector: 'Manufacturing' },
        periodMonth: 1, periodYear: 2024, quantityTonnes: 5200, status: 'pending_govt_assignment', createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        aiResult: { riskScore: 78, riskFlag: 'RED', anomalyDetails: {} }
    },
    {
        _id: 'sub2', company: { _id: 'ind2', name: 'TechFusion Inc', sector: 'Technology' },
        periodMonth: 3, periodYear: 2024, quantityTonnes: 820, status: 'pending_govt_assignment', createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        aiResult: { riskScore: 38, riskFlag: 'YELLOW', anomalyDetails: {} }
    },
    {
        _id: 'sub3', company: { _id: 'ind3', name: 'Global Logistics Corp', sector: 'Logistics' },
        periodMonth: 3, periodYear: 2024, quantityTonnes: 1450, status: 'pending_govt_assignment', createdAt: new Date().toISOString(),
        aiResult: { riskScore: 12, riskFlag: 'GREEN', anomalyDetails: {} }
    }
];

const MOCK_AUDITORS: Auditor[] = [
    { _id: 'aud1', name: 'Elena Rostova', organization: 'GreenVerify Auth', specializations: ['Manufacturing', 'Energy'], activeAssignmentCount: 3 },
    { _id: 'aud2', name: 'Dr. Samuel Chen', organization: 'EcoAudit Partners', specializations: ['Technology', 'Logistics'], activeAssignmentCount: 1 },
    { _id: 'aud3', name: 'Priya Sharma', organization: 'GreenVerify Auth', specializations: ['Chemical', 'Manufacturing'], activeAssignmentCount: 0 },
    { _id: 'aud4', name: 'James Wilson', organization: 'Global Compliance Co', specializations: ['Logistics', 'Energy'], activeAssignmentCount: 5 }
];
