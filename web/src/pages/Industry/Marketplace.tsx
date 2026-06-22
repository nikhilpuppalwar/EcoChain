import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useCarbonCredit } from '../../hooks/useCarbonCredit';
import { useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface Listing {
    _id: string;
    seller: { _id: string; name: string; sector?: string; state?: string } | string;
    creditsAvailable: number;
    pricePerCredit: number;
    expiresAt: string;
    status: 'active' | 'sold' | 'cancelled';
    txHash?: string;
    onChainId?: number;
}

const TYPE_COLORS: Record<string, string> = {
    'Renewable Energy': 'bg-blue-50 text-blue-600',
    'Forestry': 'bg-green-50 text-green-600',
    'Agriculture': 'bg-amber-50 text-amber-600',
    'Technology': 'bg-purple-50 text-purple-600',
    'default': 'bg-slate-50 text-slate-600',
};

export default function Marketplace() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const { isConnected, chain } = useAccount();
    const [view, setView] = useState<'all' | 'mine'>('all');
    const [filter, setFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [allListings, setAllListings] = useState<Listing[]>([]);
    const [myListings, setMyListings] = useState<Listing[]>([]);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    // Web3 Hooks
    const { buyCredits, cancelListing, isBuying, isCancelling } = useMarketplace();
    const { balance, refetchBalance } = useCarbonCredit();

    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const [purchasingId, setPurchasingId] = useState<string | null>(null);

    const { isLoading: isTxWaiting, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const fetchListings = useCallback(async () => {
        setIsLoading(true);
        try {
            const [allRes, myRes] = await Promise.all([
                api.get('/marketplace/listings'),
                api.get('/marketplace/listings/mine'),
            ]);
            setAllListings(allRes.data.data || []);
            setMyListings(myRes.data.data || []);
        } catch (err) {
            console.error('Failed to load listings', err);
            toast.error('Could not load marketplace listings.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

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
            refetchBalance();
            fetchListings();
            setPurchasingId(null);
            setTxHash(undefined);
        }
    }, [isTxSuccess, txHash, purchasingId, chain?.id, refetchBalance, fetchListings]);

    const handlePurchase = async (listing: any) => {
        if (!isConnected) {
            toast.error("Please connect your wallet first.");
            return;
        }
        
        // Priority: onChainId stored in Mongo, fallback: assumption based on older list indexing.
        const onChainId = listing.onChainId !== undefined ? listing.onChainId : allListings.findIndex(l => l._id === listing._id);
        
        try {
            setPurchasingId(listing._id);
            const hash = await buyCredits(onChainId, listing.creditsAvailable, listing.pricePerCredit.toString());
            setTxHash(hash);
            toast.success("Transaction submitted. Waiting for confirmation...");

            // Also record in backend
            await api.post(`/marketplace/buy/${listing._id}`, {
                amount: listing.creditsAvailable,
                onChainTxHash: hash,
            });
        } catch (error: any) {
            console.error(error);
            const msg = error?.response?.data?.message || error?.shortMessage || error?.message || "Purchase failed";
            toast.error(msg);
            setPurchasingId(null);
        }
    };

    const handleCancel = async (listing: Listing) => {
        setCancellingId(listing._id);
        try {
            toast.loading("Sending cancellation to blockchain...", { id: 'cancel-toast' });
            const onChainId = listing.onChainId !== undefined ? listing.onChainId : allListings.findIndex(l => l._id === listing._id);
            await cancelListing(onChainId);
            toast.success("Transaction submitted. Wait for block confirmation...", { id: 'cancel-toast' });

            await api.delete(`/marketplace/listings/${listing._id}`);
            toast.success('Listing cancelled. Credits restored to your wallet.', { id: 'cancel-toast' });
            fetchListings();
            refetchBalance();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || error?.shortMessage || error?.message || 'Failed to cancel listing.', { id: 'cancel-toast' });
        } finally {
            setCancellingId(null);
        }
    };

    const getSellerId = (listing: Listing): string => {
        return (listing.seller && typeof listing.seller === 'object') ? listing.seller._id : (listing.seller as string) || '';
    };
    const getSellerName = (listing: Listing): string => {
        return (listing.seller && typeof listing.seller === 'object') ? listing.seller.name : 'Unknown';
    };

    const displayedListings = view === 'mine' ? myListings : allListings.filter(l => {
        if (filter === 'All') return true;
        if (typeof l.seller === 'object') return l.seller.sector === filter;
        return false;
    });

    const SkeletonCard = () => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
            <div className="p-6 space-y-4">
                <div className="flex justify-between">
                    <div className="h-5 w-24 bg-slate-200 rounded-full"></div>
                    <div className="h-5 w-16 bg-slate-100 rounded"></div>
                </div>
                <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
                <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div className="h-8 bg-slate-100 rounded"></div>
                    <div className="h-8 bg-slate-100 rounded"></div>
                </div>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-200">
                <div className="h-9 bg-slate-200 rounded-lg"></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">Carbon Credit Marketplace</h1>
                    <p className="text-sm text-slate-500 mt-1">Buy verified carbon credits or list your own credits for sale.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setView('all')}
                            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${view === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            All Listings
                        </button>
                        <button
                            onClick={() => setView('mine')}
                            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors flex items-center gap-1.5 ${view === 'mine' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            My Listings
                            {myListings.length > 0 && (
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{myListings.length}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Category Filter (only for all listings) */}
            {view === 'all' && (
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto w-fit">
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
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Stats Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-[#1A7A4A] to-[#0f4d2e] rounded-xl p-6 text-white shadow-md">
                        <span className="text-green-100 text-sm font-bold uppercase tracking-wider mb-2 block">Your Wallet Balance</span>
                        <div className="flex items-baseline gap-2 mb-4">
                            <h3 className="text-4xl font-bold font-syne">{isConnected ? balance.toLocaleString() : '---'}</h3>
                            <span className="text-green-200 font-medium">CCR</span>
                        </div>
                        <button
                            onClick={() => navigate('/industry/wallet')}
                            className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                            Manage Wallet
                        </button>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="font-bold font-syne text-slate-800 mb-4">Market Overview</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Active Listings</span>
                                <span className="font-bold text-slate-800">{allListings.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">My Listings</span>
                                <span className="font-bold text-slate-800">{myListings.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Avg Price</span>
                                <span className="font-bold text-slate-800">
                                    {allListings.length > 0
                                        ? `${(allListings.reduce((s, l) => s + l.pricePerCredit, 0) / allListings.length).toFixed(5)} ETH`
                                        : '---'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                        <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">sell</span>
                            Want to Sell?
                        </h4>
                        <p className="text-xs text-emerald-800 mt-2 leading-relaxed">
                            Use the <strong>Wallet → Sell tab</strong> to list your credits on the marketplace. Buyers pay ETH directly.
                        </p>
                        <button
                            onClick={() => navigate('/industry/wallet')}
                            className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
                        >
                            List Credits for Sale
                        </button>
                    </div>
                </div>

                {/* Listings Grid */}
                <div className="lg:col-span-3">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                        </div>
                    ) : displayedListings.length === 0 ? (
                        <div className="py-16 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed flex flex-col items-center">
                            <span className="material-symbols-outlined text-5xl mb-3 text-slate-300">
                                {view === 'mine' ? 'storefront' : 'search_off'}
                            </span>
                            <p className="font-medium">
                                {view === 'mine' ? "You haven't listed any credits yet." : "No listings found for this category."}
                            </p>
                            {view === 'mine' && (
                                <button
                                    onClick={() => navigate('/industry/wallet')}
                                    className="mt-4 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
                                >
                                    List Credits Now
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {displayedListings.map(listing => {
                                const isOwn = view === 'mine';
                                const isBuyingThis = purchasingId === listing._id && (isBuying || isTxWaiting);
                                const sector = (listing.seller && typeof listing.seller === 'object') ? (listing.seller.sector || 'default') : 'default';
                                const typeColor = TYPE_COLORS[sector] || TYPE_COLORS['default'];
                                const daysLeft = Math.max(0, Math.ceil((new Date(listing.expiresAt).getTime() - Date.now()) / 86400000));

                                return (
                                    <div key={listing._id} className={`bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col ${isOwn ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-slate-200'}`}>
                                        <div className="p-6 flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${typeColor}`}>
                                                    {sector !== 'default' ? sector : 'Carbon Credit'}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {isOwn && (
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                            listing.status === 'sold'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : listing.status === 'cancelled'
                                                                    ? 'bg-slate-100 text-slate-700'
                                                                    : 'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                            {listing.status === 'sold'
                                                                ? 'Sold'
                                                                : listing.status === 'cancelled'
                                                                    ? 'Cancelled'
                                                                    : 'Your Listing'}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-slate-400 font-medium">{daysLeft}d left</span>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold font-syne text-slate-800 mb-1 leading-tight">{getSellerName(listing)}</h3>
                                            <p className="text-sm text-slate-500 mb-6 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">storefront</span>
                                                Listed on {new Date(listing.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>

                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available</p>
                                                    <p className="font-bold text-slate-800 text-lg">{listing.creditsAvailable.toLocaleString()} <span className="text-sm font-normal text-slate-500">CCR</span></p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price</p>
                                                    <p className="font-bold text-[#1A7A4A] text-lg">{listing.pricePerCredit.toFixed(5)} <span className="text-sm font-normal text-slate-500">ETH/cr</span></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-4 border-t border-slate-200">
                                            {isOwn ? (
                                                listing.status === 'sold' ? (
                                                    <div className="w-full py-2 bg-blue-50 text-blue-700 font-bold border border-blue-200 rounded-lg text-sm flex items-center justify-center gap-2">
                                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                        Sold
                                                    </div>
                                                ) : listing.status === 'cancelled' ? (
                                                    <div className="w-full py-2 bg-slate-100 text-slate-500 font-bold border border-slate-200 rounded-lg text-sm flex items-center justify-center gap-2">
                                                        <span className="material-symbols-outlined text-[18px]">block</span>
                                                        Cancelled
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleCancel(listing)}
                                                        disabled={cancellingId === listing._id}
                                                        className={`w-full py-2 font-bold rounded-lg transition-colors text-sm flex items-center justify-center gap-2
                                                            ${cancellingId === listing._id
                                                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}
                                                    >
                                                        {cancellingId === listing._id ? (
                                                            <>
                                                                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                                                                Cancelling...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="material-symbols-outlined text-[18px]">cancel</span>
                                                                Cancel Listing
                                                            </>
                                                        )}
                                                    </button>
                                                )
                                            ) : (
                                                <button
                                                    onClick={() => handlePurchase(listing)}
                                                    disabled={isBuyingThis}
                                                    className={`w-full py-2 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2
                                                        ${isBuyingThis ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700'}`}
                                                >
                                                    {isBuyingThis ? (
                                                        <>
                                                            <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                                                            {isTxWaiting ? 'Confirming...' : 'Signing...'}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                                                            Buy Now
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
