import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function ComplianceMonitor() {
    const { user } = useAuthStore();
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [companies, setCompanies] = useState<any[]>([]);
    const [sectorData, setSectorData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showPenaltyModal, setShowPenaltyModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [penaltyAmount, setPenaltyAmount] = useState('');
    const [penaltyReason, setPenaltyReason] = useState('');
    const [issuing, setIssuing] = useState(false);

    // Modify/Waive penalty states
    const [showModifyModal, setShowModifyModal] = useState(false);
    const [modifyAmount, setModifyAmount] = useState('');
    const [modifyReason, setModifyReason] = useState('');
    const [modifying, setModifying] = useState(false);
    const [waiving, setWaiving] = useState(false);

    const fetchCompliance = async () => {
        try {
            const res = await api.get('/gov/compliance/data');
            if (res.data.success) {
                setCompanies(res.data.data.companies || []);
                setSectorData(res.data.data.sectorData || []);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load compliance data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompliance();
    }, []);

    const filteredCompanies = companies.filter(c => {
        const matchesFilter = filter === 'All' || c.status === filter;
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const openPenaltyModal = (company: any) => {
        setSelectedCompany(company);
        setShowPenaltyModal(true);
    };

    const openModifyModal = (company: any) => {
        setSelectedCompany(company);
        setModifyAmount(String(company.penalty || 0));
        setModifyReason('');
        setShowModifyModal(true);
    };

    const handleIssuePenalty = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompany) return;
        setIssuing(true);
        try {
            const res = await api.post('/gov/compliance/penalty', {
                companyId: selectedCompany.id,
                penaltyAmount: Number(penaltyAmount),
                reason: penaltyReason,
            });
            if (res.data.success) {
                toast.success(`Penalty of ₹${Number(penaltyAmount).toLocaleString()} issued to ${selectedCompany.name}!`);
                setShowPenaltyModal(false);
                setPenaltyAmount('');
                setPenaltyReason('');
                setSelectedCompany(null);
                fetchCompliance();
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to issue penalty');
        } finally {
            setIssuing(false);
        }
    };

    const handleModifyPenalty = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompany) return;
        setModifying(true);
        try {
            const res = await api.patch('/gov/compliance/penalty', {
                companyId: selectedCompany.id,
                penaltyAmount: Number(modifyAmount),
                reason: modifyReason,
            });
            if (res.data.success) {
                toast.success(`Penalty adjusted to ₹${Number(modifyAmount).toLocaleString()} for ${selectedCompany.name}`);
                setShowModifyModal(false);
                setModifyAmount('');
                setModifyReason('');
                setSelectedCompany(null);
                fetchCompliance();
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to modify penalty');
        } finally {
            setModifying(false);
        }
    };

    const handleWaivePenalty = async () => {
        if (!selectedCompany) return;
        if (!window.confirm(`Are you sure you want to waive and clear the entire penalty for ${selectedCompany.name}?`)) return;
        setWaiving(true);
        try {
            const res = await api.delete(`/gov/compliance/penalty/${selectedCompany.id}`);
            if (res.data.success) {
                toast.success(`Penalty successfully cleared for ${selectedCompany.name}`);
                setShowModifyModal(false);
                setSelectedCompany(null);
                fetchCompliance();
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to clear penalty');
        } finally {
            setWaiving(false);
        }
    };

    const [showBatchModal, setShowBatchModal] = useState(false);
    const [batchPenaltyAmount, setBatchPenaltyAmount] = useState('');
    const [batchReason, setBatchReason] = useState('');
    const [batchIssuing, setBatchIssuing] = useState(false);

    const handleBatchIssuePenalties = async (e: React.FormEvent) => {
        e.preventDefault();
        setBatchIssuing(true);
        try {
            const res = await api.post('/gov/compliance/penalty/batch', {
                penaltyAmount: Number(batchPenaltyAmount),
                reason: batchReason,
            });
            if (res.data.success) {
                toast.success(res.data.message || 'Batch penalties successfully assessed!');
                setShowBatchModal(false);
                setBatchPenaltyAmount('');
                setBatchReason('');
                fetchCompliance();
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to issue batch penalties');
        } finally {
            setBatchIssuing(false);
        }
    };

    const handleExportCSV = () => {
        if (companies.length === 0) {
            toast.error('No compliance records to export');
            return;
        }

        const headers = ['Company ID', 'Name', 'Sector', 'Status', 'Total Emissions (tCO2e)', 'Carbon Cap (tCO2e)', 'Credits Purchased', 'Assessed Penalties (INR)'];
        const rows = companies.map(c => [
            c.id,
            `"${c.name.replace(/"/g, '""')}"`,
            c.sector,
            c.status,
            c.emissions,
            c.cap,
            c.creditsPurchased,
            c.penalty
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `ecochain_compliance_report_${new Date().getFullYear()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Compliance roster exported successfully!');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 mt-3 text-slate-500 font-medium text-sm">Loading compliance data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">Compliance & Enforcement</h1>
                    <p className="text-sm text-slate-500 mt-1">Monitor industry adherence to emission caps and issue penalties for non-compliance.</p>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={handleExportCSV}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Export Full Roster
                    </button>
                    <button 
                        onClick={() => setShowBatchModal(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">gavel</span>
                        Batch Issue Penalties
                    </button>
                </div>
            </div>

            {/* Top Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-[#1A7A4A]"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Compliant</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold font-syne text-slate-800">
                            {companies.filter(c => c.status === 'Compliant').length}
                        </h3>
                        <span className="text-sm text-slate-500 font-medium">Orgs</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-amber-400"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">At Risk (Nearing Cap)</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold font-syne text-slate-800">
                            {companies.filter(c => c.status === 'At Risk').length}
                        </h3>
                        <span className="text-sm text-slate-500 font-medium">Orgs</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Non-Compliant</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold font-syne text-red-600">
                            {companies.filter(c => c.status === 'Non-compliant').length}
                        </h3>
                        <span className="text-sm text-slate-500 font-medium">Orgs</span>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
                    <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Total Penalties Assessed</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold font-syne text-white">
                            ₹{(companies.reduce((sum, c) => sum + c.penalty, 0) / 1000).toLocaleString()}k
                        </h3>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <span className="material-symbols-outlined text-8xl">account_balance</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Enforement Table */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            {['All', 'Compliant', 'At Risk', 'Non-compliant'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                            <input
                                type="text"
                                placeholder="Search org or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white sticky top-0 border-b border-slate-200 shadow-[0_1px_0_0_#e2e8f0]">
                                <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                                    <th className="px-6 py-4">Organization</th>
                                    <th className="px-6 py-4 text-right">Net Emissions vs Cap</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Penalty</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCompanies.map((company) => {
                                    const netEmissions = company.emissions - company.creditsPurchased;
                                    const percentOfCap = (netEmissions / company.cap) * 100;

                                    return (
                                        <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800 text-sm">{company.name}</div>
                                                <div className="text-xs text-slate-500 font-mono mt-0.5">{company.id} • {company.sector}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className={`font-bold font-syne ${percentOfCap > 100 ? 'text-red-600' : 'text-slate-800'}`}>
                                                            {netEmissions.toLocaleString()}
                                                        </span>
                                                        <span className="text-xs text-slate-500">/ {company.cap.toLocaleString()}</span>
                                                    </div>
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${percentOfCap <= 80 ? 'bg-[#1A7A4A]' : percentOfCap <= 100 ? 'bg-amber-400' : 'bg-red-500'}`}
                                                            style={{ width: `${Math.min(percentOfCap, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border
                                                ${company.status === 'Compliant' ? 'bg-[#2E9E68]/10 text-[#2E9E68] border-[#2E9E68]/20' :
                                                        company.status === 'At Risk' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                            'bg-red-50 text-red-600 border-red-200'}
                                            `}>
                                                    {company.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {company.penalty > 0 ? (
                                                    <span className="font-bold text-slate-800 text-sm">₹{company.penalty.toLocaleString()}</span>
                                                ) : (
                                                    <span className="text-slate-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                {company.penalty > 0 ? (
                                                    <button
                                                        onClick={() => openModifyModal(company)}
                                                        className="text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-sm"
                                                    >
                                                        Modify Notice
                                                    </button>
                                                ) : company.status === 'Non-compliant' ? (
                                                    <button
                                                        onClick={() => openPenaltyModal(company)}
                                                        className="text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-sm"
                                                    >
                                                        Issue Notice
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => openPenaltyModal(company)}
                                                        className="text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                                                    >
                                                        Custom Notice
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                                {filteredCompanies.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            <p>No organizations found matching the criteria.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sector Analysis Sidebar */}
                <div className="lg:col-span-1 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-lg font-syne text-slate-800">Sector Analysis</h3>
                        <p className="text-xs text-slate-500">Emissions vs Allocated Sector Caps</p>
                    </div>
                    <div className="p-6 flex-1 flex items-center justify-center">
                        <div className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={sectorData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} width={100} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="target" name="Sector Cap" fill="#e2e8f0" barSize={20} radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="emissions" name="Current Emissions" fill="#3b82f6" barSize={20} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="p-4 bg-red-50/50 border-t border-red-100 flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-500 shrink-0">warning</span>
                        <p className="text-xs text-red-800 font-medium">
                            <strong className="font-bold">Alert:</strong> The Manufacturing sector has exceeded its national allocated cap by 16.6%. Immediate sector-wide review recommended.
                        </p>
                    </div>
                </div>
            </div>

            {/* Penalty Modal */}
            {showPenaltyModal && selectedCompany && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
                            <h3 className="font-bold text-red-950 font-syne text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-600">gavel</span>
                                Issue Compliance Penalty
                            </h3>
                            <button 
                                onClick={() => {
                                    setShowPenaltyModal(false);
                                    setSelectedCompany(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleIssuePenalty} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Company</label>
                                <div className="px-4 py-2 bg-slate-50 border border-slate-150 rounded-xl text-sm font-semibold text-slate-800">
                                    {selectedCompany.name}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Penalty Amount (INR / ₹)</label>
                                <input
                                    type="number"
                                    required
                                    value={penaltyAmount}
                                    onChange={(e) => setPenaltyAmount(e.target.value)}
                                    placeholder="e.g. 150000"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Warning Notice Message / Reason</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={penaltyReason}
                                    onChange={(e) => setPenaltyReason(e.target.value)}
                                    placeholder="Provide detailed reasons for this carbon cap enforcement action..."
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPenaltyModal(false);
                                        setSelectedCompany(null);
                                    }}
                                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-bold transition-colors border border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={issuing}
                                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {issuing ? 'Issuing Penalty...' : 'Assess & Issue Penalty'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modify / Waive Penalty Modal */}
            {showModifyModal && selectedCompany && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
                            <h3 className="font-bold text-amber-950 font-syne text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-600">edit_document</span>
                                Review & Modify Penalty
                            </h3>
                            <button 
                                onClick={() => {
                                    setShowModifyModal(false);
                                    setSelectedCompany(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleModifyPenalty} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Company</label>
                                <div className="px-4 py-2 bg-slate-50 border border-slate-150 rounded-xl text-sm font-semibold text-slate-800">
                                    {selectedCompany.name}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Penalty</label>
                                    <div className="px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-sm font-bold text-red-700">
                                        ₹{(selectedCompany.penalty || 0).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">New Penalty (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={modifyAmount}
                                        onChange={(e) => setModifyAmount(e.target.value)}
                                        placeholder="e.g. 100000"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Adjustment Reason / Notes</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={modifyReason}
                                    onChange={(e) => setModifyReason(e.target.value)}
                                    placeholder="Provide a reason for adjusting or waiving this penalty..."
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                                />
                            </div>

                            <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModifyModal(false);
                                            setSelectedCompany(null);
                                        }}
                                        className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-bold transition-colors border border-slate-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={modifying}
                                        className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {modifying ? 'Updating...' : 'Update Penalty'}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleWaivePenalty}
                                    disabled={waiving}
                                    className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors border border-red-200 mt-1"
                                >
                                    {waiving ? 'Clearing Penalty...' : 'Waive & Clear Entire Penalty'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Batch Penalty Modal */}
            {showBatchModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
                            <h3 className="font-bold text-red-950 font-syne text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-600">gavel</span>
                                Batch Issue Penalties
                            </h3>
                            <button 
                                onClick={() => setShowBatchModal(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleBatchIssuePenalties} className="p-6 space-y-4">
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 font-medium leading-relaxed">
                                <strong className="font-bold">Attention:</strong> This action will assess the specified penalty amount against ALL organizations currently flagged as <strong className="font-bold">Non-compliant</strong>.
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Flat Penalty Amount (INR / ₹)</label>
                                <input
                                    type="number"
                                    required
                                    value={batchPenaltyAmount}
                                    onChange={(e) => setBatchPenaltyAmount(e.target.value)}
                                    placeholder="e.g. 150000"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reason / Notice Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={batchReason}
                                    onChange={(e) => setBatchReason(e.target.value)}
                                    placeholder="Provide detailed reasons for this batch enforcement action..."
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowBatchModal(false)}
                                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-bold transition-colors border border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={batchIssuing}
                                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {batchIssuing ? 'Issuing Penalties...' : 'Run Batch Enforcement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
