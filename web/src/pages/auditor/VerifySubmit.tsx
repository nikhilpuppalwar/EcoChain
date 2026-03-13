import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const docCategories = [
    { key: 'fuelInvoices', label: 'Fuel Invoices', count: 3, icon: 'local_gas_station' },
    { key: 'electricityBills', label: 'Electricity Bills', count: 2, icon: 'electric_bolt' },
    { key: 'transportRecords', label: 'Transport Records', count: 1, icon: 'local_shipping' },
    { key: 'wasteCerts', label: 'Waste Certificates', count: 2, icon: 'delete' },
    { key: 'productionReports', label: 'Production Reports', count: 1, icon: 'factory' },
];

const correctionFields = [
    'Fuel Consumption data',
    'Electricity Usage data',
    'Vehicle Emissions data',
    'Logistics & Transport data',
    'Waste Generation data',
    'Production Output data',
    'Supporting Documents',
];

const emissionSources = [
    { name: 'Fuel Combustion', scope: 'Scope 1', co2: '2,963.0 tCO₂e' },
    { name: 'Electricity Usage', scope: 'Scope 2', co2: '229.6 tCO₂e' },
    { name: 'Vehicle Emissions', scope: 'Scope 1', co2: '14.0 tCO₂e' },
    { name: 'Logistics / Transport', scope: 'Scope 3', co2: '5.7 tCO₂e' },
    { name: 'Waste Generation', scope: 'Scope 3', co2: '0.4 tCO₂e' },
];

// Simulated dual audit: this auditor is Auditor 2
const coAuditorDecision = {
    name: 'Dr. Sarah Jenkins',
    org: 'GreenVerify Partners LLP',
    decision: 'approved',
    remarks: 'Fuel invoices match submitted quantities. Electricity data consistent with production scale. Minor anomaly in Scope 3 logistics but within acceptable range.',
    signedAt: '2026-03-07 14:32 UTC',
};

