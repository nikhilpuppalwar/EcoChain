import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const queue = [
    { id: 'SUB-2024-0084', company: 'SteelMax Industries', sector: 'Steel Manufacturing', regNo: 'IND-2024-4421', period: 'Q4 2024', aiFlag: 'red', riskScore: 72, deadline: 'Mar 10', priority: 'URGENT', auditType: 'dual', dualRole: 'secondary', dualPartner: 'Dr. Sarah Jenkins', dualPartnerDecision: 'approved', status: 'Pending Review' },
    { id: 'SUB-2024-0081', company: 'AgroChem United', sector: 'Agriculture', regNo: 'IND-2023-8812', period: 'Q4 2024', aiFlag: 'yellow', riskScore: 45, deadline: 'Mar 14', priority: 'HIGH', auditType: 'single', status: 'In Progress' },
    { id: 'SUB-2024-0078', company: 'CoalTech Energy', sector: 'Energy', regNo: 'IND-2022-1145', period: 'Q4 2024', aiFlag: 'green', riskScore: 18, deadline: 'Mar 18', priority: 'NORMAL', auditType: 'dual', dualRole: 'primary', status: 'Pending Review' },
    { id: 'SUB-2024-0075', company: 'GreenTransport Co.', sector: 'Transport', regNo: 'IND-2023-5530', period: 'Annual 2024', aiFlag: 'green', riskScore: 12, deadline: 'Mar 22', priority: 'NORMAL', auditType: 'single', status: 'Pending Review' },
];

const emissionData = {
    scope1: [
        { source: 'Diesel', quantity: '50,000', unit: 'litres', factor: '2.68 kg/L', co2e: 134.0 },
        { source: 'Natural Gas', quantity: '12,000', unit: 'kg', factor: '2.75 kg/kg', co2e: 33.0 },
        { source: 'Coal', quantity: '1,200', unit: 'tonnes', factor: '2.33 kg/kg', co2e: 2796.0 },
    ],
    scope2: [
        { kwh: '280,000', source: 'National Grid', factor: '0.82 kg/kWh', co2e: 229.6 },
    ],
    scope3Logistics: [
        { mode: 'Truck', distance: '45,000 km', cargo: '120 t', factor: '0.0001', co2e: 5.4 },
        { mode: 'Rail', distance: '15,000 km', cargo: '80 t', factor: '0.000028', co2e: 0.3 },
    ],
    scope3Waste: [
        { type: 'Solid', quantity: '800 kg', method: 'Landfill', factor: '0.43', co2e: 0.3 },
        { type: 'Hazardous', quantity: '120 kg', method: 'Incineration', factor: '0.85', co2e: 0.1 },
    ],
    production: { productType: 'Steel Billets', quantity: '1,250', unit: 'tonnes', operatingHours: 720, capacityUtilization: 78 },
    total: { scope1: 2963.0, scope2: 229.6, scope3: 6.1, grand: 3198.7 },
    docs: {
        fuelInvoices: ['invoice_diesel_q4.pdf', 'invoice_gas_oct.pdf', 'invoice_coal_q4.pdf'],
        electricityBills: ['eb_oct_2024.pdf', 'eb_nov_2024.pdf'],
        transportBills: ['transport_q4_2024.pdf'],
        wasteCerts: ['waste_cert_q4.pdf', 'hazmat_cert_2024.pdf'],
        productionReports: ['production_log_q4.pdf'],
    },
};

const baselineData = [
    { period: 'Q1 2023', actual: 3800, baseline: 4200 },
    { period: 'Q2 2023', actual: 3600, baseline: 4100 },
    { period: 'Q3 2023', actual: 4100, baseline: 4000 },
    { period: 'Q4 2023', actual: 3900, baseline: 3950 },
    { period: 'Q1 2024', actual: 3750, baseline: 3900 },
    { period: 'Q4 2024', actual: 3199, baseline: 3900 },
];

