import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const queue = [
    { id: 'SUB-2024-0084', company: 'SteelMax Industries', sector: 'Manufacturing', period: 'Q4 2024', aiStatus: 'clean', deadline: 'Mar 10', priority: 'URGENT', co2: 4200, auditType: 'dual', dualStatus: 'awaiting_second' },
    { id: 'SUB-2024-0081', company: 'AgroChem United', sector: 'Agriculture', period: 'Q4 2024', aiStatus: 'flagged', deadline: 'Mar 14', priority: 'HIGH', co2: 2800, auditType: 'single' },
    { id: 'SUB-2024-0078', company: 'CoalTech Energy', sector: 'Energy', period: 'Q4 2024', aiStatus: 'clean', deadline: 'Mar 18', priority: 'NORMAL', co2: 8900, auditType: 'dual', dualStatus: 'first_completed' },
    { id: 'SUB-2024-0075', company: 'GreenTransport Co.', sector: 'Transport', period: 'Annual 2024', aiStatus: 'clean', deadline: 'Mar 22', priority: 'NORMAL', co2: 1400, auditType: 'single' },
];

const baselineData = [
    { period: 'Q1 2023', actual: 3800, baseline: 4200 },
    { period: 'Q2 2023', actual: 3600, baseline: 4100 },
    { period: 'Q3 2023', actual: 4100, baseline: 4000 },
    { period: 'Q4 2023', actual: 3900, baseline: 3950 },
    { period: 'Q1 2024', actual: 3750, baseline: 3900 },
    { period: 'Q4 2024', actual: 4200, baseline: 3900 },
];

const emissionBreakdown = [
    { source: 'Coal Combustion', scope: 'Scope 1', quantity: '1,200 tonnes', co2: '2,800 tCO₂e', factor: 2.33 },
    { source: 'Grid Electricity', scope: 'Scope 2', quantity: '520,000 kWh', co2: '1,040 tCO₂e', factor: 0.002 },
    { source: 'Natural Gas', scope: 'Scope 1', quantity: '48,000 m³', co2: '90 tCO₂e', factor: 0.002 },
    { source: 'Refrigerants', scope: 'Scope 1', quantity: '12 kg R-134a', co2: '14 tCO₂e', factor: 1.15 },
    { source: 'Business Travel', scope: 'Scope 3', quantity: '45,000 km', co2: '6 tCO₂e', factor: 0.0001 },
];

export default function AuditQueue() {
    const [selected, setSelected] = useState(queue[0]);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-black text-gray-900">Audit Queue</h1>
                <p className="text-gray-400 text-sm mt-1">{queue.length} submissions awaiting review</p>
            </div>

            <div className="grid lg:grid-cols-5 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
                {/* Left panel: Queue list */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending Submissions</p>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                        {queue.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setSelected(item)}
                                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selected.id === item.id ? 'bg-green-50 border-l-4 border-l-[#1A7A4A]' : ''}`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-black text-gray-900 text-sm">{item.company}</span>
                                    <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${item.aiStatus === 'clean' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {item.aiStatus === 'clean' ? '✅ Clean' : '⚠️ Flagged'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">{item.sector} · {item.period}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs font-mono text-gray-400">{item.id}</span>
                                    <div className="flex items-center gap-2">
                                        {item.auditType === 'dual' && (
                                            <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 uppercase">Dual</span>
                                        )}
                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${item.priority === 'URGENT' ? 'bg-red-100 text-red-600' : item.priority === 'HIGH' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>{item.priority}</span>
                                        <span className="text-xs text-gray-400">Due {item.deadline}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right panel: Review */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="font-black text-gray-900">{selected.company}</h2>
                            <p className="text-xs text-gray-400">Submission {selected.id} · {selected.period}</p>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-black ${selected.aiStatus === 'clean' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <span className="material-symbols-outlined text-sm">{selected.aiStatus === 'clean' ? 'check_circle' : 'warning'}</span>
                            AI: {selected.aiStatus === 'clean' ? 'No anomalies detected' : 'Anomaly flagged — review carefully'}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                        {/* AI Risk score */}
                        {selected.aiStatus === 'flagged' && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-red-600">warning</span>
                                    <span className="font-black text-red-700">AI Anomaly Report — Risk Score: 78/100</span>
                                </div>
                                <p className="text-sm text-red-600">Scope 1 emissions 42% above sector benchmark. Coal combustion values inconsistent with production output. Review fuel consumption logs carefully.</p>
                            </div>
                        )}

                        {/* Emission breakdown table */}
                        <div>
                            <h3 className="font-black text-gray-900 mb-3">Emission Data Breakdown</h3>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Source</th>
                                        <th className="px-3 py-2 text-left">Scope</th>
                                        <th className="px-3 py-2 text-right">Quantity</th>
                                        <th className="px-3 py-2 text-right">CO₂e</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {emissionBreakdown.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-3 py-2.5 font-medium text-gray-900">{row.source}</td>
                                            <td className="px-3 py-2.5"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${row.scope === 'Scope 1' ? 'bg-red-100 text-red-600' : row.scope === 'Scope 2' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{row.scope}</span></td>
                                            <td className="px-3 py-2.5 text-right font-mono text-gray-600 text-xs">{row.quantity}</td>
                                            <td className="px-3 py-2.5 text-right font-black text-gray-900">{row.co2}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 border-t border-gray-200">
                                    <tr>
                                        <td colSpan={3} className="px-3 py-2.5 font-black text-gray-900">Total CO₂e</td>
                                        <td className="px-3 py-2.5 text-right font-black text-[#1A7A4A]">{selected.co2.toLocaleString()} tCO₂e</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Baseline chart */}
                        <div>
                            <h3 className="font-black text-gray-900 mb-3">Baseline Comparison</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={baselineData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
                                    <Line type="monotone" dataKey="baseline" stroke="#1A7A4A" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Baseline" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Supporting docs */}
                        <div>
                            <h3 className="font-black text-gray-900 mb-3">Supporting Documents</h3>
                            <div className="space-y-2">
                                {['Fuel Purchase Invoices Q4.pdf', 'Electricity Bills Oct-Dec 2024.pdf', 'Production Log Q4 2024.xlsx'].map(doc => (
                                    <div key={doc} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gray-400 text-sm">picture_as_pdf</span>
                                            <span className="text-sm text-gray-700">{doc}</span>
                                        </div>
                                        <button className="text-xs font-bold text-[#1A7A4A] hover:underline">View</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action bar */}
                    <div className="p-4 border-t border-gray-100 flex gap-3">
                        <Link to="/auditor/verify/1" className="flex-1 bg-[#1A7A4A] hover:bg-[#15613b] text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                            <span className="material-symbols-outlined text-sm">rate_review</span>
                            Start Review & Verify
                        </Link>
                        <button className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
