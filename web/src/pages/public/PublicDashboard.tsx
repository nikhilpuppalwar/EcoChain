import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, AreaChart, Area 
} from 'recharts';
import PublicNav from '../../components/PublicNav';

// ─── Overview Data ────────────────────────────────────────────────────────
const emissionData = [
    { month: 'Jan 2024', emissions: 4200, credits: 320 },
    { month: 'Mar 2024', emissions: 3900, credits: 410 },
    { month: 'Jun 2024', emissions: 3700, credits: 490 },
    { month: 'Sep 2024', emissions: 3450, credits: 580 },
    { month: 'Dec 2024', emissions: 3200, credits: 670 },
    { month: 'Mar 2025', emissions: 2950, credits: 810 },
];

const leaderboard = [
    { rank: 1, company: 'SolarEdge Industries', sector: 'Energy', reduction: 12400, badge: '🏆' },
    { rank: 2, company: 'GreenTransport Co.', sector: 'Transport', reduction: 9800, badge: '🥈' },
    { rank: 3, company: 'EcoFarm Solutions', sector: 'Agriculture', reduction: 7300, badge: '🥉' },
    { rank: 4, company: 'CleanBuild Corp.', sector: 'Construction', reduction: 5200, badge: '' },
    { rank: 5, company: 'AquaPure Mfg.', sector: 'Manufacturing', reduction: 4100, badge: '' },
];

const activity = [
    { time: '2 min ago', event: 'SolarEdge Industries submission approved', type: 'approved' },
    { time: '15 min ago', event: 'GreenTransport Co. earned 480 carbon credits', type: 'credit' },
    { time: '1 hr ago', event: 'AquaPure Mfg. anomaly detected — resubmission required', type: 'flagged' },
    { time: '3 hr ago', event: 'CleanBuild Corp. audit report published on blockchain', type: 'blockchain' },
    { time: '5 hr ago', event: 'National carbon credit price updated: $24.80/tCO₂e', type: 'market' },
];

const stats = [
    { label: 'Total CO₂ Reduced', value: '2.95M tCO₂e', icon: 'co2', trend: '+8.4%', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Credits Issued', value: '98,500', icon: 'token', trend: '+12.1%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Registered Industries', value: '342', icon: 'factory', trend: '+18', color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Certified Auditors', value: '47', icon: 'fact_check', trend: '+3', color: 'text-cyan-600', bg: 'bg-cyan-50' },
];

// ─── Emission Map Data ────────────────────────────────────────────────────
const regions = [
    { id: 'north', name: 'North India', level: 'high', co2: '12,400 tCO₂e', top: '38%', left: '38%' },
    { id: 'west', name: 'West India', level: 'medium', co2: '8,200 tCO₂e', top: '48%', left: '22%' },
    { id: 'east', name: 'East India', level: 'medium', co2: '7,100 tCO₂e', top: '42%', left: '62%' },
    { id: 'south', name: 'South India', level: 'low', co2: '4,300 tCO₂e', top: '70%', left: '40%' },
    { id: 'central', name: 'Central India', level: 'high', co2: '10,800 tCO₂e', top: '45%', left: '42%' },
];

const sectorData = {
    Manufacturing: [
        { year: '2021', emissions: 5400, target: 5000 },
        { year: '2022', emissions: 5100, target: 4800 },
        { year: '2023', emissions: 4700, target: 4500 },
        { year: '2024', emissions: 4200, target: 4000 },
        { year: '2025', emissions: 3850, target: 3500 },
    ],
    Energy: [
        { year: '2021', emissions: 8100, target: 7500 },
        { year: '2022', emissions: 7600, target: 7000 },
        { year: '2023', emissions: 6900, target: 6500 },
        { year: '2024', emissions: 6200, target: 6000 },
        { year: '2025', emissions: 5800, target: 5500 },
    ],
    Transport: [
        { year: '2021', emissions: 3200, target: 3000 },
        { year: '2022', emissions: 3000, target: 2800 },
        { year: '2023', emissions: 2750, target: 2500 },
        { year: '2024', emissions: 2400, target: 2200 },
        { year: '2025', emissions: 2100, target: 2000 },
    ],
};

const topPolluters = [
    { company: 'PetroChem Mega Corp', sector: 'Energy', emissions: 28400 },
    { company: 'SteelMax Industries', sector: 'Manufacturing', emissions: 22100 },
    { company: 'CoalPower Plant A', sector: 'Energy', emissions: 19800 },
    { company: 'HeavyAuto Works', sector: 'Transport', emissions: 14200 },
    { company: 'AgroChem United', sector: 'Agriculture', emissions: 11000 },
];

const sectors = Object.keys(sectorData) as (keyof typeof sectorData)[];

