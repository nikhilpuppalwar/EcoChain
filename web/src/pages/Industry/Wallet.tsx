import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useCarbonCredit } from '../../hooks/useCarbonCredit';
import toast from 'react-hot-toast';
import { useWaitForTransactionReceipt } from 'wagmi';

export default function Wallet() {
    const { user } = useAuthStore();
    const { address, isConnected, chain } = useAccount();
    const { balance, refetchBalance, retireCredits, isRetiring } = useCarbonCredit();

    // UI State
    const [retireAmount, setRetireAmount] = useState('');
    const [retireReason, setRetireReason] = useState('');
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

    const { isLoading: isTxWaiting, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Mock Transaction History
    const [transactions, setTransactions] = useState([
        { id: '0x1a2b...3c4d', date: '2024-03-15', type: 'Purchase', amount: 100, status: 'Confirmed', from: 'SolarFarm India Ltd', to: 'Your Wallet' },
        { id: '0x5e6f...7g8h', date: '2024-02-28', type: 'Retirement', amount: 50, status: 'Confirmed', from: 'Your Wallet', to: 'Null Address' },
        { id: '0x9i0j...1k2l', date: '2024-01-10', type: 'Purchase', amount: 450, status: 'Confirmed', from: 'AgriCorp Co.', to: 'Your Wallet' },
    ]);

    useEffect(() => {
        if (isTxSuccess && txHash) {
            toast.success(
                <div>
                    Transaction confirmed!{' '}
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
            refetchBalance();
            setRetireAmount('');
            setRetireReason('');
        }
    }, [isTxSuccess, refetchBalance, txHash]);

    const handleRetire = async (e: React.FormEvent) => {
        e.preventDefault();

        const amountToRetire = parseInt(retireAmount);
        if (isNaN(amountToRetire) || amountToRetire <= 0 || amountToRetire > balance) {
            toast.error("Invalid amount to retire");
            return;
        }

        try {
            const hash = await retireCredits(amountToRetire);
            setTxHash(hash);
            toast.success("Transaction submitted. Waiting for confirmation...");

            // Add Optimistic Transaction
            setTransactions([
                {
                    id: `${hash.slice(0, 6)}...${hash.slice(-4)}`,
                    date: new Date().toISOString().split('T')[0],
                    type: 'Retirement',
                    amount: amountToRetire,
                    status: 'Pending',
                    from: 'Your Wallet',
                    to: 'Null Address (Burned)'
                },
                ...transactions
            ]);

        } catch (error: any) {
            console.error(error);
            toast.error(error?.shortMessage || "Transaction failed or rejected");
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">Web3 Carbon Wallet</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your cryptographic carbon credits (CCR) and execute on-chain retirements.</p>
                </div>
                {!isConnected ? (
                    <ConnectButton />
                ) : (
                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm font-mono text-slate-600">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                        <div className="h-4 w-px bg-slate-200 mx-2"></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{chain?.name || 'Unknown Network'}</span>
                    </div>
                )}
            </div>

            {/* Wallet Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-[#0a192f] p-8 text-white relative overflow-hidden flex-1">
                        {/* Decorative background pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                                        <polygon points="24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2" fill="none" stroke="#ffffff" strokeWidth="1" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#hexagons)" />
                            </svg>
                        </div>

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <h3 className="text-white/60 font-medium uppercase tracking-widest text-xs mb-1">Available Balance</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-bold font-syne tracking-tight">
                                        {isConnected ? balance.toLocaleString() : '---'}
                                    </span>
                                    <span className="text-xl font-bold text-[#2E9E68]">CCR</span>
                                </div>
                                <p className="text-white/40 text-sm mt-2">1 CCR = 1 Metric Ton CO₂e</p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <h3 className="text-white/60 font-medium uppercase tracking-widest text-xs mb-3">Asset Contract</h3>
                                <div className="bg-black/30 p-3 rounded-lg flex items-center justify-between">
                                    <span className="font-mono text-sm text-white/80">0xe7f1...0512</span>
                                    <button className="text-white/40 hover:text-white transition-colors" title="Copy Address" onClick={() => {
                                        navigator.clipboard.writeText("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
                                        toast.success("Contract address copied!");
                                    }}>
                                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Retirement Form directly attached to wallet card */}
                    <div className="bg-slate-50 p-6 border-t border-slate-200 relative">
                        {!isConnected && (
                            <div className="absolute inset-0 z-10 bg-slate-50/80 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
                                <p className="text-sm font-bold text-slate-500">Connect wallet to enable credit retirement.</p>
                            </div>
                        )}
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500">local_fire_department</span>
                            Retire Credits
                        </h3>
                        <form onSubmit={handleRetire} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Amount to Retire</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max={balance}
                                        value={retireAmount}
                                        onChange={(e) => setRetireAmount(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg py-2 pl-3 pr-12 focus:outline-none focus:border-[#1A7A4A] focus:ring-1 focus:ring-[#1A7A4A]"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">CCR</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Reason (On-Chain Metadata)</label>
                                <select
                                    required
                                    value={retireReason}
                                    onChange={(e) => setRetireReason(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:border-[#1A7A4A] focus:ring-1 focus:ring-[#1A7A4A] text-sm text-slate-700 bg-white"
                                >
                                    <option value="" disabled>Select reason...</option>
                                    <option value="annual_compliance">Annual Compliance (2024)</option>
                                    <option value="net_zero_pledge">Voluntary Net-Zero Pledge</option>
                                    <option value="event_offset">Specific Event Offset</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={isRetiring || isTxWaiting || !isConnected || !retireAmount || !retireReason}
                                className={`w-full py-2.5 rounded-lg font-bold text-sm text-white shadow-sm transition-all flex items-center justify-center gap-2
                                    ${isRetiring || isTxWaiting || !isConnected || !retireAmount || !retireReason
                                        ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                                        : 'bg-red-600 hover:bg-red-700 active:scale-[0.98]'}`}
                            >
                                {isRetiring || isTxWaiting ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                                        {isTxWaiting ? 'Confirming block...' : 'Sign in wallet...'}
                                    </>
                                ) : (
                                    <>Permanently Retire</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
                    <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                        <h3 className="font-bold text-lg font-syne text-slate-800">Transaction History</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <span className="material-symbols-outlined text-[16px]">filter_list</span>
                            Filter
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-0">
                        {!isConnected ? (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                                <span className="material-symbols-outlined text-5xl mb-4 text-slate-300">link_off</span>
                                <p>Connect your wallet to view transaction history.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white sticky top-0 border-b border-slate-200 shadow-[0_1px_0_0_#e2e8f0]">
                                    <tr className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                                        <th className="px-6 py-4">Transaction hash</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {transactions.map((tx, index) => (
                                        <tr key={index} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <a href="#" className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline">{tx.id}</a>
                                                    <span className="material-symbols-outlined text-[14px] text-slate-300 group-hover:text-slate-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer" title="View on Etherscan">open_in_new</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                                                    ${tx.type === 'Purchase' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}
                                                `}>
                                                    <span className="material-symbols-outlined text-[14px]">
                                                        {tx.type === 'Purchase' ? 'south_west' : 'local_fire_department'}
                                                    </span>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold font-syne text-lg ${tx.type === 'Purchase' ? 'text-[#1A7A4A]' : 'text-slate-700'}`}>
                                                    {tx.type === 'Purchase' ? '+' : '-'}{tx.amount}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                                                {tx.date}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-4">
                <span className="material-symbols-outlined text-blue-500 mt-0.5">info</span>
                <div>
                    <h4 className="font-bold text-blue-900 text-sm">Understanding Retirement</h4>
                    <p className="text-sm text-blue-800 mt-1">
                        When you retire a Carbon Credit Token (CCR), it is permanently burned and removed from circulation. This action is recorded immutably on the blockchain as proof of your organization's carbon offset, allowing you to legally claim the environmental benefit against your emission targets.
                    </p>
                </div>
            </div>
        </div>
    );
}
