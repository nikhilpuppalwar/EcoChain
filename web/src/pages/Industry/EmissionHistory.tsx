import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

export default function EmissionHistory() {
    const { user } = useAuthStore();

    // Mock Data
    const [emissions, setEmissions] = useState([
        { id: 'EM-1004', date: '2024-03-10', source: 'Diesel Generators - Plant A', scope: '1', amount: 450, status: 'Verified', certificateUrl: '#' },
        { id: 'EM-1003', date: '2024-02-15', source: 'Corporate Flights (Q1)', scope: '3', amount: 120, status: 'Verified', certificateUrl: '#' },
        { id: 'EM-1002', date: '2024-01-20', source: 'Purchased Electricity - HQ', scope: '2', amount: 380, status: 'Verified', certificateUrl: '#' },
        { id: 'EM-1001', date: '2024-03-18', source: 'Fleet Vehicles (March)', scope: '1', amount: 85, status: 'Pending Review', certificateUrl: null },
    ]);

    const [filter, setFilter] = useState('All');

    const filteredEmissions = emissions.filter(e => {
        if (filter === 'All') return true;
        return e.scope === filter.replace('Scope ', '');
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">Emission History</h1>
                    <p className="text-sm text-slate-500 mt-1">Track and manage your reported emissions and their verification status.</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    {['All', 'Scope 1', 'Scope 2', 'Scope 3'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                <th className="px-6 py-4">Record ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Scope</th>
                                <th className="px-6 py-4 text-right">Amount (tCO₂e)</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEmissions.map((emission) => (
                                <tr key={emission.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono text-sm font-bold text-slate-700">{emission.id}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                        {new Date(emission.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                        {emission.source}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                            Scope {emission.scope}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-bold text-slate-800">
                                        {emission.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                                            ${emission.status === 'Verified' ? 'bg-[#2E9E68]/10 text-[#2E9E68]' : 'bg-amber-100 text-amber-700'}
                                        `}>
                                            {emission.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        {emission.certificateUrl ? (
                                            <button className="text-[#1A7A4A] hover:text-[#13613a] text-sm font-bold flex items-center justify-end gap-1 ml-auto">
                                                <span className="material-symbols-outlined text-[16px]">download</span>
                                                Certificate
                                            </button>
                                        ) : (
                                            <span className="text-slate-400 text-sm italic">In Progress</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredEmissions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        <span className="material-symbols-outlined text-4xl mb-4 text-slate-300">history</span>
                                        <p>No emission records found for this category.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
                    <p>Showing <span className="font-bold text-slate-800">{filteredEmissions.length}</span> records</p>
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-[#1A7A4A]">lock</span>
                        All verified records are permanently anchored to the EcoChain blockchain.
                    </div>
                </div>
            </div>
        </div>
    );
}
