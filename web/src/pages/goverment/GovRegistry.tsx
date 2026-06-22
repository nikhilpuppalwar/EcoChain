import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function GovRegistry() {
    const [activeTab, setActiveTab] = useState<'issuances' | 'transactions' | 'balances'>('issuances');
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    const [issuances, setIssuances] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [regRes, compRes] = await Promise.all([
                api.get('/gov/registry/records'),
                api.get('/gov/companies')
            ]);

            setIssuances(regRes.data.data.issuances || []);
            setTransactions(regRes.data.data.transactions || []);
            setCompanies(compRes.data.data || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load registry records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Metric Calculations
    const totalIssued = issuances.reduce((acc, curr) => acc + (curr.credits || 0), 0);
    
    const totalRetired = transactions
        .filter(tx => tx.type === 'retirement')
        .reduce((acc, curr) => acc + (curr.credits || 0), 0);
        
    const circulatingSupply = Math.max(0, totalIssued - totalRetired);
    const totalTxns = transactions.length;

    // Filtered lists
    const filteredIssuances = issuances.filter(item => {
        const matchesSearch = !search || 
            item.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
            item.txHash?.toLowerCase().includes(search.toLowerCase()) ||
            item.reason?.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });

    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = !search ||
            tx.fromCompany?.name?.toLowerCase().includes(search.toLowerCase()) ||
            tx.toCompany?.name?.toLowerCase().includes(search.toLowerCase()) ||
            tx.txHash?.toLowerCase().includes(search.toLowerCase());
            
        const matchesType = typeFilter === 'all' || tx.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const filteredCompanies = companies.filter(c =>
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.walletAddress?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
                <span className="material-symbols-outlined animate-spin text-4xl text-blue-600 mb-2">sync</span>
                <p className="text-slate-500 font-medium">Loading registry database...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold font-syne text-slate-800">Carbon Credit Registry (CCR)</h1>
                <p className="text-sm text-slate-500 mt-1">Sovereign ledger for ecological assets. View balances, transfers, and retirement audits.</p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Minted', value: `${totalIssued.toLocaleString()} CCR`, icon: 'toll', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Retired (Burned)', value: `${totalRetired.toLocaleString()} CCR`, icon: 'local_fire_department', color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Circulating Supply', value: `${circulatingSupply.toLocaleString()} CCR`, icon: 'sync_alt', color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Total Transactions', value: String(totalTxns), icon: 'receipt_long', color: 'text-violet-600', bg: 'bg-violet-50' }
                ].map(metric => (
                    <div key={metric.label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${metric.bg} ${metric.color}`}>
                            <span className="material-symbols-outlined text-2xl">{metric.icon}</span>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{metric.label}</span>
                            <h3 className={`text-2xl font-bold font-syne mt-0.5 ${metric.color}`}>{metric.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab Controls & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-2">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button 
                        onClick={() => { setActiveTab('issuances'); setSearch(''); setTypeFilter('all'); }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'issuances' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">verified_user</span>
                        Minting & Issuances
                    </button>
                    <button 
                        onClick={() => { setActiveTab('transactions'); setSearch(''); setTypeFilter('all'); }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'transactions' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">history</span>
                        Transfer & Burn Ledger
                    </button>
                    <button 
                        onClick={() => { setActiveTab('balances'); setSearch(''); setTypeFilter('all'); }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'balances' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                        Holders & Balances
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {activeTab === 'transactions' && (
                        <select
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                            className="bg-white border border-slate-200 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="all">All Tx Types</option>
                            <option value="transfer">Wallet Transfers</option>
                            <option value="retirement">Retirements</option>
                            <option value="sale">Marketplace Sales</option>
                            <option value="issuance">Issuances</option>
                        </select>
                    )}
                    <div className="relative w-full md:w-60">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input 
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" 
                            placeholder={activeTab === 'balances' ? 'Search holders...' : 'Search hash or company...'} 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                        />
                    </div>
                </div>
            </div>

            {/* TAB: MINTING & ISSUANCES */}
            {activeTab === 'issuances' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Company</th>
                                    <th className="px-6 py-4 text-center">Amount (CCR)</th>
                                    <th className="px-6 py-4">Reason</th>
                                    <th className="px-6 py-4">Minting Tx Hash</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredIssuances.length > 0 ? (
                                    filteredIssuances.map(item => (
                                        <tr key={item._id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{item.company?.name || 'Unknown'}</div>
                                                <div className="text-[10px] text-slate-400 font-mono tracking-tight">{item.company?.walletAddress || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-blue-600 font-mono">
                                                +{item.credits?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 text-xs">
                                                {item.reason}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-400 max-w-[200px] truncate select-all" title={item.txHash}>
                                                {item.txHash || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                                                {new Date(item.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No issuances found matching criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: TRANSFER & RETIREMENT LEDGER */}
            {activeTab === 'transactions' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">From (Sender)</th>
                                    <th className="px-6 py-4">To (Recipient)</th>
                                    <th className="px-6 py-4 text-center">Amount (CCR)</th>
                                    <th className="px-6 py-4">Blockchain Tx Hash</th>
                                    <th className="px-6 py-4">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map(tx => (
                                        <tr key={tx._id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider
                                                    ${tx.type === 'retirement' ? 'bg-orange-50 text-orange-600 border border-orange-200' : 
                                                      tx.type === 'issuance' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                                      'bg-green-50 text-green-600 border border-green-200'}
                                                `}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {tx.fromCompany ? (
                                                    <>
                                                        <div className="font-bold text-slate-700 text-xs">{tx.fromCompany.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono">{tx.fromCompany.walletAddress}</div>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">SYSTEM MINT</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {tx.toCompany ? (
                                                    <>
                                                        <div className="font-bold text-slate-700 text-xs">{tx.toCompany.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono">{tx.toCompany.walletAddress}</div>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">SYSTEM BURN</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold font-mono">
                                                <span className={tx.type === 'retirement' ? 'text-orange-600' : 'text-slate-800'}>
                                                    {tx.credits?.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-400 max-w-[200px] truncate select-all" title={tx.txHash}>
                                                {tx.txHash || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                                                {new Date(tx.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No transactions recorded.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: GLOBAL REGISTRY BALANCES */}
            {activeTab === 'balances' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Company (Holder Name)</th>
                                    <th className="px-6 py-4">Sector</th>
                                    <th className="px-6 py-4">On-Chain Wallet Address</th>
                                    <th className="px-6 py-4 text-right">Circulating Credits (CCR)</th>
                                    <th className="px-6 py-4 text-center">Compliance Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCompanies.length > 0 ? (
                                    filteredCompanies.map(c => (
                                        <tr key={c._id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4 font-bold text-slate-800">
                                                {c.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">
                                                {c.sector}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-600 select-all">
                                                {c.walletAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold font-mono text-slate-800">
                                                {c.creditBalance?.toLocaleString() || 0} CCR
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider
                                                    ${c.complianceStatus === 'compliant' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                                `}>
                                                    {c.complianceStatus || 'compliant'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No registry holders found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
