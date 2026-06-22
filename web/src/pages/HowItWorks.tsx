import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PublicNav from '../components/PublicNav';

const steps = [
    { id: 1, phase: 'A', label: 'Industry Data Input', actor: 'Industry', icon: 'factory', output: 'Raw emission dataset', color: 'from-green-500 to-emerald-600', desc: 'Industries input fuel consumption, electricity usage, and production details for the reporting period.' },
    { id: 2, phase: 'A', label: 'Emission Calculator', actor: 'System', icon: 'calculate', output: 'Calculated CO₂e figures', color: 'from-emerald-500 to-teal-600', desc: 'System automatically calculates Scope 1, 2, and 3 emissions using IPCC emission factor database.' },
    { id: 3, phase: 'A', label: 'Baseline Emission Model', actor: 'AI (Python)', icon: 'model_training', output: 'Baseline + confidence range', color: 'from-teal-500 to-cyan-600', desc: 'AI builds an expected emission baseline using linear regression + K-Means sector clustering.' },
    { id: 4, phase: 'A', label: 'AI Anomaly Detection', actor: 'AI (Python)', icon: 'psychology', output: 'Clean ✅ or Flagged ⚠️', color: 'from-cyan-500 to-blue-600', desc: 'Isolation Forest ML model detects anomalous emission data with a 0–100 risk score before auditor review.' },
    { id: 'G1', phase: 'GATE', label: 'Gate 1: Anomaly Check', actor: 'System', icon: 'emergency', output: 'Pass → Step 5 | Fail → Step 1', color: 'from-orange-500 to-red-500', desc: 'If anomaly detected, industry is notified and must fix and resubmit. Clean submissions proceed to auditor.' },
    { id: 5, phase: 'B', label: 'Auditor Verification', actor: 'Auditor', icon: 'fact_check', output: 'Verified signed report', color: 'from-violet-500 to-purple-600', desc: 'Certified auditor reviews emission data, AI result, and supporting documents. Signs report with PKI digital signature.' },
    { id: 6, phase: 'C', label: 'ESG Report Generation', actor: 'System', icon: 'description', output: 'PDF compliance report', color: 'from-purple-500 to-pink-600', desc: 'System auto-generates ESG/Carbon compliance report using PDFKit with AI-written NLG narrative (Jinja2 templates).' },
    { id: 7, phase: 'C', label: 'Blockchain Storage', actor: 'System', icon: 'link', output: 'On-chain hash + timestamp', color: 'from-pink-500 to-rose-600', desc: 'AuditRegistry.sol stores the verified report hash and auditor PKI signature immutably on Polygon network.' },
    { id: 8, phase: 'C', label: 'Emission Reduction Calc', actor: 'System', icon: 'trending_down', output: 'Reduction or excess quantity', color: 'from-rose-500 to-orange-600', desc: 'System calculates the difference between actual emissions and the AI-established baseline (tCO₂e).' },
    { id: 'G2', phase: 'GATE', label: 'Gate 2: Credit or Penalty', actor: 'System', icon: 'balance', output: 'Credits → Step 10 | Penalty → enforcement', color: 'from-orange-500 to-amber-500', desc: 'If emissions exceeded baseline, penalty pathway activated. If reduced, industry is eligible for carbon credits.' },
    { id: 10, phase: 'E', label: 'Carbon Credit Minting', actor: 'System + Govt', icon: 'token', output: 'ERC-20 carbon credit tokens', color: 'from-amber-500 to-yellow-500', desc: 'Government approves tokenization. CarbonCredit.sol (ERC-20) mints tokens — 1 token = 1 tCO₂e reduced. Multi-party approval required.' },
    { id: 11, phase: 'E', label: 'Credit Storage (Wallet)', actor: 'System', icon: 'account_balance_wallet', output: 'Credits in digital wallet', color: 'from-yellow-500 to-lime-500', desc: 'Minted carbon credit ERC-20 tokens are automatically sent to the industry\'s custodial Polygon wallet.' },
    { id: 12, phase: 'E', label: 'Carbon Marketplace', actor: 'Industry', icon: 'store', output: 'Active marketplace listing', color: 'from-lime-500 to-green-500', desc: 'Industry can list their earned carbon credits on the marketplace, setting price per credit and expiry date.' },
    { id: 13, phase: 'E', label: 'Smart Contract Trading', actor: 'Smart Contract', icon: 'swap_horiz', output: 'Trade executed, tokens transferred', color: 'from-green-500 to-emerald-500', desc: 'CarbonMarketplace.sol executes trustless peer-to-peer trades with automatic token and payment transfer.' },
    { id: 14, phase: 'E', label: 'Credit Retirement + Loop', actor: 'Industry/System', icon: 'local_fire_department', output: 'Retirement record + new cycle', color: 'from-emerald-500 to-teal-500', desc: 'CreditRetirement.sol permanently burns tokens to claim offset impact. Triggers a new monitoring cycle from Step 1.' },
];

