import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import PublicNav from '../../components/PublicNav';

const priceHistory = [
    { date: 'Jan', price: 18.2, volume: 12400 },
    { date: 'Feb', price: 19.5, volume: 14200 },
    { date: 'Mar', price: 20.1, volume: 11800 },
    { date: 'Apr', price: 21.4, volume: 16500 },
    { date: 'May', price: 22.8, volume: 19200 },
    { date: 'Jun', price: 21.2, volume: 15600 },
    { date: 'Jul', price: 23.5, volume: 21000 },
    { date: 'Aug', price: 24.8, volume: 24100 },
    { date: 'Sep', price: 23.1, volume: 18700 },
    { date: 'Oct', price: 25.4, volume: 26500 },
    { date: 'Nov', price: 24.2, volume: 22800 },
    { date: 'Dec', price: 26.8, volume: 31000 },
];

const transactions = [
    { hash: '0x8a7c...2b9f', type: 'MINT', industry: 'SolarEdge Industries', amount: '+500 tCO₂e', status: 'MINTED', ts: '2 min ago', blockchain: 'Polygon' },
    { hash: '0x3c1d...9d24', type: 'TRADE', industry: 'GreenTransport → EcoFund', amount: '200 tCO₂e @ $24.80', status: 'TRADED', ts: '8 min ago', blockchain: 'Polygon' },
    { hash: '0x1f4a...8a1b', type: 'RETIRE', industry: 'AquaPure Mfg.', amount: '-150 tCO₂e', status: 'RETIRED', ts: '15 min ago', blockchain: 'Polygon' },
    { hash: '0xb29e...c4e7', type: 'MINT', industry: 'AgriGreen Ltd.', amount: '+1,200 tCO₂e', status: 'MINTED', ts: '32 min ago', blockchain: 'Polygon' },
    { hash: '0xd81f...a11c', type: 'TRADE', industry: 'CleanBuild → Carbon IX', amount: '50 tCO₂e @ $25.10', status: 'TRADED', ts: '1 hr ago', blockchain: 'Polygon' },
    { hash: '0xe44b...b22d', type: 'RETIRE', industry: 'DeepGreen Energy', amount: '-300 tCO₂e', status: 'RETIRED', ts: '2 hr ago', blockchain: 'Polygon' },
];

export default function CarbonMarket() {
    const [tab, setTab] = useState<'market' | 'blockchain'>('market');
    const [search, setSearch] = useState('');

    const trend = priceHistory[priceHistory.length - 1].price > priceHistory[priceHistory.length - 2].price;

    const filtered = transactions.filter(t =>
        !search || t.hash.toLowerCase().includes(search) || t.industry.toLowerCase().includes(search) || t.type.toLowerCase().includes(search)
    );

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <PublicNav />

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Carbon Market & Blockchain Explorer</h1>
                        <p className="text-gray-400 mt-1">Live credit price index and on-chain transaction records</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                        {[{ id: 'market', label: 'Carbon Market' }, { id: 'blockchain', label: 'Blockchain Explorer' }].map(t => (
                            <button key={t.id} onClick={() => setTab(t.id as 'market' | 'blockchain')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.id ? 'bg-[#1A7A4A] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {tab === 'market' && (
                    <div className="space-y-6">
                        {/* Market stats bar */}
                        <div className="grid sm:grid-cols-4 gap-4">
                            {[
                                { label: 'Current Price', value: '$26.80', sub: 'per tCO₂e', icon: 'price_check', color: 'text-green-600' },
                                { label: 'Trend', value: trend ? '📈 Bullish' : '📉 Bearish', sub: 'vs last month', icon: 'trending_up', color: trend ? 'text-green-600' : 'text-red-500' },
                                { label: 'Monthly Volume', value: '31,000', sub: 'credits traded', icon: 'bar_chart', color: 'text-blue-600' },
                                { label: 'Market Cap', value: '$2.8M', sub: 'total value', icon: 'account_balance', color: 'text-purple-600' },
                            ].map(s => (
                                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                                    <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                                    <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <h2 className="font-black text-gray-900 mb-1">Credit Price Index</h2>
                                <p className="text-xs text-gray-400 mb-5">USD per tCO₂e — 12-month trend</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={priceHistory}>
                                        <defs>
                                            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1A7A4A" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#1A7A4A" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                        <YAxis domain={[15, 30]} tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                                        <Tooltip formatter={(v) => [`$${v}`, 'Price']} />
                                        <Area type="monotone" dataKey="price" stroke="#1A7A4A" strokeWidth={2.5} fill="url(#priceGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <h2 className="font-black text-gray-900 mb-1">Trading Volume</h2>
                                <p className="text-xs text-gray-400 mb-5">Credits traded per month</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={priceHistory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Bar dataKey="volume" fill="#1A7A4A" radius={[4, 4, 0, 0]} name="Credits" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'blockchain' && (
                    <div className="space-y-6">
                        {/* Search */}
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                                <input className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 bg-white" placeholder="Search by tx hash, industry, or type..." value={search} onChange={e => setSearch(e.target.value.toLowerCase())} />
                            </div>
                            <button className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                <span className="material-symbols-outlined text-sm">download</span>
                                Export CSV
                            </button>
                        </div>

                        {/* Transaction table */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="font-black text-gray-900">Live Blockchain Transactions</span>
                                <span className="ml-auto text-xs text-gray-400">Polygon Network · {filtered.length} records</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-5 py-3 text-left">TX Hash</th>
                                            <th className="px-5 py-3 text-left">Type</th>
                                            <th className="px-5 py-3 text-left">Industry</th>
                                            <th className="px-5 py-3 text-left">Amount</th>
                                            <th className="px-5 py-3 text-left">Status</th>
                                            <th className="px-5 py-3 text-left">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filtered.map((tx, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-4 font-mono text-[#1A7A4A] font-bold text-xs cursor-pointer hover:underline">{tx.hash}</td>
                                                <td className="px-5 py-4">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-black ${tx.type === 'MINT' ? 'bg-green-100 text-green-700' : tx.type === 'TRADE' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{tx.type}</span>
                                                </td>
                                                <td className="px-5 py-4 text-gray-700 font-medium">{tx.industry}</td>
                                                <td className="px-5 py-4 font-mono text-sm font-bold text-gray-900">{tx.amount}</td>
                                                <td className="px-5 py-4">
                                                    <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                        CONFIRMED
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-gray-400 text-xs">{tx.ts}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
