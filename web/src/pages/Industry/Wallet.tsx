import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAccount, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useCarbonCredit } from '../../hooks/useCarbonCredit';
import { useMarketplace } from '../../hooks/useMarketplace';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function Wallet() {
    const { user } = useAuthStore();
    const { address, isConnected, chain } = useAccount();
    const switchChain = useSwitchChain();
    const { balance, refetchBalance, retireCredits, isRetiring, transferTokens, isTransferring, isWrongChain, supportedChainId } = useCarbonCredit();
    const { listCredits, isListing } = useMarketplace();

    // UI State
    const [activeAction, setActiveAction] = useState<'retire' | 'transfer' | 'sell'>('retire');
    const [retireAmount, setRetireAmount] = useState('');
    const [retireReason, setRetireReason] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferRecipient, setTransferRecipient] = useState('');
    const [sellAmount, setSellAmount] = useState('');
    const [sellPrice, setSellPrice] = useState('');
    const [sellDuration, setSellDuration] = useState('30');
    const [isSelling, setIsSelling] = useState(false);
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
            const explorerUrl = chain?.id === 11155111 ? `https://sepolia.etherscan.io/tx/${txHash}` : null;
            toast.success(
                <div>
                    Transaction confirmed!
                    {explorerUrl ? (
                        <a href={explorerUrl} target="_blank" rel="noreferrer" className="underline font-bold ml-1">View on Etherscan</a>
                    ) : (
                        <span className="ml-1 font-mono text-xs">Tx: {txHash.slice(0, 10)}...</span>
                    )}
                </div>,
                { duration: 5000 }
            );
            refetchBalance();
            setRetireAmount('');
            setRetireReason('');
        }
    }, [isTxSuccess, refetchBalance, txHash, chain?.id]);

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
            toast.error(error?.shortMessage || error?.message || "Transaction failed or rejected");
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        const amountToTransfer = parseInt(transferAmount);
        if (isNaN(amountToTransfer) || amountToTransfer <= 0 || amountToTransfer > balance) {
            toast.error("Invalid amount to transfer");
            return;
        }
        if (!transferRecipient.startsWith('0x') || transferRecipient.length !== 42) {
            toast.error("Invalid recipient address (must be 0x)");
            return;
        }

        try {
            const hash = await transferTokens(transferRecipient, amountToTransfer);
            setTxHash(hash);
            toast.success("Blockchain transfer submitted. Confirming...");

            await api.post('/credits/transfer', {
                recipientAddress: transferRecipient,
                amount: amountToTransfer,
                onChainTxHash: hash
            });

            setTransactions([
                {
                    id: `${hash.slice(0, 6)}...${hash.slice(-4)}`,
                    date: new Date().toISOString().split('T')[0],
                    type: 'Transfer',
                    amount: amountToTransfer,
                    status: 'Pending',
                    from: 'Your Wallet',
                    to: `${transferRecipient.slice(0, 6)}...`
                },
                ...transactions
            ]);
            setTransferAmount('');
            setTransferRecipient('');
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || error?.shortMessage || error?.message || "Transfer failed");
        }
    };

    const handleSell = async (e: React.FormEvent) => {
        e.preventDefault();
        const amountToSell = parseInt(sellAmount);
        const priceEth = parseFloat(sellPrice);

        if (isNaN(amountToSell) || amountToSell <= 0 || amountToSell > balance) {
            toast.error("Invalid amount to sell");
            return;
        }
        if (isNaN(priceEth) || priceEth <= 0) {
            toast.error("Invalid price per credit");
            return;
        }

        setIsSelling(true);
        try {
            // Step 1: On-chain approve + list
            toast.loading("Step 1/2: Approving marketplace to spend credits...", { id: 'sell-toast' });
            const hash = await listCredits(amountToSell, priceEth.toString());

            // Step 2: Record in backend DB
            toast.loading("Step 2/2: Recording listing on platform...", { id: 'sell-toast' });
            await api.post('/marketplace/list', {
                creditsAvailable: amountToSell,
                pricePerCredit: priceEth,
                durationDays: parseInt(sellDuration),
                onChainTxHash: hash
            });

            toast.success(`Successfully listed ${amountToSell} CCR for ${priceEth} ETH/credit!`, { id: 'sell-toast', duration: 5000 });
            refetchBalance();
            setSellAmount('');
            setSellPrice('');
            setSellDuration('30');

            setTransactions([
                {
                    id: `${hash.slice(0, 6)}...${hash.slice(-4)}`,
                    date: new Date().toISOString().split('T')[0],
                    type: 'Listed',
                    amount: amountToSell,
                    status: 'Active',
                    from: 'Your Wallet',
                    to: 'Marketplace'
                },
                ...transactions
            ]);
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || error?.shortMessage || error?.message || "Listing failed", { id: 'sell-toast' });
        } finally {
            setIsSelling(false);
        }
    };

    const handleSwitchToHardhat = () => {
        switchChain.switchChain({ chainId: supportedChainId });
    };

    const txTypeBadge = (type: string) => {
        const map: Record<string, { bg: string; icon: string; text: string }> = {
            Purchase:   { bg: 'bg-blue-50 text-blue-700',   icon: 'south_west',           text: type },
            Retirement: { bg: 'bg-red-50 text-red-700',     icon: 'local_fire_department', text: type },
            Transfer:   { bg: 'bg-purple-50 text-purple-700', icon: 'swap_horiz',          text: type },
            Listed:     { bg: 'bg-amber-50 text-amber-700', icon: 'storefront',            text: type },
        };
        const cfg = map[type] || { bg: 'bg-slate-50 text-slate-700', icon: 'receipt', text: type };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg}`}>
                <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
                {cfg.text}
            </span>
        );
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {isConnected && isWrongChain && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-amber-600 text-2xl">warning</span>
                            <div>
                                <h4 className="font-bold text-amber-900">Wrong network</h4>
                                <p className="text-sm text-amber-800 mt-0.5">
                                    Carbon contracts are on <strong>Hardhat local</strong>. Switch your wallet to avoid &quot;Simulation Failed&quot; and transaction errors.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleSwitchToHardhat}
                            disabled={switchChain.isPending}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors"
                        >
                            {switchChain.isPending ? 'Switching...' : 'Switch to Hardhat'}
                        </button>
                    </div>
                    <details className="text-sm text-amber-900 bg-amber-100/60 rounded-lg p-3 border border-amber-200">
                        <summary className="font-bold cursor-pointer">Switch not working? Add Hardhat manually</summary>
                        <p className="mt-2 mb-2">In your wallet (e.g. Rainbow), add a custom network with:</p>
                        <ul className="list-disc list-inside space-y-1 font-mono text-xs bg-white/80 p-3 rounded border border-amber-200">
                            <li><strong>Network name:</strong> Hardhat Local</li>
                            <li><strong>RPC URL:</strong> http://127.0.0.1:8545</li>
                            <li><strong>Chain ID:</strong> 31337</li>
                            <li><strong>Currency symbol:</strong> ETH</li>
                        </ul>
                        <p className="mt-2 text-amber-800">Then select this network. Make sure Anvil is running (<code className="bg-white/80 px-1 rounded">anvil</code> in the contracts folder).</p>
                    </details>
                </div>
            )}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">Web3 Carbon Wallet</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your cryptographic carbon credits (CCR) — retire, transfer, or sell on the marketplace.</p>
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
                    {/* Action Form directly attached to wallet card */}
                    <div className="bg-slate-50 border-t border-slate-200 relative flex flex-col">
                        {!isConnected && (
                            <div className="absolute inset-0 z-10 bg-slate-50/80 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
                                <p className="text-sm font-bold text-slate-500">Connect wallet to enable credit actions.</p>
                            </div>
                        )}
                        <div className="flex border-b border-slate-200">
                            <button
                                onClick={() => setActiveAction('retire')}
                                className={`flex-1 py-3 text-xs font-bold transition-colors ${activeAction === 'retire' ? 'text-red-600 border-b-2 border-red-600 bg-red-50/50' : 'text-slate-500 hover:bg-slate-100'}`}
                            >
                                Retire
                            </button>
                            <button
                                onClick={() => setActiveAction('sell')}
                                className={`flex-1 py-3 text-xs font-bold transition-colors ${activeAction === 'sell' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:bg-slate-100'}`}
                            >
                                Sell
                            </button>
                            <button
                                onClick={() => setActiveAction('transfer')}
                                className={`flex-1 py-3 text-xs font-bold transition-colors ${activeAction === 'transfer' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-100'}`}
                            >
                                Transfer
                            </button>
                        </div>

                        <div className="p-6">
                            {activeAction === 'retire' ? (
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
                                        disabled={isRetiring || isTxWaiting || !isConnected || !retireAmount || !retireReason || isWrongChain}
                                        className={`w-full py-2.5 rounded-lg font-bold text-sm text-white shadow-sm transition-all flex items-center justify-center gap-2
                                            ${isRetiring || isTxWaiting || !isConnected || !retireAmount || !retireReason || isWrongChain
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

                            ) : activeAction === 'sell' ? (
                                <form onSubmit={handleSell} className="space-y-4">
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-start gap-2">
                                        <span className="material-symbols-outlined text-[16px] mt-0.5 text-emerald-600">storefront</span>
                                        <span>Credits will be escrowed in the marketplace contract. Buyers pay ETH directly to your wallet on purchase.</span>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Amount to Sell</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                max={balance}
                                                value={sellAmount}
                                                onChange={(e) => setSellAmount(e.target.value)}
                                                className="w-full border border-slate-300 rounded-lg py-2 pl-3 pr-12 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                                placeholder="0"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">CCR</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Price Per Credit (ETH)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                required
                                                min="0.000001"
                                                step="0.000001"
                                                value={sellPrice}
                                                onChange={(e) => setSellPrice(e.target.value)}
                                                className="w-full border border-slate-300 rounded-lg py-2 pl-3 pr-12 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                                placeholder="0.00001"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">ETH</span>
                                        </div>
                                        {sellAmount && sellPrice && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                Total value: <span className="font-bold text-emerald-700">{(parseFloat(sellAmount) * parseFloat(sellPrice)).toFixed(6)} ETH</span>
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Listing Duration</label>
                                        <select
                                            value={sellDuration}
                                            onChange={(e) => setSellDuration(e.target.value)}
                                            className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm text-slate-700 bg-white"
                                        >
                                            <option value="7">7 days</option>
                                            <option value="30">30 days</option>
                                            <option value="90">90 days</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSelling || isListing || !isConnected || !sellAmount || !sellPrice || isWrongChain}
                                        className={`w-full py-2.5 rounded-lg font-bold text-sm text-white shadow-sm transition-all flex items-center justify-center gap-2
                                            ${isSelling || isListing || !isConnected || !sellAmount || !sellPrice || isWrongChain
                                                ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                                                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'}`}
                                    >
                                        {isSelling || isListing ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                                                Listing on marketplace...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-[18px]">storefront</span>
                                                List for Sale
                                            </>
                                        )}
                                    </button>
                                </form>

                            ) : (
                                <form onSubmit={handleTransfer} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Recipient Address</label>
                                        <input
                                            type="text"
                                            required
                                            value={transferRecipient}
                                            onChange={(e) => setTransferRecipient(e.target.value)}
                                            className="w-full border border-slate-300 font-mono text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                            placeholder="0x..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Amount to Transfer</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                max={balance}
                                                value={transferAmount}
                                                onChange={(e) => setTransferAmount(e.target.value)}
                                                className="w-full border border-slate-300 rounded-lg py-2 pl-3 pr-12 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                                placeholder="0"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">CCR</span>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isTransferring || isTxWaiting || !isConnected || !transferAmount || !transferRecipient || isWrongChain}
                                        className={`w-full py-2.5 rounded-lg font-bold text-sm text-white shadow-sm transition-all flex items-center justify-center gap-2
                                            ${isTransferring || isTxWaiting || !isConnected || !transferAmount || !transferRecipient || isWrongChain
                                                ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                                                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}
                                    >
                                        {isTransferring || isTxWaiting ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                                                {isTxWaiting ? 'Confirming block...' : 'Sign in wallet...'}
                                            </>
                                        ) : (
                                            <>Transfer Credits</>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[700px]">
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
                                            <td className="px-6 py-4">{txTypeBadge(tx.type)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold font-syne text-lg ${tx.type === 'Purchase' ? 'text-[#1A7A4A]' : 'text-slate-700'}`}>
                                                    {tx.type === 'Purchase' ? '+' : '-'}{tx.amount}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'Pending' ? 'bg-amber-400' : tx.status === 'Active' ? 'bg-emerald-500' : 'bg-green-500'}`}></div>
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
                    <h4 className="font-bold text-blue-900 text-sm">Understanding Your Options</h4>
                    <p className="text-sm text-blue-800 mt-1">
                        <strong>Retire</strong>: Permanently burn credits as proof of offset — immutably recorded on-chain. &nbsp;
                        <strong>Sell</strong>: Escrow credits in the marketplace smart contract; buyers pay ETH and credits transfer automatically. &nbsp;
                        <strong>Transfer</strong>: Send credits directly to another wallet address.
                    </p>
                </div>
            </div>
        </div>
    );
}