const roleJourneys: Record<string, { label: string; icon: string; steps: number[]; color: string; desc: string }> = {
    industry: {
        label: 'Industry',
        icon: 'factory',
        color: 'text-green-600',
        desc: 'Submit emission data, earn carbon credits, and trade on the marketplace.',
        steps: [1, 2, 3, 4, 10, 11, 12, 13, 14],
    },
    auditor: {
        label: 'Auditor',
        icon: 'fact_check',
        color: 'text-violet-600',
        desc: 'Review AI-pre-screened submissions, sign reports digitally, and push to blockchain.',
        steps: [5, 6, 7],
    },
    government: {
        label: 'Government',
        icon: 'account_balance',
        color: 'text-blue-600',
        desc: 'Monitor compliance, approve credit tokenization, and set emission policies.',
        steps: [8, 10],
    },
    admin: {
        label: 'Admin',
        icon: 'admin_panel_settings',
        color: 'text-purple-600',
        desc: 'Manage the platform, verify users, configure AI models, and oversee the entire ecosystem.',
        steps: [],
    },
};

const faqs = [
    { q: 'How is emission data verified?', a: 'All submissions pass through our Isolation Forest AI anomaly detection before a certified human auditor reviews and digitally signs the report.' },
    { q: 'Is my data stored on the blockchain?', a: 'Only the cryptographic hash (SHA-256 fingerprint) of your verified audit report is stored on Polygon — never raw emission data. Individual data stays private on MongoDB Atlas.' },
    { q: 'How long does the audit process take?', a: 'AI pre-screening completes in under 3 seconds. Human auditor review typically takes 2–5 business days depending on submission complexity and auditor availability.' },
    { q: 'What is 1 carbon credit worth?', a: 'One EcoChain carbon credit equals 1 tonne of CO₂ equivalent (1 tCO₂e) reduced below your verified baseline. Market price is determined by supply/demand on CarbonMarketplace.sol.' },
    { q: 'How do I register my company?', a: 'Submit a registration on the Register page. A Government official will review your business documents and approve/reject within 5 business days.' },
    { q: 'Can I export my ESG reports?', a: 'Yes. All compliance reports and certificates are available as PDF (PDFKit), Excel (ExcelJS), and CSV formats from your Industry Portal.' },
];

