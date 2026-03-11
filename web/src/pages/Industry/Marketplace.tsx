import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useCarbonCredit } from '../../hooks/useCarbonCredit';
import { useWaitForTransactionReceipt, useAccount } from 'wagmi';
import toast from 'react-hot-toast';

export default function Marketplace() {
    const { user } = useAuthStore();
    const { isConnected, chain } = useAccount();
    const [filter, setFilter] = useState('All');

    // Web3 Hooks
    const { buyCredits, isBuying } = useMarketplace();
    const { balance, refetchBalance } = useCarbonCredit();

    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const [purchasingId, setPurchasingId] = useState<string | null>(null);

    const { isLoading: isTxWaiting, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // Price per credit in ETH (contract expects wei). Use small values so total cost is payable.
    const [listings, setListings] = useState([
        { id: '0', seller: 'SolarFarm India Ltd', project: 'Rajasthan 100MW Solar', type: 'Renewable Energy', amount: 5000, pricePerCreditEth: 0.00001, vintage: 2023 },
        { id: '1', seller: 'AgriCorp Co.', project: 'Punjab Soil Sequestration', type: 'Agriculture', amount: 1200, pricePerCreditEth: 0.00002, vintage: 2024 },
        { id: '2', seller: 'Govt of MP', project: 'Bhopal Reforestation Initiative', type: 'Forestry', amount: 10000, pricePerCreditEth: 0.000015, vintage: 2022 },
        { id: '3', seller: 'EcoTech Innovations', project: 'Direct Air Capture Pilot', type: 'Technology', amount: 300, pricePerCreditEth: 0.00005, vintage: 2024 },
    ]);

    const filteredListings = listings.filter(l => {
        if (filter === 'All') return true;
        return l.type === filter;
    });

    useEffect(() => {
        if (isTxSuccess && purchasingId && txHash) {
            const explorerUrl = chain?.id === 11155111 ? `https://sepolia.etherscan.io/tx/${txHash}` : null;
            toast.success(
                <div>
                    Purchase confirmed!
                    {explorerUrl ? (
                        <a href={explorerUrl} target="_blank" rel="noreferrer" className="underline font-bold ml-1">View on Etherscan</a>
                    ) : (
                        <span className="ml-1 font-mono text-xs">Tx: {txHash.slice(0, 10)}...</span>
                    )}
                </div>,
                { duration: 5000 }
            );
            setListings(prev => prev.filter(l => l.id !== purchasingId));
            refetchBalance();
            setPurchasingId(null);
            setTxHash(undefined);
        }
    }, [isTxSuccess, txHash, purchasingId, chain?.id, refetchBalance]);

    const handlePurchase = async (id: string, amount: number, pricePerCreditEth: number) => {
        if (!isConnected) {
            toast.error("Please connect your wallet first.");
            return;
        }

        try {
            setPurchasingId(id);
            const hash = await buyCredits(Number(id), amount, pricePerCreditEth.toString());
            setTxHash(hash);
            toast.success("Transaction submitted. Waiting for confirmation...");
        } catch (error: any) {
            console.error(error);
            const msg = error?.shortMessage || error?.message || "Purchase failed";
            toast.error(msg);
            setPurchasingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">Carbon Credit Marketplace</h1>
                    <p className="text-sm text-slate-500 mt-1">Browse and purchase verified carbon credits to offset your emissions.</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto">
                    {['All', 'Renewable Energy', 'Forestry', 'Agriculture', 'Technology'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors whitespace-nowrap ${filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Stats Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-[#1A7A4A] to-[#0f4d2e] rounded-xl p-6 text-white shadow-md">
                        <span className="text-green-100 text-sm font-bold uppercase tracking-wider mb-2 block">Your Wallet Balance</span>
                        <div className="flex items-baseline gap-2 mb-4">
                            <h3 className="text-4xl font-bold font-syne">{isConnected ? balance.toLocaleString() : '---'}</h3>
                            <span className="text-green-200 font-medium">CCR</span>
                        </div>
                        <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors">
                            Manage Wallet
                        </button>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="font-bold font-syne text-slate-800 mb-4">Market Overview</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Average Price</span>
                                <span className="font-bold text-slate-800">₹18.40/cr</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">24h Volume</span>
                                <span className="font-bold text-slate-800">12,500 CCR</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Active Listings</span>
                                <span className="font-bold text-slate-800">142</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Listings Grid */}
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredListings.map(listing => (
                            <div key={listing.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                                            ${listing.type === 'Renewable Energy' ? 'bg-blue-50 text-blue-600' :
                                                listing.type === 'Forestry' ? 'bg-green-50 text-green-600' :
                                                    listing.type === 'Agriculture' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-purple-50 text-purple-600'
                                            }
                                        `}>
                                            {listing.type}
                                        </div>
                                        <span className="text-sm font-bold text-slate-500">Vin: {listing.vintage}</span>
                                    </div>
                                    <h3 className="text-lg font-bold font-syne text-slate-800 mb-1 leading-tight">{listing.project}</h3>
                                    <p className="text-sm text-slate-500 mb-6 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">storefront</span>
                                        {listing.seller}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available</p>
                                            <p className="font-bold text-slate-800 text-lg">{listing.amount.toLocaleString()} <span className="text-sm font-normal text-slate-500">CCR</span></p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price</p>
                                            <p className="font-bold text-[#1A7A4A] text-lg">{listing.pricePerCreditEth.toFixed(5)} <span className="text-sm font-normal text-slate-500">ETH/cr</span></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 border-t border-slate-200">
                                    <button
                                        onClick={() => handlePurchase(listing.id, listing.amount, listing.pricePerCreditEth)}
                                        disabled={purchasingId === listing.id && (isBuying || isTxWaiting)}
                                        className={`w-full py-2 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2
                                            ${purchasingId === listing.id && (isBuying || isTxWaiting) ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700'}`}
                                    >
                                        {purchasingId === listing.id && (isBuying || isTxWaiting) ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                                                {isTxWaiting ? 'Confirming...' : 'Signing...'}
                                            </>
                                        ) : (
                                            'Buy Now'
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredListings.length === 0 && (
                            <div className="col-span-2 py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
                                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">search_off</span>
                                <p>No listings found for this category at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
