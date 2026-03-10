import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCarbonCredit } from '../../hooks/useCarbonCredit';
import toast from 'react-hot-toast';
import { useWaitForTransactionReceipt } from 'wagmi';

export default function IssueCredits() {
    const { user } = useAuthStore();
    const { issueCredits, isIssuing } = useCarbonCredit();

    // UI State
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

    const { isLoading: isTxWaiting, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Mock Data
    const [requests, setRequests] = useState([
        { id: 'ISS-8812', company: 'SolarFarm India Ltd', project: 'Rajasthan 100MW Solar', type: 'Renewable Energy', requestedAmount: 5000, status: 'Pending Review', submittedDate: '2024-03-21', complianceScore: 98, documentsVerified: true, targetAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' },
        { id: 'ISS-8810', company: 'AgriCorp Co.', project: 'Punjab Soil Sequestration', type: 'Agriculture', requestedAmount: 1200, status: 'Pending Review', submittedDate: '2024-03-19', complianceScore: 92, documentsVerified: true, targetAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' },
        { id: 'ISS-8805', company: 'EcoTech Innovations', project: 'Direct Air Capture Pilot', type: 'Technology', requestedAmount: 300, status: 'Needs Info', submittedDate: '2024-03-15', complianceScore: 75, documentsVerified: false, targetAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906' },
    ]);

    useEffect(() => {
        if (isTxSuccess && selectedRequest && txHash) {
            toast.success(
                <div>
                    Credits minted and issued successfully!{' '}
                    <a
                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-bold"
                    >
                        View on Etherscan
                    </a>
                </div>,
                { duration: 5000 }
            );
            setRequests(requests.filter(r => r.id !== selectedRequest.id));
            setSelectedRequest(null);
            setTxHash(undefined);
        }
    }, [isTxSuccess, txHash]);

    const handleIssue = async (id: string) => {
        if (!selectedRequest) return;

        try {
            const hash = await issueCredits(selectedRequest.targetAddress, selectedRequest.requestedAmount);
            setTxHash(hash);
            toast.success("Transaction submitted. Waiting for confirmation...");
        } catch (error: any) {
            console.error(error);
            toast.error(error?.shortMessage || "Minting transaction failed");
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">Issue Carbon Credits</h1>
                    <p className="text-sm text-slate-500 mt-1">Review verified emission reduction projects and mint CCR tokens to their wallets.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Requests List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600">playlist_add_check</span>
                        Pending Issuance Requests
                    </h3>

                    {requests.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 border-dashed p-12 text-center text-slate-500">
                            <span className="material-symbols-outlined text-4xl mb-4 text-slate-300">task_alt</span>
                            <p>All clear! No pending issuance requests at this time.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {requests.map((req) => (
                                <div
                                    key={req.id}
                                    onClick={() => setSelectedRequest(req)}
                                    className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${selectedRequest?.id === req.id ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm' : 'border-slate-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{req.id}</span>
                                            <h4 className="font-bold text-slate-800">{req.company}</h4>
                                        </div>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider
                                            ${req.status === 'Pending Review' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}
                                        `}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3">{req.project}</p>
                                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="flex items-center gap-1 text-slate-500">
                                                <span className="material-symbols-outlined text-[14px]">category</span>
                                                {req.type}
                                            </span>
                                            <span className="flex items-center gap-1 text-slate-500">
                                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                {req.submittedDate}
                                            </span>
                                        </div>
                                        <div className="font-bold text-[#1A7A4A]">
                                            +{req.requestedAmount.toLocaleString()} CCR
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Issuance Action Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-6 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-lg font-syne text-slate-800">Action Panel</h3>
                        </div>

                        {selectedRequest ? (
                            <div className="p-5 flex flex-col h-full">
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target Wallet</p>
                                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100 font-mono text-sm text-slate-600 break-all">
                                            {selectedRequest.targetAddress}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount</p>
                                            <p className="text-xl font-bold text-[#1A7A4A]">{selectedRequest.requestedAmount}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Type</p>
                                            <p className="text-sm font-bold text-slate-700 truncate">{selectedRequest.type}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mt-6">
                                        <div className="flex items-center justify-between p-2 rounded bg-green-50/50 border border-green-100">
                                            <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-green-600 text-[18px]">verified</span>
                                                Auditor Verification
                                            </span>
                                            <span className="text-xs font-bold text-green-700">Passed</span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-green-50/50 border border-green-100">
                                            <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-green-600 text-[18px]">verified_user</span>
                                                KYC/AML Checks
                                            </span>
                                            <span className="text-xs font-bold text-green-700">Passed</span>
                                        </div>
                                        <div className={`flex items-center justify-between p-2 rounded border ${selectedRequest.documentsVerified ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'
                                            }`}>
                                            <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px] text-slate-400">description</span>
                                                Project Documents
                                            </span>
                                            <span className={`text-xs font-bold ${selectedRequest.documentsVerified ? 'text-green-700' : 'text-red-600'}`}>
                                                {selectedRequest.documentsVerified ? 'Verified' : 'Incomplete'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3 shrink-0">
                                    <button
                                        onClick={() => handleIssue(selectedRequest.id)}
                                        disabled={isIssuing || isTxWaiting || !selectedRequest.documentsVerified}
                                        className={`w-full py-3 rounded-lg font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2
                                            ${isIssuing || isTxWaiting || !selectedRequest.documentsVerified
                                                ? 'bg-slate-300 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}
                                    >
                                        {isIssuing || isTxWaiting ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                                                {isTxWaiting ? 'Waiting for Block...' : 'Confirming in Wallet...'}
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-[18px]">generating_tokens</span>
                                                Mint & Issue Credits
                                            </>
                                        )}
                                    </button>
                                    {!selectedRequest.documentsVerified && (
                                        <p className="text-xs text-center text-red-500 font-medium">Cannot issue: Documents incomplete.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[300px]">
                                <span className="material-symbols-outlined text-5xl mb-3 text-slate-200">touch_app</span>
                                <p className="text-sm">Select a request from the list to view details and issue credits.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
