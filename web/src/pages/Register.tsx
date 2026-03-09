import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type Role = 'industry' | 'auditor' | 'government';

const sectors = ['Manufacturing', 'Energy', 'Transport', 'Agriculture', 'Construction', 'Mining', 'Other'];
const specializations = ['Environmental', 'Carbon', 'ESG', 'GHG Protocol', 'ISO 14064'];

export default function Register() {
    const [role, setRole] = useState<Role | null>(null);
    const [step, setStep] = useState(1); // 1=role pick, 2=form, 3=pending
    const [refNumber] = useState(`ECO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    const navigate = useNavigate();

    const [industryForm, setIndustryForm] = useState({ companyName: '', regNumber: '', sector: '', industryType: '', address: '', email: '', phone: '' });
    const [auditorForm, setAuditorForm] = useState({ org: '', designation: '', experience: '', specialization: [] as string[], licenseNumber: '' });
    const [govForm, setGovForm] = useState({ department: '', designation: '', ministry: '', region: '', govtEmail: '' });

    const roleMeta = {
        industry: { icon: 'factory', label: 'Industry / Business', desc: 'Manufacturing, energy, transport, or other emission-producing entities.', color: 'green' },
        auditor: { icon: 'fact_check', label: 'Environmental Auditor', desc: 'Certified professionals who review and sign emission audit reports.', color: 'violet' },
        government: { icon: 'account_balance', label: 'Government Official', desc: 'Ministry/EPA officials who verify industries and oversee compliance.', color: 'blue' },
    };

    const colorMap: Record<string, string> = {
        green: 'border-green-500 bg-green-50 text-green-700',
        violet: 'border-violet-500 bg-violet-50 text-violet-700',
        blue: 'border-blue-500 bg-blue-50 text-blue-700',
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(3);
    };

    if (step === 3) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-6 py-20">
                <div className="max-w-lg w-full text-center">
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-green-500 text-5xl">pending_actions</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-3">Application Submitted!</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Your registration is under review. A {role === 'government' ? 'Platform Administrator' : 'Government Official'} will verify your documents and approve or reject your application within 5 business days.
                    </p>
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 mb-8">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Your Reference Number</p>
                        <p className="text-3xl font-mono font-black text-gray-900">{refNumber}</p>
                        <p className="text-xs text-gray-400 mt-2">Keep this for future inquiries</p>
                    </div>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-400">You will receive an email notification at your registered email.</p>
                        <button onClick={() => navigate('/login')} className="text-sm font-bold text-[#1A7A4A] hover:underline">
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white font-sans">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1A7A4A] text-2xl">eco</span>
                        <span className="text-lg font-black tracking-wide text-gray-900">ECOCHAIN</span>
                    </Link>
                    <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Already have an account? <span className="text-[#1A7A4A] font-bold">Login</span></Link>
                </div>
            </nav>

            <main className="pt-20 px-6 pb-20">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center py-12">
                        <h1 className="text-4xl font-black text-gray-900 mb-3">Create Account</h1>
                        <p className="text-gray-500">Choose your role to get started with EcoChain.</p>
                    </div>

                    {/* Step 1: Role Picker */}
                    {step === 1 && (
                        <div className="space-y-4">
                            {(Object.keys(roleMeta) as Role[]).map(r => (
                                <button
                                    key={r}
                                    onClick={() => { setRole(r); setStep(2); }}
                                    className={`w-full flex items-center gap-5 p-6 rounded-2xl border-2 hover:shadow-lg transition-all text-left ${role === r ? colorMap[roleMeta[r].color] + ' border-2' : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${roleMeta[r].color === 'green' ? 'bg-green-100' : roleMeta[r].color === 'violet' ? 'bg-violet-100' : 'bg-blue-100'
                                        }`}>
                                        <span className={`material-symbols-outlined text-2xl ${roleMeta[r].color === 'green' ? 'text-green-600' : roleMeta[r].color === 'violet' ? 'text-violet-600' : 'text-blue-600'
                                            }`}>{roleMeta[r].icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-gray-900 text-lg">{roleMeta[r].label}</p>
                                        <p className="text-gray-400 text-sm mt-1">{roleMeta[r].desc}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Step 2: Role-specific forms */}
                    {step === 2 && role && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Change role
                            </button>

                            <div className="flex items-center gap-3 mb-8">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'industry' ? 'bg-green-100' : role === 'auditor' ? 'bg-violet-100' : 'bg-blue-100'
                                    }`}>
                                    <span className={`material-symbols-outlined ${role === 'industry' ? 'text-green-600' : role === 'auditor' ? 'text-violet-600' : 'text-blue-600'
                                        }`}>{roleMeta[role].icon}</span>
                                </div>
                                <div>
                                    <p className="font-black text-gray-900">{roleMeta[role].label}</p>
                                    <p className="text-xs text-gray-400">Fill in your details below</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Industry Form */}
                                {role === 'industry' && (
                                    <>
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Company Name *</label>
                                                <input required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-500 transition-all" placeholder="Acme Industries Ltd" value={industryForm.companyName} onChange={e => setIndustryForm({ ...industryForm, companyName: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Registration Number *</label>
                                                <input required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-500 transition-all" placeholder="CIN/Reg. Number" value={industryForm.regNumber} onChange={e => setIndustryForm({ ...industryForm, regNumber: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Sector *</label>
                                                <select required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-500 transition-all bg-white" value={industryForm.sector} onChange={e => setIndustryForm({ ...industryForm, sector: e.target.value })}>
                                                    <option value="">Select sector...</option>
                                                    {sectors.map(s => <option key={s}>{s}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Industry Type *</label>
                                                <input required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-500 transition-all" placeholder="e.g. Steel Manufacturing" value={industryForm.industryType} onChange={e => setIndustryForm({ ...industryForm, industryType: e.target.value })} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Business Address *</label>
                                            <input required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-500 transition-all" placeholder="Street, City, State, Country" value={industryForm.address} onChange={e => setIndustryForm({ ...industryForm, address: e.target.value })} />
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Contact Email *</label>
                                                <input required type="email" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-500 transition-all" placeholder="contact@company.com" value={industryForm.email} onChange={e => setIndustryForm({ ...industryForm, email: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                                                <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-500 transition-all" placeholder="+91 98765 43210" value={industryForm.phone} onChange={e => setIndustryForm({ ...industryForm, phone: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <span className="material-symbols-outlined text-gray-400">upload_file</span>
                                            <div>
                                                <p className="text-sm font-bold text-gray-700">Business Certificate + Tax Documents</p>
                                                <p className="text-xs text-gray-400">PDF, JPG up to 10 MB each</p>
                                            </div>
                                            <span className="ml-auto text-xs font-bold text-[#1A7A4A] border border-[#1A7A4A]/30 px-3 py-1 rounded-lg">Browse</span>
                                        </div>
                                    </>
                                )}

                                {/* Auditor Form */}
                                {role === 'auditor' && (
                                    <>
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Organization / Firm *</label>
                                                <input required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-500 transition-all" placeholder="Green Audit Firm LLC" value={auditorForm.org} onChange={e => setAuditorForm({ ...auditorForm, org: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Designation *</label>
                                                <input required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-500 transition-all" placeholder="Senior Environmental Auditor" value={auditorForm.designation} onChange={e => setAuditorForm({ ...auditorForm, designation: e.target.value })} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Years of Experience *</label>
                                            <input required type="number" min="1" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-500 transition-all" placeholder="e.g. 8" value={auditorForm.experience} onChange={e => setAuditorForm({ ...auditorForm, experience: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Specialization *</label>
                                            <div className="flex flex-wrap gap-2">
                                                {specializations.map(s => (
                                                    <button type="button" key={s} onClick={() => {
                                                        const newSpec = auditorForm.specialization.includes(s)
                                                            ? auditorForm.specialization.filter(x => x !== s)
                                                            : [...auditorForm.specialization, s];
                                                        setAuditorForm({ ...auditorForm, specialization: newSpec });
                                                    }} className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${auditorForm.specialization.includes(s) ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200 hover:border-violet-400'}`}>
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
                                                <span className="material-symbols-outlined text-gray-400 text-sm">upload_file</span>
                                                <div><p className="text-xs font-bold text-gray-700">Professional License</p><p className="text-xs text-gray-400">PDF/JPG</p></div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
                                                <span className="material-symbols-outlined text-gray-400 text-sm">upload_file</span>
                                                <div><p className="text-xs font-bold text-gray-700">Certification Docs</p><p className="text-xs text-gray-400">PDF/JPG</p></div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Government Form */}
                                {role === 'government' && (
                                    <>
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Department *</label>
                                                <input required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-500 transition-all" placeholder="Ministry of Environment" value={govForm.department} onChange={e => setGovForm({ ...govForm, department: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Designation *</label>
                                                <input required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-500 transition-all" placeholder="Director of Carbon Compliance" value={govForm.designation} onChange={e => setGovForm({ ...govForm, designation: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Ministry / Body *</label>
                                                <input required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-500 transition-all" placeholder="EPA, CPCB, MoEFCC..." value={govForm.ministry} onChange={e => setGovForm({ ...govForm, ministry: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Region / Jurisdiction *</label>
                                                <input required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-500 transition-all" placeholder="Maharashtra, India" value={govForm.region} onChange={e => setGovForm({ ...govForm, region: e.target.value })} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Official Government Email *</label>
                                            <div className="flex gap-2">
                                                <input required type="email" className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-500 transition-all" placeholder="officer@gov.in" value={govForm.govtEmail} onChange={e => setGovForm({ ...govForm, govtEmail: e.target.value })} />
                                                <button type="button" className="px-4 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap">Verify OTP</button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
                                                <span className="material-symbols-outlined text-gray-400 text-sm">upload_file</span>
                                                <div><p className="text-xs font-bold text-gray-700">Official ID</p><p className="text-xs text-gray-400">PDF/JPG</p></div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
                                                <span className="material-symbols-outlined text-gray-400 text-sm">upload_file</span>
                                                <div><p className="text-xs font-bold text-gray-700">Appointment Letter</p><p className="text-xs text-gray-400">PDF/JPG</p></div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <button type="submit" className={`w-full font-black py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg mt-4 text-white ${role === 'industry' ? 'bg-[#1A7A4A] hover:bg-[#15613b] shadow-green-200' :
                                        role === 'auditor' ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-200' :
                                            'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                    }`}>
                                    <span className="material-symbols-outlined text-sm">send</span>
                                    Submit Registration
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
