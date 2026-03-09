import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PublicNav from '../../components/PublicNav';

const regions = [
    { id: 'north', name: 'North India', level: 'high', co2: '12,400 tCO₂e', top: '20%', left: '38%' },
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

export default function EmissionMap() {
    const [tab, setTab] = useState<'map' | 'sector'>('map');
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
    const [selectedSector, setSelectedSector] = useState<keyof typeof sectorData>('Manufacturing');
    const [selectedRegion, setSelectedRegion] = useState<typeof regions[0] | null>(null);

    const levelColor: Record<string, { bg: string; badge: string; dot: string }> = {
        high: { bg: 'bg-red-400/70 hover:bg-red-500', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
        medium: { bg: 'bg-amber-400/70 hover:bg-amber-500', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
        low: { bg: 'bg-green-400/70 hover:bg-green-500', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <PublicNav />

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Emission Map & Sector Analytics</h1>
                        <p className="text-gray-400 mt-1">Regional emission intensity and sector-level analytics</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                        {['map', 'sector'].map(t => (
                            <button key={t} onClick={() => setTab(t as 'map' | 'sector')} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${tab === t ? 'bg-[#1A7A4A] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                                {t === 'map' ? 'Emission Map' : 'Sector Stats'}
                            </button>
                        ))}
                    </div>
                </div>

                {tab === 'map' && (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Map */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-black text-gray-900">National Emission Map</h2>
                                <div className="flex items-center gap-4 text-xs font-medium">
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" />Low</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />Medium</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" />High</span>
                                </div>
                            </div>
                            {/* Simplified India-shaped visual map */}
                            <div className="relative bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl h-96 border border-gray-100 overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center text-blue-100">
                                    <span className="material-symbols-outlined text-9xl">map</span>
                                </div>
                                <p className="absolute top-3 left-3 text-xs text-blue-300 font-bold">INDIA — Regional CO₂ Map</p>
                                {regions.map(r => (
                                    <button
                                        key={r.id}
                                        style={{ top: r.top, left: r.left }}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                        onMouseEnter={() => setHoveredRegion(r.id)}
                                        onMouseLeave={() => setHoveredRegion(null)}
                                        onClick={() => setSelectedRegion(r)}
                                    >
                                        <div className={`w-16 h-16 rounded-full ${levelColor[r.level].bg} backdrop-blur border-2 border-white flex flex-col items-center justify-center transition-all cursor-pointer ${hoveredRegion === r.id ? 'scale-125 shadow-lg' : ''}`}>
                                            <span className="text-white text-xs font-black leading-tight text-center px-1">{r.name.split(' ')[0]}</span>
                                        </div>
                                    </button>
                                ))}
                                {selectedRegion && (
                                    <div className="absolute bottom-4 right-4 bg-white rounded-xl border border-gray-200 p-4 shadow-lg w-52">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-black text-gray-900 text-sm">{selectedRegion.name}</span>
                                            <button onClick={() => setSelectedRegion(null)} className="text-gray-400 hover:text-gray-700"><span className="material-symbols-outlined text-sm">close</span></button>
                                        </div>
                                        <p className="text-xs text-gray-500">Emissions: <span className="font-bold text-gray-900">{selectedRegion.co2}</span></p>
                                        <span className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full capitalize ${levelColor[selectedRegion.level].badge}`}>{selectedRegion.level} intensity</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Region List */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h2 className="font-black text-gray-900 mb-4">Regions</h2>
                            <div className="space-y-3">
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
                )}

                {tab === 'sector' && (
                    <div className="space-y-6">
                        {/* Sector selector */}
                        <div className="flex flex-wrap gap-3">
                            {sectors.map(s => (
                                <button key={s} onClick={() => setSelectedSector(s)} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${selectedSector === s ? 'bg-[#1A7A4A] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1A7A4A]/40'}`}>{s}</button>
                            ))}
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

                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <h2 className="font-black text-gray-900 mb-4">Top Polluters — {selectedSector}</h2>
                                <div className="space-y-3">
                                    {topPolluters.filter(p => selectedSector === 'Manufacturing' ? p.sector === 'Manufacturing' : selectedSector === 'Energy' ? p.sector === 'Energy' : true).slice(0, 5).map((p, i) => (
                                        <div key={i} className="flex items-center justify-between">
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
                )}
            </main>
        </div>
    );
}
