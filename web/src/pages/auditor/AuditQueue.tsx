import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const mockQueue = [
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
    const { user } = useAuthStore();
    const [queue, setQueue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any>(null);
    const [rightTab, setRightTab] = useState<'industry' | 'ai'>('industry');
    const [expandedAnomaly, setExpandedAnomaly] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const res = await api.get('/audit/queue');
                const backendData = res.data.data || [];
                
                if (backendData.length === 0) {
                    setQueue([]);
                    setLoading(false);
                    return;
                }

                const mappedQueue = backendData.map((entry: any) => {
                    const isDual = entry.assignedAuditors && entry.assignedAuditors.length > 1;
                    const isSecondary = isDual && entry.assignedAuditors[1] === user?._id;
                    
                    const isFlagged = entry.aiFlags && entry.aiFlags.length > 0;
                    const rawStatus = entry.status;
                    let displayStatus = rawStatus.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                    
                    return {
                        id: `SUB-${entry._id.substring(0, 8).toUpperCase()}`,
                        realId: entry._id,
                        company: entry.company?.name || 'Unknown Company',
                        sector: entry.company?.sector || 'General',
                        regNo: entry.company?.registrationNumber || 'N/A',
                        period: `${new Date(2000, entry.periodMonth - 1).toLocaleString('default', { month: 'short' })} ${entry.periodYear}`,
                        aiFlag: entry.aiResult ? entry.aiResult.riskFlag.toLowerCase() : (isFlagged || rawStatus === 'ai_flagged' ? 'red' : 'green'),
                        riskScore: entry.aiResult ? entry.aiResult.riskScore : (isFlagged || rawStatus === 'ai_flagged' ? 82 : 12),
                        aiExplanation: entry.aiResult?.explanation || null,
                        aiAnomalyDetails: entry.aiResult?.anomalyDetails || [],
                        deadline: '7 Days',
                        priority: entry.aiResult?.riskFlag === 'RED' ? 'URGENT' : entry.aiResult?.riskFlag === 'YELLOW' ? 'HIGH' : 'NORMAL',
                        auditType: isDual ? 'dual' : 'single',
                        dualRole: isSecondary ? 'secondary' : 'primary',
                        dualPartner: isSecondary ? 'Primary Auditor' : 'Secondary Auditor',
                        dualPartnerDecision: rawStatus === 'awaiting_second_auditor' ? 'approved' : null,
                        status: displayStatus,
                        originalQuantity: entry.quantityTonnes,
                        emissionSource: entry.emissionSource,
                        location: entry.location,
                        notes: entry.notes
                    };
                });
                
                setQueue(mappedQueue);
                setSelected(mappedQueue[0]);
            } catch (error) {
                console.error("Failed to fetch audit queue", error);
                toast.error("Failed to load audit queue from server.");
                setQueue([]);
            } finally {
                setLoading(false);
            }
        };
        fetchQueue();
    }, [user]);

    const filteredQueue = queue.filter(q =>
        q.company.toLowerCase().includes(search.toLowerCase()) ||
        q.id.toLowerCase().includes(search.toLowerCase())
    );

    const badge = selected ? flagBadge[selected.aiFlag] : flagBadge.green;

    const docCategories = [
        { label: 'Fuel Invoices', key: 'fuelInvoices' as const, icon: 'local_gas_station' },
        { label: 'Electricity Bills', key: 'electricityBills' as const, icon: 'electric_bolt' },
        { label: 'Transport Records', key: 'transportBills' as const, icon: 'local_shipping' },
        { label: 'Waste Certificates', key: 'wasteCerts' as const, icon: 'delete' },
        { label: 'Production Reports', key: 'productionReports' as const, icon: 'factory' },
    ];

    if (loading) {
        return <div className="flex h-[400px] items-center justify-center font-bold text-gray-400">Loading your audit queue...</div>;
    }

    if (!loading && queue.length === 0) {
        return (
            <div className="flex flex-col h-[500px] items-center justify-center bg-white rounded-2xl border border-gray-100">
                <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">fact_check</span>
                <h2 className="text-xl font-black text-gray-900 mb-1">Queue Empty</h2>
                <p className="text-gray-400 text-sm">You have no pending assignments right now.</p>
            </div>
        );
    }

    if (!selected) return null; // Safety catch

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
                            <div className="space-y-6">
                                {/* Basic Summary Bar */}
                                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Emission Summary</p>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <p className="text-3xl font-black text-[#1A7A4A]">{selected.originalQuantity?.toLocaleString() || '0'}</p>
                                            <p className="text-xs text-gray-400 font-bold mt-1">TOTAL tCO₂e</p>
                                        </div>
                                        <div className="flex flex-col items-center justify-center">
                                            <p className="text-sm font-bold text-gray-700">{selected.emissionSource || 'General Source'}</p>
                                            <p className="text-xs text-gray-400 mt-1">Primary Source</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div>
                                    <h3 className="font-black text-gray-900 mb-3">Submission Details</h3>
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 text-sm">
                                        <div className="flex p-3">
                                            <span className="w-1/3 text-gray-500 font-medium">Location</span>
                                            <span className="w-2/3 text-gray-900 font-bold">{selected.location || 'Not specified'}</span>
                                        </div>
                                        <div className="flex p-3">
                                            <span className="w-1/3 text-gray-500 font-medium">Notes & Evidence</span>
                                            <span className="w-2/3 text-gray-900">{selected.notes || 'No notes provided'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Note */}
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-blue-600">info</span>
                                        <h3 className="font-black text-blue-900">Note for Auditor</h3>
                                    </div>
                                    <p className="text-sm text-blue-800 leading-relaxed">
                                        This is a preliminary queue preview. Click "Start Review & Verify" below to see the full submission details, document checklist, and to submit your final decision.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ─── AI ANALYSIS TAB ─── */}
                        {rightTab === 'ai' && (
                            <div className="space-y-6">
                                {selected.aiResult ? (
                                    <>
                                        {/* AI Result Banner */}
                                        <div className={`rounded-xl border p-4 ${selected.aiFlag === 'red' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="text-3xl">{selected.aiFlag === 'red' ? '🔴' : '🟢'}</div>
                                                <div className="flex-1">
                                                    <p className="font-black text-gray-900 text-lg">{selected.aiFlag.toUpperCase()} FLAG — AI Risk Score: {selected.riskScore}/100</p>
                                                    <p className="text-sm text-gray-700">Detailed AI Analysis</p>
                                                </div>
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 bg-white ${selected.aiFlag === 'red' ? 'border-red-400' : 'border-green-400'}`}>
                                                    <span className={`font-black text-lg ${selected.aiFlag === 'red' ? 'text-red-600' : 'text-green-600'}`}>{selected.riskScore}</span>
                                                </div>
                                            </div>
                                            <div className="mt-3 bg-white/70 rounded-lg p-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div className="h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500" style={{ width: `${selected.riskScore}%` }} />
                                                    </div>
                                                    <span className="text-xs font-mono font-bold text-gray-600">{selected.riskScore}/100</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
                                            <h3 className="font-black text-gray-900 mb-3 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-blue-600">psychology</span>
                                                AI Explanation
                                            </h3>
                                            <p className="text-sm text-gray-800 leading-relaxed font-medium">
                                                {selected.aiResult.explanation || "No explanation provided by AI."}
                                            </p>
                                        </div>

                                        {selected.aiResult.anomalyDetails && selected.aiResult.anomalyDetails.length > 0 && (
                                            <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
                                                <h3 className="font-black text-gray-900 mb-3">Anomaly Details</h3>
                                                <div className="space-y-3">
                                                    {selected.aiResult.anomalyDetails.map((a: any, i: number) => (
                                                        <div key={i} className="border border-orange-200 bg-orange-50 rounded-xl p-3 text-sm">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-bold text-orange-900 text-base flex items-center gap-1">⚠️ {a.field}</span>
                                                                <span className="font-black text-red-600 bg-red-100 px-2 py-0.5 rounded text-xs">{a.deviation} Deviation</span>
                                                            </div>
                                                            <div className="text-xs text-gray-600 mt-2 space-y-1">
                                                                <p><strong>Submitted:</strong> {a.submittedValue || a.submitted}</p>
                                                                <p><strong>Expected:</strong> {a.expectedValue || (a.expectedLow + ' - ' + a.expectedHigh)}</p>
                                                                {(a.reasoning || a.explanation) && <p className="bg-white p-2 rounded mt-2 border border-orange-100">{a.reasoning || a.explanation}</p>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center mt-4">
                                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">analytics</span>
                                        <h3 className="font-black text-gray-500 text-lg">No AI Data Available</h3>
                                        <p className="text-sm text-gray-400 mt-1">This submission was not assigned an AI report.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action bar (only on industry tab) */}
                    {rightTab === 'industry' && (
                        <div className="p-4 border-t border-gray-100 flex gap-3">
                            <Link to={`/auditor/verify/${selected.realId}`} className="flex-1 bg-[#1A7A4A] hover:bg-[#15613b] text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
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