const regionPolygons = [
    { id: 'north', name: 'North India', points: '200,20 230,50 215,100 240,130 280,180 200,200 160,180 150,140 140,90', labelX: 200, labelY: 110 },
    { id: 'west', name: 'West India', points: '140,90 160,180 180,210 180,270 120,310 90,260 70,210 110,180 120,130', labelX: 125, labelY: 210 },
    { id: 'central', name: 'Central India', points: '160,180 200,200 240,210 260,260 210,300 180,270', labelX: 210, labelY: 240 },
    { id: 'east', name: 'East India', points: '280,180 310,190 370,170 380,200 330,220 300,220 270,250 260,260 240,210 200,200', labelX: 290, labelY: 210 },
    { id: 'south', name: 'South India', points: '180,270 210,300 260,260 240,310 230,400 210,440 180,420 140,320 120,310', labelX: 190, labelY: 340 }
];

// ─── Carbon Market Data ───────────────────────────────────────────────────
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

export default function PublicDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as 'overview' | 'map' | 'market') || 'overview';

    const setActiveTab = (tab: 'overview' | 'map' | 'market') => {
        setSearchParams({ tab });
    };

    // Map tab local states
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
    const [selectedSector, setSelectedSector] = useState<keyof typeof sectorData>('Manufacturing');
    const [selectedRegion, setSelectedRegion] = useState<typeof regions[0] | null>(null);

    // Market tab local states
    const [marketSubTab, setMarketSubTab] = useState<'trends' | 'ledger'>('trends');
    const [search, setSearch] = useState('');

    const trend = priceHistory[priceHistory.length - 1].price > priceHistory[priceHistory.length - 2].price;

    const filteredTransactions = transactions.filter(t =>
        !search || t.hash.toLowerCase().includes(search) || t.industry.toLowerCase().includes(search) || t.type.toLowerCase().includes(search)
    );

    const levelColor: Record<string, { bg: string; badge: string; dot: string; fill: string; stroke: string; activeFill: string; activeStroke: string }> = {
        high: { 
            bg: 'bg-red-400/70 hover:bg-red-500', 
            badge: 'bg-red-100 text-red-700', 
            dot: 'bg-red-500',
            fill: 'fill-red-500/20 hover:fill-red-500/40',
            stroke: 'stroke-red-500/80',
            activeFill: 'fill-red-500/60',
            activeStroke: 'stroke-red-400'
        },
        medium: { 
            bg: 'bg-amber-400/70 hover:bg-amber-500', 
            badge: 'bg-amber-100 text-amber-700', 
            dot: 'bg-amber-500',
            fill: 'fill-amber-500/20 hover:fill-amber-500/40',
            stroke: 'stroke-amber-500/80',
            activeFill: 'fill-amber-500/60',
            activeStroke: 'stroke-amber-400'
        },
        low: { 
            bg: 'bg-emerald-400/70 hover:bg-emerald-500', 
            badge: 'bg-green-100 text-green-700', 
            dot: 'bg-green-500',
            fill: 'fill-emerald-500/20 hover:fill-emerald-500/40',
            stroke: 'stroke-emerald-500/80',
            activeFill: 'fill-emerald-500/60',
            activeStroke: 'stroke-emerald-400'
        },
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <PublicNav />

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Header with main Dashboard switcher */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">
                            {activeTab === 'overview' && 'National Carbon Dashboard'}
                            {activeTab === 'map' && 'Emission Map & Sector Analytics'}
                            {activeTab === 'market' && 'Carbon Market & Blockchain Explorer'}
                        </h1>
                        <p className="text-gray-400 mt-1">
                            {activeTab === 'overview' && 'Public emission monitoring data · Auto-refreshed every 5 minutes'}
                            {activeTab === 'map' && 'Regional emission intensity and sector-level analytics'}
                            {activeTab === 'market' && 'Live credit price index and on-chain transaction records'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1 self-start md:self-auto shrink-0 shadow-sm">
                        {[
                            { id: 'overview', label: 'Overview', icon: 'dashboard' },
                            { id: 'map', label: 'Emission Map', icon: 'map' },
                            { id: 'market', label: 'Carbon Market', icon: 'swap_horiz' }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id as any)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                                    activeTab === t.id
                                        ? 'bg-[#1A7A4A] text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <span className="material-symbols-outlined text-base leading-none">{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── TAB 1: OVERVIEW ────────────────────────────────────────── */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Stats grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {stats.map(s => (
                                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                                            <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
                                        </div>
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{s.trend} this month</span>
                                    </div>
                                    <p className="text-3xl font-black text-gray-900">{s.value}</p>
                                    <p className="text-xs text-gray-400 font-medium mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Trend charts */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <h2 className="font-black text-gray-900 mb-1">National Emission Trend</h2>
                                <p className="text-xs text-gray-400 mb-6">Monthly CO₂ tonnage across all sectors</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={emissionData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="emissions" stroke="#1A7A4A" strokeWidth={2.5} dot={{ fill: '#1A7A4A', r: 4 }} name="CO₂e (tonnes)" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <h2 className="font-black text-gray-900 mb-1">Carbon Credits Issued</h2>
                                <p className="text-xs text-gray-400 mb-6">Monthly credit tokenization volume</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={emissionData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Bar dataKey="credits" fill="#1A7A4A" radius={[4, 4, 0, 0]} name="Credits Issued" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Leaderboard + Live activity */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <h2 className="font-black text-gray-900 mb-1">Top Emission Reducers</h2>
                                <p className="text-xs text-gray-400 mb-5">Year-to-date leaders by tCO₂e reduced</p>
                                <div className="space-y-3">
                                    {leaderboard.map(l => (
                                        <div key={l.rank} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                                            <div className="w-8 text-center">
                                                {l.badge ? <span className="text-xl">{l.badge}</span> : <span className="text-sm font-bold text-gray-300">#{l.rank}</span>}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 text-sm">{l.company}</p>
                                                <p className="text-xs text-gray-400">{l.sector}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-green-600 text-sm">{l.reduction.toLocaleString()}</p>
                                                <p className="text-xs text-gray-400">tCO₂e</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <h2 className="font-black text-gray-900">Live Activity Feed</h2>
                                </div>
                                <p className="text-xs text-gray-400 mb-5">Real-time compliance events</p>
                                <div className="space-y-4">
                                    {activity.map((a, i) => {
                                        const colors: Record<string, string> = {
                                            approved: 'bg-green-100 text-green-600',
                                            credit: 'bg-amber-100 text-amber-600',
                                            flagged: 'bg-red-100 text-red-600',
                                            blockchain: 'bg-blue-100 text-blue-600',
                                            market: 'bg-purple-100 text-purple-600',
                                        };
                                        const icons: Record<string, string> = {
                                            approved: 'check_circle', credit: 'token', flagged: 'warning',
                                            blockchain: 'link', market: 'trending_up',
                                        };
                                        return (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colors[a.type]}`}>
                                                    <span className="material-symbols-outlined text-sm">{icons[a.type]}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-700">{a.event}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── TAB 2: EMISSION MAP ────────────────────────────────────── */}
                {activeTab === 'map' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Map Section */}
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Visual Map */}
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-black text-gray-900">National Emission Map</h2>
                                    <div className="flex items-center gap-4 text-xs font-medium">
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" />Low</span>
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />Medium</span>
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" />High</span>
                                    </div>
                                </div>
                                <div className="relative bg-[#071022] rounded-xl h-[420px] border border-primary/20 overflow-hidden flex items-center justify-center p-4">
                                    {/* Tech Grid Background */}
                                    <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1A7A4A" strokeWidth="0.5" />
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill="url(#map-grid)" />
                                    </svg>
                                    <p className="absolute top-3 left-3 text-xs text-primary/60 font-bold uppercase tracking-widest font-mono select-none">INDIA — REGIONAL EMISSION MAP</p>
                                    
                                    {/* Interactive SVG Map */}
                                    <svg viewBox="0 0 400 460" className="w-full h-full max-h-[380px] mx-auto select-none relative z-10">
                                        {regionPolygons.map(p => {
                                            const isSelected = selectedRegion?.id === p.id;
                                            const isHovered = hoveredRegion === p.id;
                                            const regData = regions.find(r => r.id === p.id)!;
                                            const colors = levelColor[regData.level];
                                            return (
                                                <g key={p.id}>
                                                    <polygon
                                                        points={p.points}
                                                        className={`transition-all duration-300 cursor-pointer stroke-[1.5] ${
                                                            isSelected ? colors.activeFill + ' ' + colors.activeStroke : isHovered ? colors.fill.split(' ')[1] + ' ' + colors.stroke : colors.fill.split(' ')[0] + ' ' + colors.stroke
                                                        }`}
                                                        onMouseEnter={() => setHoveredRegion(p.id)}
                                                        onMouseLeave={() => setHoveredRegion(null)}
                                                        onClick={() => setSelectedRegion(regData)}
                                                    />
                                                    <text
                                                        x={p.labelX}
                                                        y={p.labelY}
                                                        textAnchor="middle"
                                                        className="fill-gray-400 text-[10px] font-bold tracking-widest pointer-events-none uppercase"
                                                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
                                                    >
                                                        {p.name.split(' ')[0]}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                    </svg>
                                    
                                    {selectedRegion && (
                                        <div className="absolute bottom-4 right-4 bg-gray-950/90 backdrop-blur border border-primary/20 rounded-xl p-4 shadow-xl w-56 z-20">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-white text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{selectedRegion.name}</span>
                                                <button onClick={() => setSelectedRegion(null)} className="text-gray-500 hover:text-gray-300">
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>CO₂e: <span className="font-bold text-white">{selectedRegion.co2}</span></p>
                                            <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${levelColor[selectedRegion.level].badge} bg-transparent`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{selectedRegion.level} intensity</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Regions List */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
                                <h2 className="font-black text-gray-900 mb-4">Regions & Intensity</h2>
                                <div className="space-y-3 flex-1 overflow-y-auto">
                                    {regions.map(r => (
                                        <div key={r.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2.5 h-2.5 rounded-full ${levelColor[r.level].dot}`} />
                                                <span className="font-bold text-gray-900 text-sm">{r.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900">{r.co2}</p>
                                                <span className={`text-xs font-bold capitalize px-2 py-0.5 rounded-full ${levelColor[r.level].badge}`}>{r.level}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sector Analytics */}
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h2 className="text-xl font-black text-gray-900">Sector Performance</h2>
                                <div className="flex flex-wrap gap-2">
                                    {sectors.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSelectedSector(s)}
                                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                                selectedSector === s
                                                    ? 'bg-[#1A7A4A] text-white shadow-md'
                                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1A7A4A]/40'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <h2 className="font-black text-gray-900 mb-1">{selectedSector} — Year-on-Year Trend</h2>
                                    <p className="text-xs text-gray-400 mb-5">Actual emissions vs annual target</p>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={sectorData[selectedSector]}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 11 }} />
                                            <Tooltip />
                                            <Bar dataKey="emissions" fill="#ef4444" radius={[4, 4, 0, 0]} name="Actual (tCO₂e)" />
                                            <Bar dataKey="target" fill="#1A7A4A" radius={[4, 4, 0, 0]} name="Target (tCO₂e)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
                                    <h2 className="font-black text-gray-900 mb-4">Top Polluters — {selectedSector}</h2>
                                    <div className="space-y-4 flex-1">
                                        {topPolluters
                                            .filter(p => selectedSector === 'Manufacturing' ? p.sector === 'Manufacturing' : selectedSector === 'Energy' ? p.sector === 'Energy' : true)
                                            .slice(0, 5)
                                            .map((p, i) => (
                                                <div key={i} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0 last:pb-0">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-mono text-gray-300 w-4">#{i + 1}</span>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{p.company}</p>
                                                            <p className="text-xs text-gray-400">{p.sector}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-red-500 text-sm">{p.emissions.toLocaleString()}</p>
                                                        <p className="text-xs text-gray-400">tCO₂e</p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                    <button className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                        <span className="material-symbols-outlined text-sm">download</span>
                                        Export CSV
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── TAB 3: CARBON MARKET ──────────────────────────────────── */}
                {activeTab === 'market' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Sub-tab selection (Market Stats vs Ledger) */}
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                                {[
                                    { id: 'trends', label: 'Market Trends' },
                                    { id: 'ledger', label: 'On-Chain Ledger' }
                                ].map(st => (
                                    <button
                                        key={st.id}
                                        onClick={() => setMarketSubTab(st.id as any)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            marketSubTab === st.id
                                                ? 'bg-white text-[#1A7A4A] shadow-sm'
                                                : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                    >
                                        {st.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {marketSubTab === 'trends' && (
                            <div className="space-y-6">
                                {/* Stats Cards */}
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

                                {/* Area + Bar charts */}
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

                        {marketSubTab === 'ledger' && (
                            <div className="space-y-6">
                                {/* Search and Export */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                                        <input
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 bg-white"
                                            placeholder="Search by tx hash, industry, or type..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                        />
                                    </div>
                                    <button className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 bg-white hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                                        <span className="material-symbols-outlined text-sm">download</span>
                                        Export CSV
                                    </button>
                                </div>

                                {/* Transaction Table */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="font-black text-gray-900">Live Blockchain Transactions</span>
                                        <span className="ml-auto text-xs text-gray-400">Polygon Network · {filteredTransactions.length} records</span>
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
                                                {filteredTransactions.map((tx, i) => (
                                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-5 py-4 font-mono text-[#1A7A4A] font-bold text-xs cursor-pointer hover:underline">{tx.hash}</td>
                                                        <td className="px-5 py-4">
                                                            <span className={`px-2 py-1 rounded-lg text-xs font-black ${
                                                                tx.type === 'MINT' ? 'bg-green-100 text-green-700' : tx.type === 'TRADE' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                                            }`}>{tx.type}</span>
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
                                                {filteredTransactions.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                                                            No transactions match your search.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
