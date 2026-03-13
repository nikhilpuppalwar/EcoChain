import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function ReportReview() {
    const { user } = useAuthStore();
    const [filter, setFilter] = useState('Pending');
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    // Mock Data
    const [reports, setReports] = useState([
        { id: 'REP-7429', company: 'Global Logistics Corp', sector: 'Transportation', submittedDate: '2024-03-20', period: 'Q1 2024', totalEmissions: 1450, status: 'Pending', riskScore: 'Low', aiConfidence: 94 },
        { id: 'REP-7428', company: 'TechFusion Inc', sector: 'Technology', submittedDate: '2024-03-19', period: 'Annual 2023', totalEmissions: 820, status: 'Pending', riskScore: 'Medium', aiConfidence: 78 },
        { id: 'REP-7425', company: 'Nexus Manufacturing', sector: 'Manufacturing', submittedDate: '2024-03-18', period: 'Q1 2024', totalEmissions: 5200, status: 'Under Review', riskScore: 'High', aiConfidence: 62 },
        { id: 'REP-7420', company: 'GreenAgri Solutions', sector: 'Agriculture', submittedDate: '2024-03-15', period: 'Annual 2023', totalEmissions: 310, status: 'Approved', riskScore: 'Low', aiConfidence: 98 },
    ]);

    const filteredReports = reports.filter(r => {
        if (filter === 'All') return true;
        return r.status === filter;
    });

    const handleAction = (id: string, action: 'Approve' | 'Reject' | 'Request Info' | 'Acknowledge') => {
        setReports(reports.map(r => {
            if (r.id === id) {
                if (action === 'Acknowledge') {
                    return { ...r, riskScore: 'Acknowledged', aiConfidence: Math.max(r.aiConfidence, 85) };
                }
                return { ...r, status: action === 'Approve' ? 'Approved' : action === 'Reject' ? 'Rejected' : 'Needs Info' };
            }
            return r;
        }));
        if (action === 'Acknowledge') {
            toast.success("Anomaly acknowledged. Risk status updated.");
            setSelectedReport({ ...selectedReport, riskScore: 'Acknowledged', aiConfidence: Math.max(selectedReport.aiConfidence, 85) });
        } else {
            toast.success(`Report ${action}ed successfully`);
            setSelectedReport(null);
            setReviewNotes('');
        }
    };

    const handleExportBRSR = async () => {
        if (!selectedReport) return;
        setIsExporting(true);
        toast.loading("Generating BRSR Report...", { id: "brsr" });
        try {
            // Mocking the python microservice delay or integrating directly
            await new Promise(r => setTimeout(r, 2000));
            // In a real app we would do:
            // const res = await api.get(`/brsr/generate/${selectedReport.id}`, { responseType: 'blob' });
            // const url = window.URL.createObjectURL(new Blob([res.data]));
            // const link = document.createElement('a');
            // link.href = url;
            // link.setAttribute('download', `BRSR_${selectedReport.company}.pdf`);
            // document.body.appendChild(link);
            // link.click();
            toast.success("BRSR Report downloaded successfully!", { id: "brsr" });
        } catch (error) {
            toast.error("Failed to generate BRSR report", { id: "brsr" });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">Report Review & Verification</h1>
                    <p className="text-sm text-slate-500 mt-1">Audit industry emission reports and AI-generated confidence scores.</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    {['Pending', 'Under Review', 'Approved', 'All'].map(f => (
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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Reports List */}
                <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[700px]">
                    <div className="overflow-x-auto flex-1 p-0">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 shadow-[0_1px_0_0_#e2e8f0]">
                                <tr className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                                    <th className="px-6 py-4">Report Details</th>
                                    <th className="px-6 py-4">Emissions</th>
                                    <th className="px-6 py-4">AI Analysis</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredReports.map((report) => (
                                    <tr
                                        key={report.id}
                                        onClick={() => setSelectedReport(report)}
                                        className={`cursor-pointer transition-colors hover:bg-slate-50 ${selectedReport?.id === report.id ? 'bg-blue-50/50 hover:bg-blue-50/50' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-10 rounded-full ${selectedReport?.id === report.id ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-800">{report.company}</span>
                                                        <span className="text-xs font-mono text-slate-400">{report.id}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                        <span>{report.sector}</span>
                                                        <span>•</span>
                                                        <span>{report.period}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                                            <span className="font-bold font-syne text-slate-800 text-base">{report.totalEmissions.toLocaleString()}</span>
                                            <span className="text-slate-500 ml-1">tCO₂e</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold
                                                    ${report.aiConfidence >= 90 ? 'bg-green-100 text-green-700' :
                                                        report.aiConfidence >= 70 ? 'bg-amber-100 text-amber-700' :
                                                            'bg-red-100 text-red-700'}
                                                `}>
                                                    {report.aiConfidence}%
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded
                                                    ${report.riskScore === 'Low' ? 'bg-slate-100 text-slate-600' :
                                                        report.riskScore === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                                            'bg-red-50 text-red-600 border border-red-200'}
                                                `}>
                                                    {report.riskScore} Risk
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                                ${report.status === 'Approved' ? 'bg-[#2E9E68]/10 text-[#2E9E68]' :
                                                    report.status === 'Pending' ? 'bg-blue-50 text-blue-600' :
                                                        report.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                                                            'bg-amber-50 text-amber-600'}
                                            `}>
                                                {report.status}
                                            </span>
                                            <div className="text-[10px] text-slate-400 mt-1 uppercase pl-1">{report.submittedDate}</div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredReports.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                            <span className="material-symbols-outlined text-4xl mb-4 text-slate-300">inbox</span>
                                            <p>No reports found matching the current filter.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Report Details Sidebar */}
                <div className="xl:col-span-1 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col h-[700px] overflow-hidden">
                    {selectedReport ? (
                        <>
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl font-bold font-syne text-slate-800 leading-tight">{selectedReport.company}</h2>
                                    <div className="flex gap-2 items-center">
                                        <button 
                                            onClick={handleExportBRSR}
                                            disabled={isExporting}
                                            className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg border border-indigo-200 flex items-center gap-1 transition-colors disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">download</span>
                                            {isExporting ? 'Exporting...' : 'BRSR'}
                                        </button>
                                        <span className="text-sm font-mono text-slate-400 bg-white px-2 py-1 border border-slate-200 rounded">{selectedReport.id}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">factory</span>
                                    {selectedReport.sector} Sector • {selectedReport.period}
                                </p>
                            </div>

                            <div className="p-6 flex-1 overflow-auto space-y-6">
                                {/* AI Analysis Summary */}
                                <div className={`p-4 rounded-xl border ${selectedReport.aiConfidence >= 90 ? 'bg-green-50/50 border-green-100' :
                                        selectedReport.aiConfidence >= 70 ? 'bg-amber-50/50 border-amber-100' :
                                            'bg-red-50/50 border-red-100'
                                    }`}>
                                    <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-slate-700">
                                        <span className="material-symbols-outlined text-[16px]">psychology</span>
                                        AI Verification Analysis
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Confidence</p>
                                            <p className={`text-2xl font-bold font-syne ${selectedReport.aiConfidence >= 90 ? 'text-green-600' :
                                                    selectedReport.aiConfidence >= 70 ? 'text-amber-600' :
                                                        'text-red-600'
                                                }`}>{selectedReport.aiConfidence}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Anomaly Risk</p>
                                            <p className="text-lg font-bold text-slate-700">{selectedReport.riskScore}</p>
                                        </div>
                                    </div>
                                    {selectedReport.aiConfidence < 80 && selectedReport.riskScore !== 'Acknowledged' && (
                                        <div className="bg-white p-4 rounded-lg border border-red-100/50 text-sm shadow-sm flex flex-col gap-3">
                                            <div className="text-slate-600">
                                                <span className="font-bold text-red-600">Flag:</span> Reported Scope 2 emissions are 34% lower than industry average for reported production volume. Manual documentation review recommended.
                                            </div>
                                            <button 
                                                onClick={() => handleAction(selectedReport.id, 'Acknowledge')}
                                                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                                                Acknowledge Anomaly
                                            </button>
                                        </div>
                                    )}
                                    {selectedReport.riskScore === 'Acknowledged' && (
                                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-sm text-emerald-800 shadow-sm flex items-center gap-2">
                                            <span className="material-symbols-outlined text-emerald-600 text-[18px]">gpp_good</span>
                                            <span className="font-bold">Anomaly Acknowledged by Government Agent.</span>
                                        </div>
                                    )}
                                </div>

                                {/* Emission Details */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-500 border-b border-slate-100 pb-2">Reported Breakdown</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600">Scope 1 (Direct)</span>
                                            <span className="font-bold text-slate-800">{(selectedReport.totalEmissions * 0.4).toLocaleString()} tCO₂e</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600">Scope 2 (Indirect)</span>
                                            <span className="font-bold text-slate-800">{(selectedReport.totalEmissions * 0.5).toLocaleString()} tCO₂e</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600">Scope 3 (Value Chain)</span>
                                            <span className="font-bold text-slate-800">{(selectedReport.totalEmissions * 0.1).toLocaleString()} tCO₂e</span>
                                        </div>
                                        <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between items-center">
                                            <span className="font-bold text-slate-800 uppercase text-xs tracking-wider">Total Declared</span>
                                            <span className="font-bold font-syne text-lg text-[#1A7A4A]">{selectedReport.totalEmissions.toLocaleString()} tCO₂e</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Evidence & Documents */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-500 border-b border-slate-100 pb-2">Supporting Documents</h3>
                                    <div className="space-y-2">
                                        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors group">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-400">description</span>
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">energy_bills_Q1.pdf</span>
                                            </div>
                                            <span className="material-symbols-outlined text-[18px] text-slate-300 group-hover:text-blue-600">download</span>
                                        </button>
                                        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors group">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-400">table_chart</span>
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">fleet_log_export.csv</span>
                                            </div>
                                            <span className="material-symbols-outlined text-[18px] text-slate-300 group-hover:text-blue-600">download</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Auditor Notes */}
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-500 block">Auditor Notes (Internal)</label>
                                    <textarea
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        rows={3}
                                        placeholder="Add notes before approving or requesting info..."
                                    ></textarea>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-3 gap-2 shrink-0">
                                <button
                                    onClick={() => handleAction(selectedReport.id, 'Request Info')}
                                    className="col-span-1 py-2 bg-white border border-amber-200 text-amber-700 font-bold rounded-lg hover:bg-amber-50 transition-colors text-xs flex flex-col items-center justify-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[18px]">contact_support</span>
                                    Need Info
                                </button>
                                <button
                                    onClick={() => handleAction(selectedReport.id, 'Reject')}
                                    className="col-span-1 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors text-xs flex flex-col items-center justify-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleAction(selectedReport.id, 'Approve')}
                                    className="col-span-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-sm transition-colors text-xs flex flex-col items-center justify-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    Approve
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50/50">
                            <span className="material-symbols-outlined text-6xl mb-4 text-slate-200">plagiarism</span>
                            <h3 className="text-lg font-bold text-slate-600 mb-2">No Report Selected</h3>
                            <p className="text-sm max-w-[200px]">Select a report from the verification queue to view details, AI analysis, and take action.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
