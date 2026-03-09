import { useState } from 'react';
import { Link } from 'react-router-dom';

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

export default function HowItWorks() {
  const [activeRole, setActiveRole] = useState('industry');
  const [expandedStep, setExpandedStep] = useState<number | string | null>(null);

  const activeSteps = new Set(roleJourneys[activeRole].steps);

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1A7A4A] text-2xl">eco</span>
            <span className="text-lg font-black tracking-wide text-gray-900">ECOCHAIN</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Contact</Link>
            <Link to="/login" className="bg-[#1A7A4A] text-white text-sm font-bold py-2 px-5 rounded-lg hover:bg-[#15613b] transition-colors">Login</Link>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#1A7A4A]/10 text-[#1A7A4A] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
              <span className="material-symbols-outlined text-sm">route</span>
              14-Step Verified Workflow
            </div>
            <h1 className="text-5xl font-black text-gray-900 mb-6">How EcoChain Works</h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              From raw emission data to verified blockchain-secured carbon credits — every step is AI-screened, auditor-verified, and immutably recorded.
            </p>
          </div>
        </section>

        {/* Role Tabs */}
        <section className="py-12 px-6 bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-sm text-gray-400 font-medium uppercase tracking-wider mb-6">Filter by Role Journey</p>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.entries(roleJourneys).map(([key, r]) => (
                <button
                  key={key}
                  onClick={() => setActiveRole(key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeRole === key
                      ? 'bg-[#1A7A4A] text-white shadow-lg shadow-[#1A7A4A]/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{r.icon}</span>
                  {r.label}
                </button>
              ))}
            </div>
            <p className="text-center text-gray-500 mt-4 text-sm">{roleJourneys[activeRole].desc}</p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="relative">
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
        </section>

        {/* CTA */}
        <section className="py-24 px-6 bg-gradient-to-br from-[#1A7A4A] to-[#0f4d2d] text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-black mb-4">Ready to Join EcoChain?</h2>
            <p className="text-green-200 text-lg mb-10">Start your transparency journey — register your company and submit your first emission report.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register" className="bg-white text-[#1A7A4A] font-black px-8 py-4 rounded-xl hover:bg-green-50 transition-colors shadow-xl">
                Register Now
              </Link>
              <Link to="/login" className="border-2 border-white/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors">
                Login to Portal
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