export default function HowItWorks() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get('tab') || 'workflow';

    const [activeRole, setActiveRole] = useState('industry');
    const [expandedStep, setExpandedStep] = useState<number | string | null>(null);

    // Contact Form States
    const [form, setForm] = useState({ name: '', email: '', role: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const activeSteps = new Set(roleJourneys[activeRole].steps);

    const handleTabChange = (tab: 'workflow' | 'contact') => {
        setSearchParams({ tab });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <PublicNav />

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Header and Switcher */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">
                            {currentTab === 'workflow' ? 'How EcoChain Works' : 'Help & Support Center'}
                        </h1>
                        <p className="text-gray-400 mt-1">
                            {currentTab === 'workflow' 
                                ? 'A 14-step verified pipeline from raw emissions to smart-contract carbon trading' 
                                : 'Find answers to frequently asked questions or contact our support team'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1 self-start md:self-auto shrink-0 shadow-sm">
                        <button
                            onClick={() => handleTabChange('workflow')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                                currentTab === 'workflow'
                                    ? 'bg-[#1A7A4A] text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <span className="material-symbols-outlined text-base leading-none">route</span>
                            Workflow Guide
                        </button>
                        <button
                            onClick={() => handleTabChange('contact')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                                currentTab === 'contact'
                                    ? 'bg-[#1A7A4A] text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <span className="material-symbols-outlined text-base leading-none">support_agent</span>
                            FAQs & Contact
                        </button>
                    </div>
                </div>

                {/* ─── TAB: WORKFLOW ─────────────────────────────────────────── */}
                {currentTab === 'workflow' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Role Selector Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-wider mb-4">Filter workflow steps by actor journey</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {Object.entries(roleJourneys).map(([key, r]) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveRole(key)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                                            activeRole === key
                                                ? 'bg-[#1A7A4A] text-white border-[#1A7A4A] shadow-md shadow-[#1A7A4A]/25'
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-[#1A7A4A]/40'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-sm leading-none">{r.icon}</span>
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-gray-500 mt-4 text-sm max-w-xl mx-auto font-medium">{roleJourneys[activeRole].desc}</p>
                        </div>

                        {/* Steps Stack */}
                        <div className="max-w-4xl mx-auto relative pt-4">
                            {/* Vertical connector line */}
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />

                            <div className="space-y-4">
                                {steps.map((step) => {
                                    const isGate = step.phase === 'GATE';
                                    const isHighlighted = activeRole === 'industry' ? true : (!isGate && activeSteps.has(step.id as number));
                                    const isExpanded = expandedStep === step.id;

                                    return (
                                        <div
                                            key={step.id}
                                            className={`relative flex gap-6 transition-all duration-300 ${!isHighlighted && activeRole !== 'industry' ? 'opacity-30' : ''}`}
                                        >
                                            {/* Step icon circle */}
                                            <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                                                <span className="material-symbols-outlined text-white text-2xl">{step.icon}</span>
                                                {isGate && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-white text-xs">warning</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Step card */}
                                            <div
                                                className={`flex-1 bg-white border rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all ${isGate ? 'border-orange-200 bg-orange-50/50' : 'border-gray-200'} ${isExpanded ? 'shadow-md' : ''}`}
                                                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {!isGate && (
                                                            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                Step {step.id}
                                                            </span>
                                                        )}
                                                        {isGate && (
                                                            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                Decision Gate
                                                            </span>
                                                        )}
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                            step.actor === 'AI (Python)' ? 'bg-blue-100 text-blue-600' :
                                                            step.actor === 'Auditor' ? 'bg-violet-100 text-violet-600' :
                                                            step.actor === 'Industry' ? 'bg-green-100 text-green-600' :
                                                            step.actor === 'Smart Contract' ? 'bg-purple-100 text-purple-600' :
                                                            'bg-gray-100 text-gray-500'
                                                        }`}>
                                                            {step.actor}
                                                        </span>
                                                    </div>
                                                    <span className="material-symbols-outlined text-gray-400 text-sm">
                                                        {isExpanded ? 'expand_less' : 'expand_more'}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-gray-900 mt-2 text-lg">{step.label}</h3>
                                                <p className="text-sm text-gray-400 mt-1">Output: <span className="text-gray-600 font-medium">{step.output}</span></p>
                                                {isExpanded && (
                                                    <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100 leading-relaxed">{step.desc}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── TAB: CONTACT & FAQ ────────────────────────────────────── */}
                {currentTab === 'contact' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid lg:grid-cols-2 gap-10">
                            {/* Left Side: Contact Form */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <h2 className="text-2xl font-black text-gray-900 mb-6">Send an Inquiry</h2>
                                {submitted ? (
                                    <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                                        <span className="material-symbols-outlined text-green-500 text-5xl">check_circle</span>
                                        <h3 className="text-xl font-black text-gray-900 mt-4">Message Received!</h3>
                                        <p className="text-gray-500 mt-2">We will get back to you at <strong>{form.email}</strong> within 24 hours.</p>
                                        <button 
                                            onClick={() => { setSubmitted(false); setForm({ name: '', email: '', role: '', message: '' }); }} 
                                            className="mt-6 text-sm text-[#1A7A4A] font-bold hover:underline"
                                        >
                                            Send another message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name *</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={form.name}
                                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                                    placeholder="John Smith"
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 focus:border-[#1A7A4A] transition-all bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address *</label>
                                                <input
                                                    required
                                                    type="email"
                                                    value={form.email}
                                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                                    placeholder="you@company.com"
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 focus:border-[#1A7A4A] transition-all bg-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Your Role *</label>
                                            <select
                                                required
                                                value={form.role}
                                                onChange={e => setForm({ ...form, role: e.target.value })}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 focus:border-[#1A7A4A] transition-all bg-white"
                                            >
                                                <option value="">Select your role...</option>
                                                <option>Industry / Business</option>
                                                <option>Environmental Auditor</option>
                                                <option>Government Official</option>
                                                <option>Researcher / Developer</option>
                                                <option>Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Message *</label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={form.message}
                                                onChange={e => setForm({ ...form, message: e.target.value })}
                                                placeholder="Describe your inquiry, technical question, or partnership interest..."
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 focus:border-[#1A7A4A] transition-all resize-none bg-white"
                                            />
                                        </div>

                                        <button type="submit" className="w-full bg-[#1A7A4A] hover:bg-[#15613b] text-white font-black py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1A7A4A]/30">
                                            <span className="material-symbols-outlined text-sm">send</span>
                                            Send Message
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Right Side: FAQ Accordion */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <h2 className="text-2xl font-black text-gray-900 mb-6">Frequently Asked Questions</h2>
                                    <div className="space-y-3">
                                        {faqs.map((faq, i) => (
                                            <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                                                <button
                                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                                                >
                                                    <span className="font-bold text-gray-900 text-sm">{faq.q}</span>
                                                    <span className="material-symbols-outlined text-gray-400 text-sm flex-shrink-0 ml-4">
                                                        {openFaq === i ? 'expand_less' : 'expand_more'}
                                                    </span>
                                                </button>
                                                {openFaq === i && (
                                                    <div className="px-6 pb-4 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                                                        {faq.a}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Support Contacts */}
                                <div className="grid sm:grid-cols-3 gap-4">
                                    {[
                                        { icon: 'email', label: 'General', val: 'hello@ecochain.dev' },
                                        { icon: 'bug_report', label: 'Support', val: 'tech@ecochain.dev' },
                                        { icon: 'business', label: 'Partners', val: 'partners@ecochain.dev' }
                                    ].map(c => (
                                        <div key={c.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
                                            <div className="w-10 h-10 rounded-xl bg-[#1A7A4A]/10 flex items-center justify-center mx-auto mb-2">
                                                <span className="material-symbols-outlined text-[#1A7A4A] text-lg">{c.icon}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{c.label}</p>
                                            <p className="font-bold text-gray-900 text-xs mt-0.5 truncate">{c.val}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