export default function VerifySubmit() {
    const navigate = useNavigate();

    // Checklist state
    const [checklist, setChecklist] = useState<Record<string, boolean>>({});
    const [viewedDocs, setViewedDocs] = useState<Set<string>>(new Set());

    // Decision
    const [decision, setDecision] = useState<'approved' | 'rejected' | 'correction' | null>(null);
    const [remarks, setRemarks] = useState('');
    const [complianceNotes, setComplianceNotes] = useState<Record<string, 'compliant' | 'non_compliant'>>({});

    // Correction
    const [correctionFields_sel, setCorrectionFields] = useState<Set<string>>(new Set());
    const [correctionNote, setCorrectionNote] = useState('');

    // Signature
    const [signature, setSignature] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const [txHash] = useState('0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));
    const [reportHash] = useState(Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));

    const allChecked = docCategories.every(d => checklist[d.key]);
    const allDocsVerified = allChecked;

    const toggleCorrectionField = (f: string) => {
        const next = new Set(correctionFields_sel);
        next.has(f) ? next.delete(f) : next.add(f);
        setCorrectionFields(next);
    };

    const handleViewDoc = (key: string) => {
        setViewedDocs(prev => new Set([...prev, key]));
        toast.success('Document opened');
    };

    const handleCheck = (key: string, val: boolean) => {
        if (val && !viewedDocs.has(key)) {
            toast('You haven\'t opened these documents yet', { icon: '⚠️' });
        }
        setChecklist(prev => ({ ...prev, [key]: val }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!allDocsVerified) { toast.error('Complete the document verification checklist first'); return; }
        if (!decision) { toast.error('You must select Approve, Reject, or Request Correction'); return; }
        if (remarks.length < 20) { toast.error('Remarks must be at least 20 characters'); return; }
        if (decision === 'correction') {
            if (correctionFields_sel.size === 0) { toast.error('Select at least one field requiring correction'); return; }
            if (correctionNote.length < 30) { toast.error('Correction instructions must be at least 30 characters'); return; }
        }
        if (!signature) { toast.error('Digital signature is required'); return; }
        setSubmitted(true);
    };

    if (showPreview) {
        return (
            <div className="max-w-3xl mx-auto space-y-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-black text-gray-900">BRSR Report Preview</h1>
                    <button onClick={() => setShowPreview(false)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                        ← Back to Decision
                    </button>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6 font-mono text-sm">
                    <div className="text-center border-b pb-6">
                        <div className="w-12 h-12 bg-[#1A7A4A] rounded-xl mx-auto flex items-center justify-center mb-3">
                            <span className="material-symbols-outlined text-white">eco</span>
                        </div>
                        <h2 className="text-xl font-black text-gray-900 font-sans">BRSR Sustainability Report</h2>
                        <p className="text-gray-600 mt-1">Company: SteelMax Industries</p>
                        <p className="text-gray-600">CIN: IND-2024-4421 · Reporting Period: Q4 2024</p>
                        <p className="text-gray-400 text-xs mt-1">Generated: 2026-03-13</p>
                    </div>
                    <div>
                        <p className="font-black text-gray-900 font-sans mb-2">Section A — General Disclosures</p>
                        <p className="text-gray-600">SteelMax Industries operates in the Steel Manufacturing sector. This report covers Q4 2024 (October–December). The company employs 1,200 personnel across 2 facilities.</p>
                    </div>
                    <div>
                        <p className="font-black text-gray-900 font-sans mb-2">Section C — Principle 6: Environment</p>
                        <div className="bg-gray-50 border rounded-xl p-4 grid grid-cols-2 gap-3">
                            <div><p className="text-gray-500 text-xs">Scope 1</p><p className="font-black text-gray-900">2,963.0 tCO₂e</p></div>
                            <div><p className="text-gray-500 text-xs">Scope 2</p><p className="font-black text-gray-900">229.6 tCO₂e</p></div>
                            <div><p className="text-gray-500 text-xs">Scope 3</p><p className="font-black text-gray-900">6.1 tCO₂e</p></div>
                            <div><p className="text-gray-500 text-xs">Total</p><p className="font-black text-[#1A7A4A] text-lg">3,198.7 tCO₂e</p></div>
                        </div>
                    </div>
                    <div>
                        <p className="font-black text-gray-900 font-sans mb-2">AI Verification</p>
                        <p className="text-gray-600">Risk Score: 72/100 — <span className="text-red-600 font-bold">🔴 RED FLAG</span></p>
                        <p className="text-gray-600 text-xs mt-1">Anomaly: Emission-to-production ratio +16.4% above expected range. Fuel consumption +19.2% above range.</p>
                    </div>
                    <div>
                        <p className="font-black text-gray-900 font-sans mb-2">Auditor Verification</p>
                        <p className="text-gray-600">Decision: <span className="font-bold capitalize">{decision || '[Pending]'}</span></p>
                        <p className="text-gray-600 text-xs mt-1">Remarks: {remarks || '[Not yet entered]'}</p>
                    </div>
                    <div className="border-t pt-4">
                        <p className="font-black text-gray-900 font-sans mb-2">Digital Signature</p>
                        <p className="text-gray-400 text-xs">[Signature will appear here after signing]</p>
                    </div>
                    <div className="border-t pt-4">
                        <p className="font-black text-gray-900 font-sans mb-2">Blockchain Record</p>
                        <p className="text-gray-400 text-xs">[TX Hash will appear after blockchain submission]</p>
                    </div>
                </div>
                <button className="w-full border border-gray-200 rounded-xl py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">download</span>
                    Download Preview PDF (Draft)
                </button>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="max-w-lg w-full bg-white rounded-2xl border border-gray-100 shadow-lg p-8 text-center">
                    <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${decision === 'approved' ? 'bg-green-100' : decision === 'correction' ? 'bg-orange-100' : 'bg-red-100'}`}>
                        <span className={`material-symbols-outlined text-4xl ${decision === 'approved' ? 'text-green-500' : decision === 'correction' ? 'text-orange-500' : 'text-red-500'}`}>
                            {decision === 'approved' ? 'verified' : decision === 'correction' ? 'assignment_return' : 'cancel'}
                        </span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">
                        {decision === 'approved' ? '✅ Report Submitted Successfully' : decision === 'correction' ? '✏️ Correction Requested' : '❌ Submission Rejected'}
                    </h2>
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-500">Decision:</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${decision === 'approved' ? 'bg-green-100 text-green-700' : decision === 'correction' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                            {decision?.toUpperCase()}
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-6">SteelMax Industries · Q4 2024</p>

                    {decision === 'approved' && (
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-6 text-left space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Blockchain Record</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">TX Hash</span>
                                    <span className="font-mono text-[#1A7A4A] font-bold text-xs">{txHash.slice(0, 20)}...</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Report Hash (SHA-256)</span>
                                    <span className="font-mono text-gray-600 text-xs">{reportHash.slice(0, 16)}...</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Network</span>
                                    <span className="font-bold text-gray-900">Polygon Amoy Testnet</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Status</span>
                                    <span className="text-green-600 font-bold flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full inline-block" />Confirmed</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Verification Status</span>
                                    <span className="font-bold text-gray-900">DUAL_VERIFIED</span>
                                </div>
                            </div>
                            <a
                                href={`https://amoy.polygonscan.com/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full mt-2 text-xs font-bold text-[#1A7A4A] border border-[#1A7A4A] rounded-lg py-2 hover:bg-green-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                View on Polygonscan ↗
                            </a>
                        </div>
                    )}

                    <p className="text-xs text-gray-400 mb-4">
                        Anyone can verify this report hash on-chain
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => navigate('/auditor/queue')} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                            Back to Queue
                        </button>
                        <button onClick={() => navigate('/auditor/blockchain')} className="flex-1 bg-[#1A7A4A] text-white rounded-xl py-3 text-sm font-bold hover:bg-[#15613b] transition-colors">
                            View Blockchain Records
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Verify & Submit — SUB-2024-0084</h1>
                    <p className="text-gray-400 text-sm mt-1">SteelMax Industries · Q4 2024 · Risk Score: 72/100 🔴</p>
                </div>
                <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                    <span className="material-symbols-outlined text-sm">preview</span>
                    Preview Report
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Co-auditor decision (dual audit) */}
                <div className="bg-purple-50 rounded-2xl border border-purple-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-purple-600">group</span>
                        <h2 className="font-black text-purple-900">Auditor 1 Decision (Primary Auditor)</h2>
                    </div>
                    <div className="text-sm space-y-1.5">
                        <p><span className="text-purple-500 font-medium">Auditor:</span> <strong className="text-purple-900">{coAuditorDecision.name}</strong> — {coAuditorDecision.org}</p>
                        <p className="flex items-center gap-2">
                            <span className="text-purple-500 font-medium">Decision:</span>
                            <span className="font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-md">{coAuditorDecision.decision.toUpperCase()}</span>
                        </p>
                        <p className="text-purple-800 bg-white/60 rounded-xl p-3 mt-2 italic text-xs">
                            "{coAuditorDecision.remarks}"
                        </p>
                        <p className="text-xs text-purple-400">Signed at: {coAuditorDecision.signedAt}</p>
                    </div>
                    <p className="text-xs text-purple-600 mt-3 font-bold">Your decision as Auditor 2 will be recorded below ↓</p>
                </div>

                {/* Document Checklist */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-1">Physical Document Verification *</h2>
                    <p className="text-xs text-gray-400 mb-4">You must verify each document category before submitting your decision.</p>
                    <div className="space-y-3">
                        {docCategories.map(cat => {
                            const isChecked = !!checklist[cat.key];
                            const wasViewed = viewedDocs.has(cat.key);
                            return (
                                <div key={cat.key} className={`flex items-center justify-between py-3 px-4 rounded-xl border transition-all ${isChecked ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                                        <div
                                            onClick={() => handleCheck(cat.key, !isChecked)}
                                            className={`w-5 h-5 rounded flex items-center justify-center border-2 cursor-pointer transition-all ${isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white hover:border-gray-400'}`}
                                        >
                                            {isChecked && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                                <span className="material-symbols-outlined text-gray-400 text-sm">{cat.icon}</span>
                                                {cat.label}
                                                <span className="text-xs text-gray-400 font-normal">({cat.count} {cat.count === 1 ? 'file' : 'files'})</span>
                                            </span>
                                            {isChecked && !wasViewed && <p className="text-xs text-amber-600 mt-0.5">⚠️ You haven't opened these documents yet</p>}
                                        </div>
                                    </label>
                                    <button type="button" onClick={() => handleViewDoc(cat.key)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${wasViewed ? 'text-green-700 bg-green-100' : 'text-[#1A7A4A] bg-white border border-gray-200 hover:bg-gray-50'}`}>
                                        {wasViewed ? '✓ Viewed' : 'View Docs'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    {!allDocsVerified && (
                        <p className="text-xs text-amber-600 font-bold mt-3 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            Complete all checkboxes to enable submission
                        </p>
                    )}
                    {allDocsVerified && (
                        <p className="text-xs text-green-600 font-bold mt-3 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            All documents verified — decision section unlocked
                        </p>
                    )}
                </div>

                {/* Decision Toggle */}
                <div className={`bg-white rounded-2xl border ${!allDocsVerified ? 'border-gray-100 opacity-60 pointer-events-none' : 'border-gray-100'} p-6 shadow-sm`}>
                    <h2 className="font-black text-gray-900 mb-4">Your Decision *</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { val: 'approved', icon: 'check_circle', label: 'Approve', sub: 'Data verified, within limits', active: 'border-green-500 bg-green-50 text-green-700 shadow-lg shadow-green-100', hover: 'hover:border-green-300' },
                            { val: 'correction', icon: 'assignment_return', label: 'Request Correction', sub: 'Specific fields need fix', active: 'border-orange-500 bg-orange-50 text-orange-700 shadow-lg shadow-orange-100', hover: 'hover:border-orange-300' },
                            { val: 'rejected', icon: 'cancel', label: 'Reject', sub: 'Data invalid or unverifiable', active: 'border-red-500 bg-red-50 text-red-700 shadow-lg shadow-red-100', hover: 'hover:border-red-300' },
                        ].map(d => (
                            <button
                                key={d.val}
                                type="button"
                                onClick={() => setDecision(d.val as typeof decision)}
                                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 font-black transition-all ${decision === d.val ? d.active : `border-gray-200 text-gray-400 ${d.hover}`}`}
                            >
                                <span className="material-symbols-outlined text-3xl">{d.icon}</span>
                                <span>{d.label}</span>
                                <span className="text-xs font-normal opacity-70">{d.sub}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Correction Request */}
                {decision === 'correction' && (
                    <div className="bg-orange-50 rounded-2xl border border-orange-100 p-6 shadow-sm">
                        <h2 className="font-black text-orange-900 mb-3">Fields Requiring Correction *</h2>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {correctionFields.map(f => (
                                <label key={f} className="flex items-center gap-2 cursor-pointer">
                                    <div
                                        onClick={() => toggleCorrectionField(f)}
                                        className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${correctionFields_sel.has(f) ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}
                                    >
                                        {correctionFields_sel.has(f) && <span className="material-symbols-outlined text-white text-[10px]">check</span>}
                                    </div>
                                    <span className="text-sm text-gray-700">{f}</span>
                                </label>
                            ))}
                        </div>
                        <label className="block font-bold text-orange-800 text-sm mb-2">
                            Correction Instructions * <span className="font-normal text-gray-400">{correctionNote.length}/30 chars minimum</span>
                        </label>
                        <textarea
                            value={correctionNote}
                            onChange={e => setCorrectionNote(e.target.value)}
                            rows={3}
                            placeholder="Explain exactly what needs to be corrected and how (minimum 30 characters)..."
                            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none transition-all ${correctionNote.length > 0 && correctionNote.length < 30 ? 'border-red-300 focus:ring-red-200' : 'border-orange-200 focus:ring-orange-200'}`}
                        />
                    </div>
                )}

                {/* Remarks */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <label className="block font-black text-gray-900 mb-3">
                        Mandatory Remarks * <span className="text-xs font-normal text-gray-400 ml-2">{remarks.length}/20 chars minimum</span>
                    </label>
                    <textarea
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                        rows={4}
                        placeholder="Provide detailed remarks about your verification findings (minimum 20 characters)..."
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all resize-none ${remarks.length > 0 && remarks.length < 20 ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#1A7A4A]/40 focus:border-[#1A7A4A]'}`}
                    />
                    {remarks.length > 0 && remarks.length < 20 && (
                        <p className="text-xs text-red-500 mt-1">{20 - remarks.length} more characters required</p>
                    )}
                </div>

                {/* Compliance Notes per Source */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-4">Compliance Assessment per Emission Source</h2>
                    <div className="space-y-3">
                        {emissionSources.map(s => (
                            <div key={s.name} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                                    <p className="text-xs text-gray-400">{s.scope} · {s.co2}</p>
                                </div>
                                <div className="flex bg-gray-100 rounded-lg p-0.5">
                                    {(['compliant', 'non_compliant'] as const).map(v => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => setComplianceNotes({ ...complianceNotes, [s.name]: v })}
                                            className={`px-3 py-1.5 rounded-md text-xs font-black transition-all ${complianceNotes[s.name] === v ? v === 'compliant' ? 'bg-green-500 text-white shadow-sm' : 'bg-red-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
                                        >
                                            {v === 'compliant' ? '✓ Compliant' : '✗ Non-Compliant'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PKI Digital Signature */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-1">🔐 Apply Digital Signature *</h2>
                    <p className="text-xs text-gray-400 mb-4">Your signature will be cryptographically bound to this specific report and stored permanently on the Polygon blockchain. This action is non-repudiable.</p>
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4 text-sm space-y-1">
                        <p className="text-gray-600">Signing as: <strong>Dr. Jane Smith</strong></p>
                        <p className="text-gray-600">Certificate: <span className="font-mono text-xs">ISO-14064-2024-AUD · Exp: April 10, 2026</span></p>
                        {signature && <p className="text-gray-600">Report hash: <span className="font-mono text-xs text-[#1A7A4A]">{reportHash.slice(0, 16)}...</span></p>}
                    </div>
                    <input
                        type="password"
                        value={signature}
                        onChange={e => setSignature(e.target.value)}
                        placeholder="Enter your signing passphrase..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 focus:border-[#1A7A4A] transition-all font-mono"
                    />
                    {signature && (
                        <p className="mt-2 text-xs text-green-600 font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            Signature ready — will be hashed with SHA-256 on submit
                        </p>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className={`w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all text-white ${
                        decision === 'approved' ? 'bg-[#1A7A4A] hover:bg-[#15613b] shadow-green-200' :
                        decision === 'correction' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200' :
                        decision === 'rejected' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' :
                        'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                    <span className="material-symbols-outlined text-sm">send</span>
                    {decision === 'approved' ? 'Sign & Submit to Blockchain' :
                     decision === 'correction' ? 'Send Back for Correction' :
                     decision === 'rejected' ? 'Reject & Notify Industry' :
                     'Select a Decision First'}
                </button>
            </form>
        </div>
    );
}
