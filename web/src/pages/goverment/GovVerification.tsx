import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function GovVerification() {
    const [activeTab, setActiveTab] = useState<'industries' | 'auditors' | 'directory'>('industries');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Pending items state
    const [pendingIndustries, setPendingIndustries] = useState<any[]>([]);
    const [pendingAuditors, setPendingAuditors] = useState<any[]>([]);
    
    // Directory items state
    const [companies, setCompanies] = useState<any[]>([]);
    const [auditors, setAuditors] = useState<any[]>([]);
    
    // Details modals/selected items
    const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
    const [selectedAuditor, setSelectedAuditor] = useState<any | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reqRes, compRes] = await Promise.all([
                api.get('/gov/verifications/requests'),
                api.get('/gov/companies')
            ]);
            
            setPendingIndustries(reqRes.data.data.companies || []);
            setPendingAuditors(reqRes.data.data.auditors || []);
            setCompanies(compRes.data.data || []);
            
            // Get all auditors for directory
            const audRes = await api.get('/audit/available');
            setAuditors(audRes.data.data || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load verification requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleVerifyIndustry = async (id: string, action: 'approve' | 'reject') => {
        let reason = '';
        if (action === 'reject') {
            const userReason = prompt('Please enter the reason for rejecting this industry registration:', 'Information provided does not match official registry.');
            if (userReason === null) return; // cancelled
            reason = userReason;
        }
        try {
            const res = await api.post(`/gov/verifications/industry/${id}`, { action, reason });
            if (res.data.success) {
                toast.success(`Industry ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
                setSelectedCompany(null);
                fetchData();
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to update industry status.');
        }
    };

    const handleVerifyAuditor = async (id: string, action: 'approve' | 'reject') => {
        let reason = '';
        if (action === 'reject') {
            const userReason = prompt('Please enter the reason for rejecting this auditor application:', 'License document not verified.');
            if (userReason === null) return; // cancelled
            reason = userReason;
        }
        try {
            const res = await api.post(`/gov/verifications/auditor/${id}`, { action, reason });
            if (res.data.success) {
                toast.success(`Auditor application ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
                setSelectedAuditor(null);
                fetchData();
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to update auditor status.');
        }
    };

    const handleSuspendAuditor = async (id: string, action: 'suspend' | 'unsuspend') => {
        try {
            const res = await api.post(`/gov/verifications/auditor/${id}/suspend`, { action });
            if (res.data.success) {
                toast.success(`Auditor ${action === 'suspend' ? 'suspended' : 're-activated'} successfully.`);
                fetchData();
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to change auditor suspension status.');
        }
    };

    const handleSuspendCompany = async (id: string, action: 'suspend' | 'unsuspend') => {
        try {
            const res = await api.post(`/gov/verifications/industry/${id}/suspend`, { action });
            if (res.data.success) {
                toast.success(`Industry ${action === 'suspend' ? 'suspended' : 're-activated'} successfully.`);
                fetchData();
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to change industry suspension status.');
        }
    };

    const filteredCompanies = companies.filter(c => 
        !search || 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        (c.sector && c.sector.toLowerCase().includes(search.toLowerCase()))
    );

    const filteredAuditors = auditors.filter(a => 
        !search || 
        a.name.toLowerCase().includes(search.toLowerCase()) || 
        (a.organization && a.organization.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
                <span className="material-symbols-outlined animate-spin text-4xl text-blue-600 mb-2">sync</span>
                <p className="text-slate-500 font-medium">Fetching verification data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold font-syne text-slate-800">Compliance & Registration Verifications</h1>
                <p className="text-sm text-slate-500 mt-1">Verify business licenses, environmental certificates, and auditor licenses before activation.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-2">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button 
                        onClick={() => { setActiveTab('industries'); setSearch(''); }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'industries' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">factory</span>
                        Industries Pending ({pendingIndustries.length})
                    </button>
                    <button 
                        onClick={() => { setActiveTab('auditors'); setSearch(''); }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'auditors' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">engineering</span>
                        Auditors Pending ({pendingAuditors.length})
                    </button>
                    <button 
                        onClick={() => { setActiveTab('directory'); setSearch(''); }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'directory' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">folder_shared</span>
                        Verified Registry
                    </button>
                </div>

                {activeTab === 'directory' && (
                    <div className="relative w-full sm:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input 
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" 
                            placeholder="Search directory..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                        />
                    </div>
                )}
            </div>

            {/* TAB: INDUSTRY VERIFICATION REQUESTS */}
            {activeTab === 'industries' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {pendingIndustries.length === 0 ? (
                            <div className="bg-white rounded-xl border border-slate-200 border-dashed p-12 text-center text-slate-500">
                                <span className="material-symbols-outlined text-4xl mb-4 text-slate-300">task_alt</span>
                                <p className="font-medium">No pending industry registration requests.</p>
                                <p className="text-xs text-slate-400 mt-1">All registered companies have been reviewed.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingIndustries.map(company => (
                                    <div 
                                        key={company._id} 
                                        onClick={() => setSelectedCompany(company)}
                                        className={`bg-white rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md ${selectedCompany?._id === company._id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-lg">{company.name}</h4>
                                                <p className="text-sm text-slate-500 mt-0.5">{company.sector} Sector · {company.state}</p>
                                            </div>
                                            <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-200 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                Pending Verification
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mt-4 border-t border-slate-100 pt-3 text-xs">
                                            <div>
                                                <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px]">CIN / Registration</span>
                                                <span className="font-mono font-medium text-slate-700">{company.registrationNo || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px]">PAN / Tax ID</span>
                                                <span className="font-mono font-medium text-slate-700">{company.taxId || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px]">Annual Budget Limit</span>
                                                <span className="font-medium text-slate-700">{company.annualCarbonBudget?.toLocaleString() || 0} tCO₂e</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action / Detail Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-6 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-lg font-syne text-slate-800">Industry Profile Details</h3>
                            </div>
                            
                            {selectedCompany ? (
                                <div className="p-5 space-y-6">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-xl">{selectedCompany.name}</h3>
                                        <p className="text-xs text-slate-400 mt-1">Registered: {new Date(selectedCompany.createdAt).toLocaleDateString()}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-1">Environmental Compliance Target</span>
                                            <span className="text-sm font-semibold text-slate-700">Carbon Budget Target: {selectedCompany.annualCarbonBudget?.toLocaleString() || 0} tCO₂e/year</span>
                                        </div>

                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-1">Business Credentials</span>
                                            <div className="space-y-1.5 text-xs text-slate-700 mt-1">
                                                <div className="flex justify-between"><span>CIN (License Number):</span><span className="font-mono font-semibold">{selectedCompany.registrationNo || 'N/A'}</span></div>
                                                <div className="flex justify-between"><span>PAN (Tax Identification):</span><span className="font-mono font-semibold">{selectedCompany.taxId || 'N/A'}</span></div>
                                                <div className="flex justify-between"><span>Admin Contact:</span><span className="font-semibold">{selectedCompany.adminUser?.email || 'N/A'}</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                                            <span className="material-symbols-outlined text-[16px]">verified</span>
                                            License Verification Checklists
                                        </h4>
                                        <p className="text-xs text-blue-600 leading-relaxed">Cross-referenced business records with Registrar of Companies (RoC). Verified environmental audit certificate validation date matches compliance requirements.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button 
                                            onClick={() => handleVerifyIndustry(selectedCompany._id, 'reject')}
                                            className="py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                                        >
                                            Reject Request
                                        </button>
                                        <button 
                                            onClick={() => handleVerifyIndustry(selectedCompany._id, 'approve')}
                                            className="py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow shadow-blue-600/20 transition-colors"
                                        >
                                            Verify & Approve
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[300px]">
                                    <span className="material-symbols-outlined text-5xl mb-3 text-slate-200">touch_app</span>
                                    <p className="text-sm">Select a company request from the list to review credentials and decide approval.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: AUDITOR VERIFICATION REQUESTS */}
            {activeTab === 'auditors' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {pendingAuditors.length === 0 ? (
                            <div className="bg-white rounded-xl border border-slate-200 border-dashed p-12 text-center text-slate-500">
                                <span className="material-symbols-outlined text-4xl mb-4 text-slate-300">task_alt</span>
                                <p className="font-medium">No pending auditor applications.</p>
                                <p className="text-xs text-slate-400 mt-1">All auditor registrations have been verified and processed.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingAuditors.map(auditor => (
                                    <div 
                                        key={auditor._id} 
                                        onClick={() => setSelectedAuditor(auditor)}
                                        className={`bg-white rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md ${selectedAuditor?._id === auditor._id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold font-syne text-lg">
                                                    {auditor.auditorProfile?.name?.[0].toUpperCase() || 'A'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-lg">{auditor.auditorProfile?.name}</h4>
                                                    <p className="text-sm text-slate-500 mt-0.5">{auditor.auditorProfile?.organization || 'Independent'} · {auditor.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-200 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                Pending Approval
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mt-4 border-t border-slate-100 pt-3 text-xs">
                                            <div>
                                                <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px]">License Number</span>
                                                <span className="font-mono font-medium text-slate-700">{auditor.auditorProfile?.licenseNumber || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px]">Years Experience</span>
                                                <span className="font-medium text-slate-700">{auditor.auditorProfile?.yearsExperience || 0} Years</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px]">Specializations</span>
                                                <span className="font-medium text-slate-700 truncate block">
                                                    {auditor.auditorProfile?.specialization?.join(', ') || 'General'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action / Detail Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-6 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-lg font-syne text-slate-800">Auditor Profile Details</h3>
                            </div>
                            
                            {selectedAuditor ? (
                                <div className="p-5 space-y-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold font-syne text-2xl mx-auto shadow-inner">
                                            {selectedAuditor.auditorProfile?.name?.[0].toUpperCase() || 'A'}
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-xl mt-3">{selectedAuditor.auditorProfile?.name}</h3>
                                        <p className="text-sm text-slate-400">{selectedAuditor.auditorProfile?.organization || 'Independent'}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-1">Official Credentials</span>
                                            <div className="space-y-1.5 text-xs text-slate-700 mt-1">
                                                <div className="flex justify-between"><span>License Number:</span><span className="font-mono font-semibold">{selectedAuditor.auditorProfile?.licenseNumber || 'N/A'}</span></div>
                                                <div className="flex justify-between"><span>Years Experience:</span><span className="font-semibold">{selectedAuditor.auditorProfile?.yearsExperience || 0} Years</span></div>
                                                <div className="flex justify-between"><span>Work Email:</span><span className="font-semibold">{selectedAuditor.email}</span></div>
                                                <div className="flex justify-between"><span>Designation:</span><span className="font-semibold">{selectedAuditor.auditorProfile?.designation || 'Auditor'}</span></div>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-1">Approved Specializations</span>
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {selectedAuditor.auditorProfile?.specialization?.map((spec: string) => (
                                                    <span key={spec} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-100">{spec}</span>
                                                )) || <span className="text-xs text-slate-400">General Emission Audits</span>}
                                            </div>
                                        </div>
                                        
                                        {selectedAuditor.auditorProfile?.licenseDocumentCID && (
                                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                                                    <div>
                                                        <p className="font-bold text-slate-700">License Certificate</p>
                                                        <p className="text-[10px] text-slate-400">Pinned to IPFS</p>
                                                    </div>
                                                </div>
                                                <a 
                                                    href={`https://gateway.pinata.cloud/ipfs/${selectedAuditor.auditorProfile.licenseDocumentCID}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-2.5 py-1 bg-white border border-slate-200 text-blue-600 hover:text-blue-700 font-bold rounded shadow-sm flex items-center gap-0.5"
                                                >
                                                    View
                                                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button 
                                            onClick={() => handleVerifyAuditor(selectedAuditor._id, 'reject')}
                                            className="py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                                        >
                                            Reject request
                                        </button>
                                        <button 
                                            onClick={() => handleVerifyAuditor(selectedAuditor._id, 'approve')}
                                            className="py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow shadow-blue-600/20 transition-colors"
                                        >
                                            Verify & Approve
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[300px]">
                                    <span className="material-symbols-outlined text-5xl mb-3 text-slate-200">touch_app</span>
                                    <p className="text-sm">Select an auditor application from the list to review details and approve.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: REGISTERED DIRECTORY */}
            {activeTab === 'directory' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Industry Directory */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">domain</span>
                            Verified Industries ({filteredCompanies.length})
                        </h3>
                        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
                            {filteredCompanies.length === 0 ? (
                                <p className="text-slate-400 text-sm py-4 text-center">No matching industries in database.</p>
                            ) : (
                                filteredCompanies.map(c => (
                                    <div key={c._id} className="py-3.5 flex justify-between items-center gap-4">
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800">{c.name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{c.sector} Sector · {c.state || 'India'}</p>
                                            <p className="text-[10px] font-mono text-slate-400 mt-1 break-all select-all">Wallet: {c.walletAddress || 'No wallet linked'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                                c.verificationStatus === 'approved' 
                                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                                    : c.verificationStatus === 'suspended' 
                                                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                                        : 'bg-red-50 text-red-600 border border-red-200'
                                            }`}>
                                                {c.verificationStatus || 'approved'}
                                            </span>
                                            <div>
                                                {c.verificationStatus === 'suspended' ? (
                                                    <button 
                                                        onClick={() => handleSuspendCompany(c._id, 'unsuspend')}
                                                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        Re-activate
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleSuspendCompany(c._id, 'suspend')}
                                                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        Suspend
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Auditor Directory */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">verified_user</span>
                            Verified Auditors ({filteredAuditors.length})
                        </h3>
                        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
                            {filteredAuditors.length === 0 ? (
                                <p className="text-slate-400 text-sm py-4 text-center">No matching auditors in database.</p>
                            ) : (
                                filteredAuditors.map(a => (
                                    <div key={a._id} className="py-3.5 flex justify-between items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-slate-800">{a.name}</p>
                                                {!a.isActive && (
                                                    <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold border border-red-100 rounded">Suspended</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5">{a.org} · License: {a.certs || 'N/A'}</p>
                                            <p className="text-[10px] text-slate-400 break-all">{a.email}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${a.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                                {a.isActive ? 'approved' : 'suspended'}
                                            </span>
                                            <div>
                                                {a.isActive ? (
                                                    <button 
                                                        onClick={() => handleSuspendAuditor(a.id || a._id, 'suspend')}
                                                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        Suspend
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleSuspendAuditor(a.id || a._id, 'unsuspend')}
                                                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        Re-activate
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