const aiResult = {
    riskScore: 72,
    riskFlag: 'red',
    components: { emissionAnomaly: 100, satelliteSmoke: 40, sectorBenchmark: 25 },
    isolationForest: { result: 'ANOMALY DETECTED', prediction: -1 },
    features: [
        { name: 'Production Rate', raw: '1,250 t', scaled: 0.847, outlier: false },
        { name: 'Emission Level', raw: '3,199 tCO₂e', scaled: 1.234, outlier: false },
        { name: 'Fuel Consumption', raw: '62,000 L', scaled: 0.921, outlier: false },
        { name: 'Electricity Usage', raw: '280,000 kWh', scaled: 0.756, outlier: false },
        { name: 'Emission-to-Production Ratio', raw: '2.56', scaled: 2.187, outlier: true },
    ],
    anomalyDetails: [
        { field: 'Emission-to-Production Ratio', submitted: '2.56 tCO₂e/tonne', expectedLow: '1.80', expectedHigh: '2.20', deviation: '+16.4%', explanation: 'Emissions are disproportionately high relative to the production output reported for this period.' },
        { field: 'Fuel Consumption', submitted: '62,000 litres', expectedLow: '38,000', expectedHigh: '52,000', deviation: '+19.2%', explanation: 'Fuel usage is higher than the historical average for this industry and production level.' },
    ],
    smoke: { detected: true, probability: 87.3, score: 40 },
    benchmark: { sector: 'Steel', expected: '2.00 tCO₂e/t', actual: '2.56 tCO₂e/t', deviation: '+28% above benchmark', source: 'GHG Protocol 2023' },
    explanation: 'This submission shows disproportionately high fuel consumption and an emission-to-production ratio 16% above the expected sector range. Combined with satellite imagery indicating smoke activity at 87.3% probability, this submission warrants careful auditor review of all fuel and production documentation.',
    history: [
        { period: 'Q1 2024', flag: 'green', score: 15 },
        { period: 'Q2 2024', flag: 'yellow', score: 45 },
        { period: 'Q3 2024', flag: 'green', score: 22 },
        { period: 'Q4 2024', flag: 'red', score: 72 },
    ],
};

const flagBadge: Record<string, { bg: string; text: string; label: string; bannerBg: string }> = {
    red: { bg: 'bg-red-100', text: 'text-red-700', label: '🔴 RED', bannerBg: 'bg-red-50 border-red-200' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '🟡 YELLOW', bannerBg: 'bg-yellow-50 border-yellow-200' },
    green: { bg: 'bg-green-100', text: 'text-green-700', label: '🟢 GREEN', bannerBg: 'bg-green-50 border-green-200' },
};

