import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function AiForecast() {
    const { user } = useAuthStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [hasForecast, setHasForecast] = useState(false);

    // Mock initial and projected data
    const historicalData = [
        { name: 'Jan', value: 1800 },
        { name: 'Feb', value: 1750 },
        { name: 'Mar', value: 1680 },
        { name: 'Apr', value: 1720 },
        { name: 'May', value: 1600 },
        { name: 'Jun', value: 1550 },
    ];

    const forecastData = [
        ...historicalData,
        { name: 'Jul', value: 1500, isForecast: true },
        { name: 'Aug', value: 1450, isForecast: true },
        { name: 'Sep', value: 1380, isForecast: true },
        { name: 'Oct', value: 1300, isForecast: true },
        { name: 'Nov', value: 1250, isForecast: true },
        { name: 'Dec', value: 1180, isForecast: true },
    ];

    const generateForecast = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setHasForecast(true);
            setIsGenerating(false);
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <span className="material-symbols-outlined">auto_awesome</span>
                        <h1 className="text-2xl font-bold font-syne text-slate-800">AI Emission Forecast</h1>
                    </div>
                    <p className="text-sm text-slate-500 max-w-2xl">
                        Leverage our proprietary machine learning models to predict your future carbon trajectory based on historical data, industry trends, and planned reductions.
                    </p>
                </div>
                {hasForecast && (
                    <button className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-50 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Export Report
                    </button>
                )}
            </div>

            {!hasForecast ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 relative">
                        {isGenerating && (
                            <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                        )}
                        <span className={`material-symbols-outlined text-4xl text-blue-600 ${isGenerating ? 'animate-pulse' : ''}`}>psychology</span>
                    </div>
                    <h2 className="text-xl font-bold font-syne text-slate-800 mb-3">
                        {isGenerating ? 'Analyzing historical data and market trends...' : 'Ready to generate your Q3-Q4 forecast?'}
                    </h2>
                    <p className="text-slate-500 mb-8 max-w-md">
                        {isGenerating
                            ? 'Our models are calculating projected emissions, required credit purchases, and compliance risks based on your current trajectory.'
                            : 'Generate a 6-month forward-looking projection to optimize your credit purchasing strategy and ensure compliance.'}
                    </p>
                    <button
                        onClick={generateForecast}
                        disabled={isGenerating}
                        className={`px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md shadow-blue-600/20 transition-all flex items-center gap-2
                            ${isGenerating ? 'opacity-80 cursor-not-allowed' : 'hover:bg-blue-700 active:scale-[0.98]'}`}
                    >
                        {isGenerating ? 'Processing...' : 'Run Analysis'}
                        {!isGenerating && <span className="material-symbols-outlined text-[18px]">play_arrow</span>}
                    </button>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-md">
                            <span className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-2 block">Projected Total (H2)</span>
                            <div className="flex items-baseline gap-2 mb-2">
                                <h3 className="text-4xl font-bold font-syne">8,060</h3>
                                <span className="text-blue-200 font-medium">tCO₂e</span>
                            </div>
                            <div className="flex items-center text-sm text-green-300 font-medium mt-4">
                                <span className="material-symbols-outlined text-[16px] mr-1">trending_down</span>
                                -12.4% vs H1 2024
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                            <span className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2 block">Credit Deficit Risk</span>
                            <div className="flex items-baseline gap-2 mb-2">
                                <h3 className="text-4xl font-bold font-syne text-amber-500">450</h3>
                                <span className="text-slate-500 font-medium">CCR</span>
                            </div>
                            <div className="flex items-center text-sm text-slate-500 font-medium mt-4">
                                <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                                Required purchase by Nov 15th
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                            <span className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2 block">Compliance Probability</span>
                            <div className="flex items-baseline gap-2 mb-2">
                                <h3 className="text-4xl font-bold font-syne text-[#1A7A4A]">92%</h3>
                            </div>
                            <div className="flex items-center text-sm text-slate-500 font-medium mt-4">
                                <span className="w-2 h-2 rounded-full bg-[#1A7A4A] mr-2"></span>
                                Highly likely to meet annual target
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-lg font-syne text-slate-800 mb-6">6-Month Emission Projection</h3>
                        <div className="min-h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={forecastData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <ReferenceLine x="Jun" stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#64748b', fontSize: 12 }} />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#94a3b8"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorHistorical)"
                                        activeDot={{ r: 6 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                        <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">lightbulb</span>
                            AI Recommendations
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">Purchase 450 CCRs by Q3</p>
                                    <p className="text-sm text-slate-600 mt-1">Based on projected Scope 2 emissions from planned factory expansion in September. Buying early mitigates price volatility risk.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="material-symbols-outlined text-[18px]">factory</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">Optimize Heating Systems in Q4</p>
                                    <p className="text-sm text-slate-600 mt-1">Historical data indicates a 25% spike in heating emissions in Nov/Dec. Preemptive maintenance could reduce this by ~80 tCO₂e.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
