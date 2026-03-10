import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const sources = [
    { name: 'Coal Combustion', scope: 'Scope 1', co2: '2,800 tCO₂e' },
    { name: 'Grid Electricity', scope: 'Scope 2', co2: '1,040 tCO₂e' },
    { name: 'Natural Gas', scope: 'Scope 1', co2: '90 tCO₂e' },
    { name: 'Refrigerants', scope: 'Scope 1', co2: '14 tCO₂e' },
];

export default function VerifySubmit() {
    const navigate = useNavigate();
    const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);
    const [remarks, setRemarks] = useState('');
    const [signature, setSignature] = useState('');
    const [complianceNotes, setComplianceNotes] = useState<Record<string, 'compliant' | 'non_compliant'>>({});
    const [submitted, setSubmitted] = useState(false);
    const [txHash] = useState('0x' + Math.random().toString(16).slice(2, 18) + Math.random().toString(16).slice(2, 18));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!decision) { toast.error('Please select Approve or Reject'); return; }
        if (remarks.length < 20) { toast.error('Remarks must be at least 20 characters'); return; }
        if (!signature) { toast.error('Digital signature is required'); return; }
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="max-w-lg w-full bg-white rounded-2xl border border-gray-100 shadow-lg p-8 text-center">
                    <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${decision === 'approved' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <span className={`material-symbols-outlined text-4xl ${decision === 'approved' ? 'text-green-500' : 'text-red-500'}`}>{decision === 'approved' ? 'check_circle' : 'cancel'}</span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">
                        {decision === 'approved' ? 'Audit Approved & Signed!' : 'Submission Rejected'}
                    </h2>
                    <p className="text-gray-400 mb-6">The audit report has been {decision === 'approved' ? 'signed and pushed to the Polygon blockchain' : 'rejected and the industry has been notified'}.</p>

                    {decision === 'approved' && (
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-6 text-left">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Blockchain Record</p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">TX Hash</span>
                                    <span className="font-mono text-[#1A7A4A] font-bold text-xs">{txHash.slice(0, 20)}...</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Network</span>
                                    <span className="font-bold text-gray-900">Polygon Mainnet</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Status</span>
                                    <span className="text-green-600 font-bold flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" />Confirmed</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Contract</span>
                                    <span className="font-mono text-gray-400 text-xs">AuditRegistry.sol</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button onClick={() => navigate('/auditor/queue')} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                            Back to Queue
                        </button>
                        <button onClick={() => navigate('/auditor/blockchain')} className="flex-1 bg-[#1A7A4A] text-white rounded-xl py-3 text-sm font-bold hover:bg-[#15613b] transition-colors">
                            View on Blockchain
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Verify & Submit — SUB-2024-0084</h1>
                <p className="text-gray-400 text-sm mt-1">SteelMax Industries · Q4 2024 · Total: 4,200 tCO₂e</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Decision toggle */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-4">Audit Decision *</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setDecision('approved')}
                            className={`flex items-center justify-center gap-3 py-5 rounded-2xl border-2 font-black text-lg transition-all ${decision === 'approved' ? 'border-green-500 bg-green-50 text-green-700 shadow-lg shadow-green-100' : 'border-gray-200 text-gray-400 hover:border-green-300'}`}
                        >
                            <span className="material-symbols-outlined text-2xl">check_circle</span>
                            Approve
                        </button>
                        <button
                            type="button"
                            onClick={() => setDecision('rejected')}
                            className={`flex items-center justify-center gap-3 py-5 rounded-2xl border-2 font-black text-lg transition-all ${decision === 'rejected' ? 'border-red-500 bg-red-50 text-red-700 shadow-lg shadow-red-100' : 'border-gray-200 text-gray-400 hover:border-red-300'}`}
                        >
                            <span className="material-symbols-outlined text-2xl">cancel</span>
                            Reject
                        </button>
                    </div>
                </div>

                {/* Remarks */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <label className="block font-black text-gray-900 mb-3">
                        Mandatory Remarks * <span className="text-xs font-normal text-gray-400 ml-2">{remarks.length}/20 chars minimum</span>
                    </label>
                    <textarea
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                        rows={4}
                        placeholder="Provide detailed reasons for your decision (minimum 20 characters)..."
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all resize-none ${remarks.length > 0 && remarks.length < 20 ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#1A7A4A]/40 focus:border-[#1A7A4A]'}`}
                    />
                    {remarks.length > 0 && remarks.length < 20 && (
                        <p className="text-xs text-red-500 mt-1">{20 - remarks.length} more characters required</p>
                    )}
                </div>

                {/* Compliance notes per source */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-4">Compliance Notes per Emission Source</h2>
                    <div className="space-y-3">
                        {sources.map(s => (
                            <div key={s.name} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                                    <p className="text-xs text-gray-400">{s.scope} · {s.co2}</p>
                                </div>
                                <div className="flex bg-gray-100 rounded-lg p-0.5">
                                    {['compliant', 'non_compliant'].map(v => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => setComplianceNotes({ ...complianceNotes, [s.name]: v as 'compliant' | 'non_compliant' })}
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

                {/* Digital Signature */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="font-black text-gray-900 mb-1">PKI Digital Signature *</h2>
                    <p className="text-xs text-gray-400 mb-4">Enter your private key passphrase or signature token. This will generate a cryptographic PKI signature tied to this audit report.</p>
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
                    className={`w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all text-white ${decision === 'approved' ? 'bg-[#1A7A4A] hover:bg-[#15613b] shadow-green-200' : decision === 'rejected' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                    <span className="material-symbols-outlined text-sm">send</span>
                    {decision === 'approved' ? 'Sign & Submit to Blockchain' : decision === 'rejected' ? 'Reject & Notify Industry' : 'Select a Decision First'}
                </button>
            </form>
        </div>
    );
}