export default function AuditQueue() {
    const [selected, setSelected] = useState(queue[0]);
    const [rightTab, setRightTab] = useState<'industry' | 'ai'>('industry');
    const [expandedAnomaly, setExpandedAnomaly] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const filteredQueue = queue.filter(q =>
        q.company.toLowerCase().includes(search.toLowerCase()) ||
        q.id.toLowerCase().includes(search.toLowerCase())
    );

    const badge = flagBadge[aiResult.riskFlag];

    const docCategories = [
        { label: 'Fuel Invoices', key: 'fuelInvoices' as const, icon: 'local_gas_station' },
        { label: 'Electricity Bills', key: 'electricityBills' as const, icon: 'electric_bolt' },
        { label: 'Transport Records', key: 'transportBills' as const, icon: 'local_shipping' },
        { label: 'Waste Certificates', key: 'wasteCerts' as const, icon: 'delete' },
        { label: 'Production Reports', key: 'productionReports' as const, icon: 'factory' },
    ];

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Audit Queue</h1>
                <p className="text-gray-400 text-sm mt-1">{queue.length} submissions awaiting review</p>
            </div>

            <div className="grid lg:grid-cols-5 gap-6 h-[calc(100vh-200px)] min-h-[700px]">
                {/* Left panel: Queue list */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Pending Submissions</p>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">search</span>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by company or reference..."
                                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/30 focus:border-[#1A7A4A]"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                        {filteredQueue.map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setSelected(item); setRightTab('industry'); }}
                                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selected.id === item.id ? 'bg-green-50 border-l-4 border-l-[#1A7A4A]' : ''}`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-black text-gray-900 text-sm">{item.company}</span>
                                    <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${flagBadge[item.aiFlag].bg} ${flagBadge[item.aiFlag].text}`}>
                                        {flagBadge[item.aiFlag].label}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">{item.sector} · {item.period}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs font-mono text-gray-400">{item.id}</span>
                                    <div className="flex items-center gap-2">
                                        {item.auditType === 'dual' && (
                                            <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 uppercase">DUAL</span>
                                        )}
                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${item.priority === 'URGENT' ? 'bg-red-100 text-red-600' : item.priority === 'HIGH' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>{item.priority}</span>
                                        <span className="text-xs text-gray-400">Due {item.deadline}</span>
                                    </div>
                                </div>
                                {/* Dual audit context */}
                                {item.auditType === 'dual' && item.dualRole === 'secondary' && item.dualPartnerDecision && (
                                    <div className="mt-2 text-xs text-purple-700 bg-purple-50 rounded-lg px-2 py-1">
                                        Auditor 2 of 2 — {item.dualPartner} reviewed: <span className="font-bold capitalize">{item.dualPartnerDecision}</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right panel: Review */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    {/* Header + Tab Toggle */}
                    <div className="p-5 border-b border-gray-100">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h2 className="font-black text-gray-900">{selected.company}</h2>
                                <p className="text-xs text-gray-400">{selected.regNo} · {selected.sector} · {selected.period}</p>
                            </div>
                            <span className={`text-xs font-black px-2 py-1 rounded-lg ${flagBadge[selected.aiFlag].bg} ${flagBadge[selected.aiFlag].text}`}>
                                Risk: {selected.riskScore}/100
                            </span>
                        </div>
                        <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
                            {[{ id: 'industry', label: '📊 Industry Data' }, { id: 'ai', label: '🤖 AI Analysis' }].map(t => (
                                <button key={t.id} onClick={() => setRightTab(t.id as 'industry' | 'ai')}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${rightTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                        {/* ─── INDUSTRY DATA TAB ─── */}
                        {rightTab === 'industry' && (
                            <>
                                {/* Scope Summary Bar */}
                                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Emission Summary</p>
                                    <div className="grid grid-cols-4 gap-4 text-center">
                                        {[
                                            { label: 'Scope 1', val: emissionData.total.scope1.toLocaleString(), color: 'text-red-600' },
                                            { label: 'Scope 2', val: emissionData.total.scope2.toLocaleString(), color: 'text-orange-600' },
                                            { label: 'Scope 3', val: emissionData.total.scope3.toLocaleString(), color: 'text-blue-600' },
                                            { label: 'TOTAL', val: emissionData.total.grand.toLocaleString(), color: 'text-gray-900' },
                                        ].map(s => (
                                            <div key={s.label}>
                                                <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
                                                <p className="text-xs text-gray-400">{s.label} tCO₂e</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Scope 1 */}
                                <div>
                                    <h3 className="font-black text-gray-900 mb-2 flex items-center gap-2">
                                        <span className="w-5 h-5 bg-red-100 text-red-600 text-xs rounded-full flex items-center justify-center font-black">1</span>
                                        Scope 1 — Direct Emissions
                                    </h3>
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Fuel Type</th>
                                                <th className="px-3 py-2 text-right">Quantity</th>
                                                <th className="px-3 py-2 text-left">Unit</th>
                                                <th className="px-3 py-2 text-right">Factor</th>
                                                <th className="px-3 py-2 text-right">CO₂e (t)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {emissionData.scope1.map((r, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2.5 font-medium text-gray-900">{r.source}</td>
                                                    <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-600">{r.quantity}</td>
                                                    <td className="px-3 py-2.5 text-xs text-gray-500">{r.unit}</td>
                                                    <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-500">{r.factor}</td>
                                                    <td className="px-3 py-2.5 text-right font-black text-gray-900">{r.co2e.toFixed(1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-red-50 border-t border-red-100">
                                            <tr>
                                                <td colSpan={4} className="px-3 py-2 font-black text-red-700 text-xs">Scope 1 Total</td>
                                                <td className="px-3 py-2 text-right font-black text-red-700">{emissionData.total.scope1.toFixed(1)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {/* Scope 2 */}
                                <div>
                                    <h3 className="font-black text-gray-900 mb-2 flex items-center gap-2">
                                        <span className="w-5 h-5 bg-orange-100 text-orange-600 text-xs rounded-full flex items-center justify-center font-black">2</span>
                                        Scope 2 — Electricity Emissions
                                    </h3>
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                                            <tr>
                                                <th className="px-3 py-2 text-right">kWh Used</th>
                                                <th className="px-3 py-2 text-left">Source</th>
                                                <th className="px-3 py-2 text-right">Factor</th>
                                                <th className="px-3 py-2 text-right">CO₂e (t)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {emissionData.scope2.map((r, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-600">{r.kwh}</td>
                                                    <td className="px-3 py-2.5 font-medium text-gray-900">{r.source}</td>
                                                    <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-500">{r.factor}</td>
                                                    <td className="px-3 py-2.5 text-right font-black text-gray-900">{r.co2e.toFixed(1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-orange-50 border-t border-orange-100">
                                            <tr>
                                                <td colSpan={3} className="px-3 py-2 font-black text-orange-700 text-xs">Scope 2 Total</td>
                                                <td className="px-3 py-2 text-right font-black text-orange-700">{emissionData.total.scope2.toFixed(1)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {/* Scope 3 */}
                                <div>
                                    <h3 className="font-black text-gray-900 mb-2 flex items-center gap-2">
                                        <span className="w-5 h-5 bg-blue-100 text-blue-600 text-xs rounded-full flex items-center justify-center font-black">3</span>
                                        Scope 3 — Supply Chain
                                    </h3>
                                    <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Logistics & Transport</p>
                                    <table className="w-full text-sm mb-3">
                                        <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Mode</th>
                                                <th className="px-3 py-2 text-right">Distance</th>
                                                <th className="px-3 py-2 text-right">Cargo</th>
                                                <th className="px-3 py-2 text-right">CO₂e (t)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {emissionData.scope3Logistics.map((r, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2.5 font-medium text-gray-900">{r.mode}</td>
                                                    <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-600">{r.distance}</td>
                                                    <td className="px-3 py-2.5 text-right text-xs text-gray-600">{r.cargo}</td>
                                                    <td className="px-3 py-2.5 text-right font-black text-gray-900">{r.co2e.toFixed(1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Waste Generation</p>
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Waste Type</th>
                                                <th className="px-3 py-2 text-right">Quantity</th>
                                                <th className="px-3 py-2 text-left">Disposal</th>
                                                <th className="px-3 py-2 text-right">CO₂e (t)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {emissionData.scope3Waste.map((r, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2.5 font-medium text-gray-900">{r.type}</td>
                                                    <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-600">{r.quantity}</td>
                                                    <td className="px-3 py-2.5 text-xs text-gray-600">{r.method}</td>
                                                    <td className="px-3 py-2.5 text-right font-black text-gray-900">{r.co2e.toFixed(1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Production Output */}
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Production Output</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                                        <div><p className="text-xs text-gray-400">Product Type</p><p className="font-bold text-gray-900">{emissionData.production.productType}</p></div>
                                        <div><p className="text-xs text-gray-400">Quantity</p><p className="font-bold text-gray-900">{emissionData.production.quantity} {emissionData.production.unit}</p></div>
                                        <div><p className="text-xs text-gray-400">Operating Hours</p><p className="font-bold text-gray-900">{emissionData.production.operatingHours} hrs</p></div>
                                        <div><p className="text-xs text-gray-400">Capacity Utilization</p><p className="font-bold text-gray-900">{emissionData.production.capacityUtilization}%</p></div>
                                    </div>
                                </div>

                                {/* Supporting Documents */}
                                <div>
                                    <h3 className="font-black text-gray-900 mb-3">📄 Supporting Documents</h3>
                                    <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                                        {docCategories.map(cat => {
                                            const files = emissionData.docs[cat.key];
                                            const missing = files.length === 0;
                                            return (
                                                <div key={cat.key} className={`p-3 ${missing ? 'bg-yellow-50' : 'bg-white'}`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-sm text-gray-400">{cat.icon}</span>
                                                            <span className="font-bold text-gray-800 text-sm">{cat.label}</span>
                                                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${missing ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                {missing ? '⚠️ 0' : files.length}
                                                            </span>
                                                        </div>
                                                        {!missing && <button className="text-xs font-bold text-[#1A7A4A] hover:underline">View All</button>}
                                                    </div>
                                                    {files.map(f => (
                                                        <div key={f} className="flex items-center justify-between py-1.5 pl-6">
                                                            <div className="flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-gray-400 text-sm">picture_as_pdf</span>
                                                                <span className="text-xs text-gray-600">{f}</span>
                                                            </div>
                                                            <button className="text-xs font-bold text-[#1A7A4A] hover:underline flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-xs">visibility</span>View
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Baseline chart */}
                                <div>
                                    <h3 className="font-black text-gray-900 mb-3">Baseline Comparison</h3>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <LineChart data={baselineData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="period" tick={{ fontSize: 9 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
                                            <Line type="monotone" dataKey="baseline" stroke="#1A7A4A" strokeWidth={2} strokeDasharray="5 5" dot={false} name="AI Baseline" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                    <p className="text-xs text-gray-400 text-center mt-1">Red = Actual · Green dashed = AI Baseline</p>
                                </div>
                            </>
                        )}

                        {/* ─── AI ANALYSIS TAB ─── */}
                        {rightTab === 'ai' && (
                            <>
                                {/* AI Result Banner */}
                                <div className={`rounded-xl border p-4 ${badge.bannerBg}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">{aiResult.riskFlag === 'red' ? '🔴' : aiResult.riskFlag === 'yellow' ? '🟡' : '🟢'}</div>
                                        <div className="flex-1">
                                            <p className="font-black text-gray-900 text-lg">{badge.label} FLAG — AI Risk Score: {aiResult.riskScore}/100</p>
                                            <p className="text-sm text-gray-700">IsolationForest: <strong>{aiResult.isolationForest.result}</strong></p>
                                        </div>
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-red-400 bg-white">
                                            <span className="font-black text-red-600 text-lg">{aiResult.riskScore}</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 bg-white/70 rounded-lg p-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div className="h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500" style={{ width: `${aiResult.riskScore}%` }} />
                                            </div>
                                            <span className="text-xs font-mono font-bold text-gray-600">{aiResult.riskScore}/100</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Score Breakdown */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <h3 className="font-black text-gray-900 mb-3">Score Breakdown</h3>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Emission Anomaly', weight: '50%', score: aiResult.components.emissionAnomaly, color: 'bg-red-500' },
                                            { label: 'Satellite / Smoke', weight: '30%', score: aiResult.components.satelliteSmoke, color: 'bg-orange-400' },
                                            { label: 'Sector Benchmark', weight: '20%', score: aiResult.components.sectorBenchmark, color: 'bg-yellow-400' },
                                        ].map(c => (
                                            <div key={c.label}>
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <span className="font-medium text-gray-700">{c.label} <span className="text-gray-400">({c.weight} weight)</span></span>
                                                    <span className="font-black text-gray-900">{c.score} pts</span>
                                                </div>
                                                <div className="bg-gray-100 rounded-full h-2">
                                                    <div className={`h-2 rounded-full ${c.color}`} style={{ width: `${c.score}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* IsolationForest Result */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-black text-gray-900">IsolationForest Model Result</h3>
                                        <span className={`text-sm font-black px-3 py-1 rounded-xl ${aiResult.isolationForest.prediction === -1 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {aiResult.isolationForest.result}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3">Raw prediction: <code className="font-mono bg-gray-100 px-1 rounded">{aiResult.isolationForest.prediction}</code> (−1 = anomaly, 1 = normal)</p>
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Feature</th>
                                                <th className="px-3 py-2 text-right">Raw Value</th>
                                                <th className="px-3 py-2 text-right">Scaled</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {aiResult.features.map((f, i) => (
                                                <tr key={i} className={f.outlier ? 'bg-red-50' : 'hover:bg-gray-50'}>
                                                    <td className="px-3 py-2.5 font-medium text-gray-900 flex items-center gap-1">
                                                        {f.outlier && <span className="text-red-500 text-xs">⚠️</span>}
                                                        {f.name}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-600">{f.raw}</td>
                                                    <td className={`px-3 py-2.5 text-right font-mono font-black text-xs ${f.outlier ? 'text-red-600' : 'text-gray-800'}`}>{f.scaled}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <p className="text-xs text-gray-400 mt-2 italic">Scaled values far from 0 (above 1.5 or below −1.5) indicate potential anomalies</p>
                                </div>

                                {/* Anomaly Details */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <h3 className="font-black text-gray-900 mb-3">Anomaly Details</h3>
                                    <div className="space-y-2">
                                        {aiResult.anomalyDetails.map((a, i) => (
                                            <div key={i} className="border border-orange-200 rounded-xl overflow-hidden">
                                                <button
                                                    className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 transition-colors text-left"
                                                    onClick={() => setExpandedAnomaly(expandedAnomaly === a.field ? null : a.field)}
                                                >
                                                    <span className="font-bold text-orange-800 text-sm flex items-center gap-2">
                                                        <span>⚠️</span>{a.field}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-red-600 bg-red-100 rounded px-2 py-0.5">{a.deviation}</span>
                                                        <span className="material-symbols-outlined text-orange-500 text-sm">{expandedAnomaly === a.field ? 'expand_less' : 'expand_more'}</span>
                                                    </div>
                                                </button>
                                                {expandedAnomaly === a.field && (
                                                    <div className="p-3 text-sm space-y-1.5">
                                                        <div className="flex justify-between"><span className="text-gray-500">Submitted:</span><span className="font-bold text-gray-900">{a.submitted}</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-500">Expected Range:</span><span className="font-bold text-gray-900">{a.expectedLow} – {a.expectedHigh}</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-500">Deviation:</span><span className="font-black text-red-600">{a.deviation}</span></div>
                                                        <p className="text-gray-600 bg-gray-50 rounded-lg p-2 text-xs mt-2">{a.explanation}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Smoke Detection */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <h3 className="font-black text-gray-900 mb-3">Satellite / Site Image Analysis</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-gray-400 text-3xl">satellite_alt</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-gray-900">{aiResult.smoke.detected ? '🔴 SMOKE DETECTED' : '🟢 NO SMOKE DETECTED'}</p>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-gray-600">Smoke probability: <span className="font-bold text-red-600">{aiResult.smoke.probability}%</span></span>
                                                <span className="text-gray-600">Satellite risk score: <span className="font-bold">{aiResult.smoke.score}</span></span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                                    <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${aiResult.smoke.probability}%` }} />
                                                </div>
                                                <span className="text-xs text-gray-400">{aiResult.smoke.probability}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sector Benchmark */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <h3 className="font-black text-gray-900 mb-3">Sector Benchmark — {aiResult.benchmark.sector} Industry</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-green-50 rounded-xl p-3 text-center">
                                            <p className="text-xs text-gray-500 mb-1">Expected Intensity</p>
                                            <p className="font-black text-green-700">{aiResult.benchmark.expected}</p>
                                        </div>
                                        <div className="bg-red-50 rounded-xl p-3 text-center">
                                            <p className="text-xs text-gray-500 mb-1">Actual Intensity</p>
                                            <p className="font-black text-red-700">{aiResult.benchmark.actual}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 text-sm">
                                        <span className="text-gray-500">Deviation:</span>
                                        <span className="font-black text-red-600">{aiResult.benchmark.deviation}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Source: {aiResult.benchmark.source}</p>
                                </div>

                                {/* AI Recommendation */}
                                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-violet-600">psychology</span>
                                        <h3 className="font-black text-violet-900">AI Analysis Summary</h3>
                                    </div>
                                    <p className="text-sm text-violet-800 leading-relaxed">{aiResult.explanation}</p>
                                </div>

                                {/* Historical Pattern */}
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <h3 className="font-black text-gray-900 mb-3">Historical AI Results (Last 4 Periods)</h3>
                                    <div className="space-y-2">
                                        {aiResult.history.map((h, i) => (
                                            <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-lg ${i === aiResult.history.length - 1 ? 'bg-red-50 border border-red-100 font-bold' : 'hover:bg-gray-50'}`}>
                                                <span className="text-sm text-gray-700">{h.period}</span>
                                                <div className="flex items-center gap-3">
                                                    <span>{h.flag === 'green' ? '🟢 GREEN' : h.flag === 'yellow' ? '🟡 YELLOW' : '🔴 RED'}</span>
                                                    <span className="text-xs font-mono text-gray-500">score: {h.score}</span>
                                                    {i === aiResult.history.length - 1 && <span className="text-xs text-red-600 font-bold">← Current</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {aiResult.history.filter(h => h.flag !== 'green').length >= 2 && (
                                        <p className="mt-2 text-xs font-bold text-red-600 bg-red-50 rounded-lg px-3 py-2">⚠️ Repeat offender — flagged 2+ times in last 4 periods</p>
                                    )}
                                </div>

                                {/* Proceed to Decision */}
                                <Link to="/auditor/verify/1"
                                    className="w-full bg-[#1A7A4A] hover:bg-[#15613b] text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-100">
                                    <span className="material-symbols-outlined text-sm">rate_review</span>
                                    Proceed to Decision →
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Action bar (only on industry tab) */}
                    {rightTab === 'industry' && (
                        <div className="p-4 border-t border-gray-100 flex gap-3">
                            <Link to="/auditor/verify/1" className="flex-1 bg-[#1A7A4A] hover:bg-[#15613b] text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                                <span className="material-symbols-outlined text-sm">rate_review</span>
                                Start Review & Verify
                            </Link>
                            <button onClick={() => setRightTab('ai')} className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-sm font-bold">
                                <span className="material-symbols-outlined text-sm">psychology</span>
                                AI Analysis
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
