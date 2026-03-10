import { useState } from 'react';
import toast from 'react-hot-toast';

const emissionFactors = [
    { id: 1, source: 'Coal (Bituminous)', unit: 'kg/tonne', factor: 2330, scope: 'Scope 1', lastUpdated: '2024-01-15' },
    { id: 2, source: 'Natural Gas', unit: 'kg/m³', factor: 1.89, scope: 'Scope 1', lastUpdated: '2024-01-15' },
    { id: 3, source: 'Diesel', unit: 'kg/litre', factor: 2.68, scope: 'Scope 1', lastUpdated: '2024-01-15' },
    { id: 4, source: 'Grid Electricity (India)', unit: 'kg/kWh', factor: 0.716, scope: 'Scope 2', lastUpdated: '2024-03-01' },
    { id: 5, source: 'Petrol', unit: 'kg/litre', factor: 2.31, scope: 'Scope 1', lastUpdated: '2024-01-15' },
];

export default function AdminConfig() {
    const [tab, setTab] = useState<'factors' | 'ai' | 'blockchain'>('factors');
    const [factors, setFactors] = useState(emissionFactors);
    const [anomalyThreshold, setAnomalyThreshold] = useState(75);
    const [forecastHorizon, setForecastHorizon] = useState(6);
    const [fraudSensitivity, setFraudSensitivity] = useState(60);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">System Configuration</h1>
                    <p className="text-gray-400 text-sm mt-1">Emission factors, AI model settings, and blockchain configuration</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                    {[{ id: 'factors', label: 'Emission Factors' }, { id: 'ai', label: 'AI Config' }, { id: 'blockchain', label: 'Blockchain' }].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id as 'factors' | 'ai' | 'blockchain')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.id ? 'bg-[#1A7A4A] text-white' : 'text-gray-500 hover:text-gray-900'}`}>{t.label}</button>
                    ))}
                </div>
            </div>

            {tab === 'factors' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">Based on IPCC AR5 GWP values. Last global update: March 1, 2024</p>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-1.5 text-sm font-bold text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                                <span className="material-symbols-outlined text-sm">upload</span>Import CSV
                            </button>
                            <button onClick={() => toast.success('Factors exported!')} className="flex items-center gap-1.5 text-sm font-bold text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                                <span className="material-symbols-outlined text-sm">download</span>Export CSV
                            </button>
                            <button className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#1A7A4A] px-4 py-2 rounded-xl hover:bg-[#15613b] transition-colors">
                                <span className="material-symbols-outlined text-sm">add</span>Add Factor
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3 text-left">Emission Source</th>
                                    <th className="px-5 py-3 text-left">Scope</th>
                                    <th className="px-5 py-3 text-left">Factor (kg CO₂e)</th>
                                    <th className="px-5 py-3 text-left">Unit</th>
                                    <th className="px-5 py-3 text-left">Last Updated</th>
                                    <th className="px-5 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {factors.map((f) => (
                                    <tr key={f.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-4 font-bold text-gray-900">{f.source}</td>
                                        <td className="px-5 py-4"><span className={`text-xs font-black px-2 py-0.5 rounded-full ${f.scope === 'Scope 1' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>{f.scope}</span></td>
                                        <td className="px-5 py-4">
                                            <input
                                                type="number"
                                                step="0.01"
                                                defaultValue={f.factor}
                                                onBlur={e => setFactors(factors.map(ff => ff.id === f.id ? { ...ff, factor: parseFloat(e.target.value) } : ff))}
                                                className="border border-gray-200 rounded-lg px-2 py-1 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 font-mono"
                                            />
                                        </td>
                                        <td className="px-5 py-4 text-gray-500 font-mono text-xs">{f.unit}</td>
                                        <td className="px-5 py-4 text-xs text-gray-400">{f.lastUpdated}</td>
                                        <td className="px-5 py-4">
                                            <button onClick={() => toast.success('Saved!')} className="text-xs font-bold text-[#1A7A4A] border border-[#1A7A4A]/30 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors">Save</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'ai' && (
                <div className="space-y-5 max-w-2xl">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <div>
                                    <label className="font-black text-gray-900">Anomaly Detection Threshold</label>
                                    <p className="text-xs text-gray-400">Risk score above this triggers manual review</p>
                                </div>
                                <span className="text-2xl font-black text-[#1A7A4A]">{anomalyThreshold}</span>
                            </div>
                            <input type="range" min={50} max={95} value={anomalyThreshold} onChange={e => setAnomalyThreshold(parseInt(e.target.value))} className="w-full accent-[#1A7A4A]" />
                            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Sensitive (50)</span><span>Strict (95)</span></div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <div>
                                    <label className="font-black text-gray-900">Forecast Horizon (months)</label>
                                    <p className="text-xs text-gray-400">Prophet model future prediction window</p>
                                </div>
                                <span className="text-2xl font-black text-[#1A7A4A]">{forecastHorizon}mo</span>
                            </div>
                            <input type="range" min={3} max={24} value={forecastHorizon} onChange={e => setForecastHorizon(parseInt(e.target.value))} className="w-full accent-[#1A7A4A]" />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <div>
                                    <label className="font-black text-gray-900">Fraud Detection Sensitivity</label>
                                    <p className="text-xs text-gray-400">How aggressively to flag suspicious patterns</p>
                                </div>
                                <span className="text-2xl font-black text-[#1A7A4A]">{fraudSensitivity}%</span>
                            </div>
                            <input type="range" min={30} max={90} value={fraudSensitivity} onChange={e => setFraudSensitivity(parseInt(e.target.value))} className="w-full accent-[#1A7A4A]" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-black text-gray-900 mb-4">Model Performance Metrics</h3>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            {[{ label: 'Anomaly F1 Score', val: '0.924' }, { label: 'Forecast MAE', val: '142 tCO₂e' }, { label: 'Fraud Precision', val: '0.88' }].map(m => (
                                <div key={m.label} className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-black text-[#1A7A4A]">{m.val}</p>
                                    <p className="text-xs text-gray-400 mt-1">{m.label}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => toast.success('Model retraining queued!')} className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#1A7A4A]/40 text-[#1A7A4A] font-bold rounded-xl hover:bg-green-50 transition-colors">
                            <span className="material-symbols-outlined text-sm">model_training</span>
                            Trigger Manual Retraining
                        </button>
                    </div>
                </div>
            )}

            {tab === 'blockchain' && (
                <div className="space-y-4 max-w-2xl">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-black text-gray-900 mb-4">Network Status</h3>
                        <div className="space-y-3">
                            {[{ label: 'Polygon Mainnet', status: 'LIVE', latency: '180ms' }, { label: 'IPFS (Web3.Storage)', status: 'LIVE', latency: '240ms' }, { label: 'The Graph Indexer', status: 'LIVE', latency: '320ms' }].map(n => (
                                <div key={n.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="font-bold text-gray-900 text-sm">{n.label}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-400">{n.latency}</span>
                                        <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{n.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-black text-gray-900 mb-4">Contract Addresses (Polygon)</h3>
                        <div className="space-y-3">
                            {['AuditRegistry.sol', 'CarbonCredit.sol (ERC-20)', 'CarbonMarketplace.sol', 'CreditRetirement.sol', 'AccessControl.sol'].map((c, i) => (
                                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                                    <span className="text-sm font-bold text-gray-700">{c}</span>
                                    <span className="font-mono text-xs text-[#1A7A4A]">0x{Math.random().toString(16).slice(2, 10)}...</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
