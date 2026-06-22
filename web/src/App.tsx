import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import AnimatedCounter from './components/AnimatedCounter';
import LoginPage from './pages/LoginPage';
import ResetPassword from './pages/ResetPassword';
import ecochainLogo from './assets/ecochain_icon_white.png';


import IndustryStep1 from './pages/onboarding/IndustryStep1';
import IndustryStep2 from './pages/onboarding/IndustryStep2';
import IndustryStep3 from './pages/onboarding/IndustryStep3';
import GovStep1 from './pages/onboarding/GovStep1';
import GovStep2 from './pages/onboarding/GovStep2';
import GovStep3 from './pages/onboarding/GovStep3';
import AuditorStep1 from './pages/onboarding/AuditorStep1';
import AuditorStep2 from './pages/onboarding/AuditorStep2';
import AuditorStep3 from './pages/onboarding/AuditorStep3';
import IndustryDashboard from './pages/Industry/IndustryDashboard';
import AddEmission from './pages/Industry/AddEmission';
import EmissionHistory from './pages/Industry/EmissionHistory';
import Marketplace from './pages/Industry/Marketplace';
import Wallet from './pages/Industry/Wallet';
import AiForecast from './pages/Industry/AiForecast';
import IndustryReports from './pages/Industry/IndustryReports';
import GovDashboard from './pages/goverment/GovDashboard';
import ReportReview from './pages/goverment/ReportReview';
import IssueCredits from './pages/goverment/IssueCredits';
import ComplianceMonitor from './pages/goverment/ComplianceMonitor';
import GovMonitoring from './pages/goverment/GovMonitoring';
import GovIndustriesAnalytics from './pages/goverment/GovIndustriesAnalytics';
import GovBlockchain from './pages/goverment/GovBlockchain';
import GovNotifications from './pages/goverment/GovNotifications';
import GovAIVerifier from './pages/goverment/GovAIVerifier';
import GovAuditorAssignment from './pages/goverment/GovAuditorAssignment';
import GovVerification from './pages/goverment/GovVerification';
import GovRegistry from './pages/goverment/GovRegistry';
import TransparencyDashboard from './pages/TransparencyDashboard';
import NotFound from './pages/NotFound';
import GovPendingVerification from './pages/GovPendingVerification';
import AuditorPendingVerification from './pages/AuditorPendingVerification';
// Landing & Public pages
import HowItWorks from './pages/HowItWorks';
import Register from './pages/Register';
import PublicDashboard from './pages/public/PublicDashboard';
import PoliciesReports from './pages/public/PoliciesReports';
// Auditor pages
import AuditorDashboard from './pages/auditor/AuditorDashboard';
import AuditQueue from './pages/auditor/AuditQueue';
import VerifySubmit from './pages/auditor/VerifySubmit';
import AuditorBlockchain from './pages/auditor/AuditorBlockchain';
import AuditorHistory from './pages/auditor/AuditorHistory';
// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminConfig from './pages/admin/AdminConfig';
import AdminLogs from './pages/admin/AdminLogs';
import AdminContent from './pages/admin/AdminContent';
import AdminSettings from './pages/admin/AdminSettings';
import SubmissionTracker from './pages/Industry/SubmissionTracker';
import IndustryNotifications from './pages/Industry/IndustryNotifications';
import IndustryProfile from './pages/Industry/IndustryProfile';
import IndustryCompliance from './pages/Industry/ComplianceMonitor';
import GovProfile from './pages/goverment/GovProfile';
import AuditorProfile from './pages/auditor/AuditorProfile';
import AdminProfile from './pages/admin/AdminProfile';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import { Toaster } from 'react-hot-toast';

// ─── 6 Feature Cards Data ──────────────────────────────────────────────
const features = [
  {
    icon: 'psychology',
    title: 'AI Anomaly Detection',
    description:
      'Isolation Forest ML model auto-flags suspicious emission data before it reaches human auditors — with 95%+ accuracy.',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    badge: 'AI Powered',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
  {
    icon: 'link',
    title: 'Blockchain Audit Trail',
    description:
      'Every verified audit report stored immutably on Polygon via AuditRegistry.sol — tamper-proof forever, publicly verifiable.',
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    badge: 'Immutable',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    icon: 'swap_horiz',
    title: 'Carbon Credit Trading',
    description:
      'CarbonMarketplace.sol executes trustless peer-to-peer credit trades with zero intermediaries and instant settlement.',
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
    badge: 'Smart Contract',
    badgeColor: 'bg-green-100 text-green-700',
  },
  {
    icon: 'description',
    title: 'ESG Reports',
    description:
      'Auto-generate PDF compliance reports with AI-written narratives using NLG + Jinja2. Share with investors in seconds.',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    badge: 'Automated',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
  {
    icon: 'trending_up',
    title: 'Predictive Analytics',
    description:
      'Prophet + LSTM forecasting predicts next-period emissions with confidence intervals. AI-powered reduction suggestions.',
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    badge: 'Forecasting',
    badgeColor: 'bg-pink-100 text-pink-700',
  },
  {
    icon: 'notifications_active',
    title: 'Real-time Notifications',
    description:
      'Socket.io delivers instant alerts for anomaly flags, audit results, credit minting, and compliance deadlines.',
    color: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    badge: 'Live Updates',
    badgeColor: 'bg-teal-100 text-teal-700',
  },
];

// ─── Role Portals ──────────────────────────────────────────────────────
const portals = [
  {
    role: 'Industry',
    icon: 'factory',
    color: 'bg-emerald-600',
    hoverBorder: 'hover:border-emerald-300',
    features: ['Submit emission data (Scope 1/2/3)', 'AI anomaly check + baseline comparison', 'Earn & trade carbon credits', 'ESG reports & compliance certificates'],
    href: '/login',
  },
  {
    role: 'Auditor',
    icon: 'fact_check',
    color: 'bg-blue-600',
    hoverBorder: 'hover:border-blue-300',
    features: ['Review AI-screened submissions', 'PKI digital signature sign-off', 'Push audit to blockchain', 'Compliance checker dashboard'],
    href: '/login',
  },
  {
    role: 'Government',
    icon: 'account_balance',
    color: 'bg-violet-600',
    hoverBorder: 'hover:border-violet-300',
    features: ['National emissions dashboard', 'Approve credit tokenization', 'Sector analytics & AI monitor', 'Policy & guideline management'],
    href: '/login',
  },
  {
    role: 'Admin',
    icon: 'admin_panel_settings',
    color: 'bg-slate-700',
    hoverBorder: 'hover:border-slate-300',
    features: ['Platform health monitoring', 'User verification management', 'AI model configuration', 'Blockchain node oversight'],
    href: '/login',
  },
];

// ─── 14-Step Workflow (condensed 4 phases) ──────────────────────────────
const workflowPhases = [
  {
    phase: 'A',
    title: 'Data Collection',
    icon: 'input_circle',
    steps: ['Industry inputs emission data (Scope 1/2/3)', 'System auto-calculates CO₂e', 'AI builds emission baseline', 'Isolation Forest anomaly detection'],
    color: 'bg-blue-600',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
  {
    phase: 'B',
    title: 'Verification',
    icon: 'verified',
    steps: ['Auditor reviews AI result + docs', 'PKI digital signature sign-off', 'PDFKit compliance report generated', 'AuditRegistry.sol stores hash on-chain'],
    color: 'bg-violet-600',
    lightBg: 'bg-violet-50',
    textColor: 'text-violet-700',
  },
  {
    phase: 'C',
    title: 'Credit Minting',
    icon: 'token',
    steps: ['Emission delta vs baseline calculated', 'Govt approves tokenization', 'CarbonCredit.sol mints ERC-20 tokens', 'Tokens sent to industry wallet'],
    color: 'bg-emerald-600',
    lightBg: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
  {
    phase: 'D',
    title: 'Market & Retirement',
    icon: 'local_fire_department',
    steps: ['Industry lists credits on marketplace', 'Smart contract executes trustless trade', 'CreditRetirement.sol burns tokens permanently', 'Feedback loop → new monitoring cycle'],
    color: 'bg-orange-600',
    lightBg: 'bg-orange-50',
    textColor: 'text-orange-700',
  },
];

// ─── Tech Stack Layers ──────────────────────────────────────────────────
const techLayers = [
  { layer: 'Client', tech: 'React.js + Vite', host: 'Vercel', icon: 'web', color: 'bg-blue-100 text-blue-700', items: ['6 Portals • 33 Screens', 'Tailwind CSS • Recharts', 'Ethers.js • Socket.io Client'] },
  { layer: 'API Server', tech: 'Node.js + Express.js', host: 'Render.com', icon: 'dns', color: 'bg-violet-100 text-violet-700', items: ['16 Route Modules', 'JWT + RBAC Middleware', 'PDFKit • node-forge • Nodemailer'] },
  { layer: 'AI Service', tech: 'Python + FastAPI', host: 'Render.com', icon: 'psychology', color: 'bg-pink-100 text-pink-700', items: ['9 ML Endpoints', 'Isolation Forest • Prophet • LSTM', 'scikit-learn • TensorFlow'] },
  { layer: 'Blockchain', tech: 'Solidity + Polygon', host: 'Polygon Network', icon: 'link', color: 'bg-emerald-100 text-emerald-700', items: ['5 Smart Contracts', 'AuditRegistry • CarbonCredit', 'Foundry • OpenZeppelin'] },
];

// ─── Live Ledger Transactions (decorative) ─────────────────────────────
const liveTxns = [
  { hash: '0x8a7...2b9', type: 'MINT', amount: '+500 tCO₂', time: 'Just now', color: 'text-emerald-600' },
  { hash: '0x3c1...9d2', type: 'TRADE', amount: '20 tCO₂', time: '2s ago', color: 'text-blue-600' },
  { hash: '0x1f4...8a1', type: 'RETIRE', amount: '-150 tCO₂', time: '5s ago', color: 'text-red-500' },
  { hash: '0xb29...c4e', type: 'MINT', amount: '+1,200 tCO₂', time: '8s ago', color: 'text-emerald-600' },
  { hash: '0xd81...a11', type: 'TRADE', amount: '50 tCO₂', time: '12s ago', color: 'text-blue-600' },
  { hash: '0xe44...b22', type: 'TRADE', amount: '10 tCO₂', time: '15s ago', color: 'text-blue-600' },
];

function LandingPage() {
  return (
    <>
      {/* ═══ NAVBAR ═══ */}
      <div className="fixed top-0 left-0 w-full z-50">
        {/* Indian tricolor accent strip */}
        <div style={{ height: '3px', background: 'linear-gradient(to right, #FF9933 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #138808 66.6%)' }} />
        <nav className="glass-panel border-b border-border-subtle">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-2">
                <img src={ecochainLogo} alt="EcoChain Icon" className="w-8 h-8 object-contain" />
                <span className="text-xl font-display font-bold tracking-wide text-text-main">ECOCHAIN</span>
              </a>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a className="text-sm font-medium text-text-muted hover:text-primary transition-colors" href="#features">Platform Features</a>
              <a className="text-sm font-medium text-text-muted hover:text-primary transition-colors" href="#workflow">14-Step Workflow</a>
              <a className="text-sm font-medium text-text-muted hover:text-primary transition-colors" href="#architecture">Architecture Stack</a>
              <a className="text-sm font-medium text-text-muted hover:text-primary transition-colors" href="#portals">Integrated Portals</a>
              <Link className="text-sm font-medium text-text-muted hover:text-primary transition-colors" to="/public/dashboard">Public</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/register" className="hidden sm:block text-sm font-medium text-text-muted hover:text-primary transition-colors">Register</Link>
              <Link to="/login" className="btn-primary h-10 px-6 text-sm">
                Login<span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>

      <main className="pt-[51px]">

        {/* ═══ HERO ═══ */}
        <section className="bg-white py-20 px-6 border-b border-border-subtle overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-primary rounded-full border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">MAINNET LIVE · MARCH 2026</span>
              </div>
              <h1 className="font-display font-bold uppercase leading-none text-text-main" style={{fontSize: 'clamp(3rem, 7vw, 6rem)', lineHeight: '1'}}>
                TRANSPARENT<br />
                <span className="text-primary">CARBON</span><br />
                MARKETS
              </h1>
              <p className="text-2xl text-text-muted" style={{fontFamily: 'Rajdhani, sans-serif', fontWeight: 600}}>
                Verified by AI. Secured by Blockchain.
              </p>
              <p className="text-base text-text-muted max-w-xl leading-relaxed">
                Eliminating double-counting and greenwashing through automated anomaly detection and immutable ledger audit trails. The sovereign layer for ecological assets.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/register" className="btn-primary h-14 px-8 text-sm">
                  Get Started Free <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <Link to="/public/dashboard" className="btn-secondary h-14 px-8 text-sm">
                  <span className="material-symbols-outlined">public</span> Explore Public Data
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-2 opacity-60">
                {[{icon:'verified_user', label:'ISO 14064'},{icon:'security', label:'OWASP'},{icon:'token', label:'ERC-20'}].map(b => (
                  <div key={b.label} className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="material-symbols-outlined text-primary text-base">{b.icon}</span>{b.label}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Validation Panel */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gray-50 rotate-2 -z-10 border border-border-subtle rounded-lg" />
              <div className="bg-white border border-border-subtle shadow-sm p-8">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-text-muted">AI VALIDATION CORE</span>
                  <span className="px-2 py-1 bg-green-50 text-primary text-xs" style={{fontFamily:'JetBrains Mono, monospace'}}>REAL-TIME</span>
                </div>
                <div className="p-4 border-l-4 border-l-primary bg-green-50/60 mb-6">
                  <p className="text-text-main text-lg font-bold" style={{fontFamily:'JetBrains Mono, monospace'}}>AI RESULT · Risk: 12/100</p>
                  <p className="text-primary font-bold text-sm mt-1">✓ Clean — Pass</p>
                </div>
                <div className="space-y-4">
                  <div className="h-2 w-full bg-gray-100 overflow-hidden rounded-full">
                    <div className="h-full bg-primary w-3/4" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[{label:'VERIFICATION', val:'99.98%'},{label:'LATENCY', val:'142ms'}].map(d => (
                      <div key={d.label} className="p-3 border border-border-subtle bg-gray-50">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{d.label}</p>
                        <p className="font-bold text-text-main mt-1" style={{fontFamily:'JetBrains Mono, monospace'}}>{d.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Floating badges */}
                <div className="mt-6 grid grid-cols-3 gap-2">
                  {[
                    {icon:'factory', val:'500+', label:'Industries'},
                    {icon:'token', val:'100K+', label:'Credits'},
                    {icon:'verified', val:'50+', label:'Auditors'},
                  ].map(s => (
                    <div key={s.label} className="text-center p-2 bg-green-50 border border-primary/20">
                      <p className="font-bold text-primary text-lg font-display">{s.val}</p>
                      <p className="text-[10px] text-text-muted">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ LIVE STATS ═══ */}
        <section className="bg-gray-50 py-12 px-6 border-b border-border-subtle">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {label:'Registered Industries', value:500, suffix:'+', icon:'factory'},
              {label:'Credits Issued', value:100000, suffix:'+', icon:'token'},
              {label:'CO₂ Reduced (T)', value:2500000, suffix:'', icon:'co2'},
              {label:'Verified Auditors', value:50, suffix:'+', icon:'verified'},
            ].map(s => (
              <div key={s.label} className="bg-white p-6 border border-border-subtle hover:border-primary/30 transition-colors">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">{s.label}</p>
                <p className="font-display font-bold text-primary" style={{fontSize:'2.5rem', lineHeight:1}}>
                  <AnimatedCounter end={s.value} suffix={s.suffix} />
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ SYSTEM CAPABILITIES ═══ */}
        <section id="features" className="bg-white py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Platform Features</span>
              <h2 className="font-display font-bold text-5xl text-text-main mt-2 uppercase">SYSTEM CAPABILITIES</h2>
              <div className="w-16 h-1 bg-primary mt-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((f, i) => (
                <div key={f.title} className={`bg-white p-8 border border-border-subtle border-l-4 hover:shadow-md transition-shadow ${
                  i % 3 === 0 ? 'border-l-primary' : i % 3 === 1 ? 'border-l-emerald-500' : 'border-l-amber-500'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`material-symbols-outlined text-4xl ${f.iconColor}`}>{f.icon}</span>
                    <span className={`text-[10px] px-2 py-1 font-bold uppercase tracking-widest ${f.badgeColor}`}>{f.badge}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-text-main mb-2">{f.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ GOVERNANCE & LIFECYCLE ═══ */}
        <section id="workflow" className="bg-gray-50 py-24 px-6 border-y border-border-subtle">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-text-main px-4 py-1 border border-text-main mb-4">14-STEP WORKFLOW</span>
              <h2 className="font-display font-bold text-5xl text-text-main uppercase">GOVERNANCE & LIFECYCLE</h2>
            </div>
            <div className="space-y-4">
              {workflowPhases.map((phase, i) => (
                <div key={phase.phase} className="bg-white p-8 border border-border-subtle border-l-4 border-l-primary grid md:grid-cols-[100px_1fr] gap-8 items-start">
                  <span className="font-display font-bold text-primary/10 select-none" style={{fontSize:'5rem', lineHeight:1}}>0{i+1}</span>
                  <div>
                    <h4 className="font-display font-bold text-xl text-text-main mb-3 uppercase">{phase.title}</h4>
                    <ul className="space-y-1.5">
                      {phase.steps.map((step, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-text-muted">
                          <span className="material-symbols-outlined text-primary text-base flex-shrink-0 mt-0.5">arrow_right</span>{step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/how-it-works" className="btn-secondary h-12 px-8 text-sm inline-flex">
                <span className="material-symbols-outlined text-base">info</span>See Full Workflow with AI Gate Details
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ MAKING CARBON MARKETS TRUSTWORTHY ═══ */}
        <section className="bg-white py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display font-bold text-5xl text-text-main mb-12">
              MAKING CARBON MARKETS <span className="text-primary">TRUSTWORTHY.</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {icon:'auto_awesome', label:'AI-Verified', sub:'Non-human bias in data auditing.'},
                {icon:'lock', label:'Immutable', sub:'Permanent record of all actions.'},
                {icon:'hub', label:'Trustless', sub:'Decentralized ledger technology.'},
                {icon:'history', label:'Traceability', sub:'Deep lineage for every credit.'},
              ].map(m => (
                <div key={m.label} className="space-y-3">
                  <span className="material-symbols-outlined text-primary text-3xl">{m.icon}</span>
                  <h4 className="font-bold text-text-main uppercase tracking-wide text-xs">{m.label}</h4>
                  <p className="text-text-muted text-sm leading-relaxed">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ LIVE LEDGER (dark section) ═══ */}
        <section className="py-24 px-6" style={{background:'#071022'}}>
          <div className="max-w-7xl mx-auto border border-primary/30 p-8">
            <div className="flex justify-between items-center mb-8 border-b border-primary/20 pb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl tracking-widest text-primary" style={{fontFamily:'JetBrains Mono, monospace'}}>LIVE LEDGER</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-primary/60 uppercase tracking-widest" style={{fontFamily:'JetBrains Mono, monospace'}}>Node Connected</span>
                </div>
              </div>
              <span className="text-[10px] text-gray-500" style={{fontFamily:'JetBrains Mono, monospace'}}>BLOCK: #14,899,201</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse" style={{fontFamily:'JetBrains Mono, monospace'}}>
                <thead className="text-xs tracking-widest border-b border-primary/20" style={{color:'rgba(26,122,74,0.6)'}}>
                  <tr>
                    <th className="py-3 px-2 font-normal">TX HASH</th>
                    <th className="py-3 px-2 font-normal">TYPE</th>
                    <th className="py-3 px-2 font-normal text-right">AMOUNT</th>
                    <th className="py-3 px-2 font-normal text-right">TIME</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{borderColor:'rgba(26,122,74,0.1)'}}>
                  {liveTxns.map((tx, i) => (
                    <tr key={i} className="hover:bg-primary/5 transition-colors">
                      <td className="py-3 px-2 text-primary font-medium">{tx.hash}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 border text-[10px] tracking-widest ${
                          tx.type==='MINT' ? 'border-green-500 text-green-400 bg-green-500/10' :
                          tx.type==='RETIRE' ? 'border-amber-500 text-amber-400 bg-amber-500/10' :
                          'border-blue-500 text-blue-400 bg-blue-500/10'
                        }`}>{tx.type}</span>
                      </td>
                      <td className={`py-3 px-2 text-right font-bold ${tx.color}`}>{tx.amount}</td>
                      <td className="py-3 px-2 text-right text-xs text-gray-500">{tx.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 pt-4 border-t border-primary/20 flex justify-between items-center">
              <span className="text-xs text-gray-500" style={{fontFamily:'JetBrains Mono, monospace'}}>Updated every block (~2s)</span>
              <Link to="/public/dashboard?tab=market" className="btn-primary text-xs h-8 px-4">
                Explore Explorer<span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ WHY BLOCKCHAIN ═══ */}
        <section className="bg-white py-24 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="font-display font-bold text-5xl text-text-main mb-6 uppercase">WHY THE BLOCKCHAIN LAYER?</h2>
              <p className="text-text-muted leading-relaxed">
                Legacy systems rely on siloed databases and opaque manual verification. EcoChain replaces trust with cryptographic certainty — every emission record, audit report, and credit trade permanently secured on Polygon.
              </p>
            </div>
            <div className="space-y-5">
              {[
                {icon:'lock', title:'Immutable Record', desc:'AuditRegistry.sol stores every verified report on Polygon. Once confirmed, data cannot be altered.'},
                {icon:'do_not_touch', title:'No Double Counting', desc:'ERC-20 token burning via CreditRetirement.sol permanently removes credits — zero double spend.'},
                {icon:'smart_toy', title:'Smart Contract Automation', desc:'CarbonMarketplace.sol executes trustless trades with zero intermediaries.'},
                {icon:'public', title:'Public Verifiability', desc:'Anyone can verify any transaction on Polygonscan — no account required.'},
              ].map(li => (
                <div key={li.title} className="flex gap-4 items-start border-b border-border-subtle pb-4">
                  <span className="material-symbols-outlined text-primary mt-1 flex-shrink-0">{li.icon}</span>
                  <div>
                    <h4 className="font-bold text-text-main text-sm">{li.title}</h4>
                    <p className="text-sm text-text-muted mt-0.5 leading-snug">{li.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ ARCHITECTURE STACK ═══ */}
        <section id="architecture" className="bg-gray-50 py-24 px-6 border-y border-border-subtle">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted">System Architecture</span>
              <h2 className="font-display font-bold text-5xl text-text-main mt-2 mb-4 uppercase">ARCHITECTURE STACK</h2>
              <p className="text-text-muted max-w-2xl mx-auto">A robust, tiered environment built for scale. Four independent service layers — all deployable at $0 using free tiers.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {techLayers.map((layer, i) => (
                <div key={layer.layer} className="bg-white border border-border-subtle p-5 space-y-4 hover:border-primary/30 transition-colors">
                  <p className="text-xs font-bold uppercase tracking-widest text-text-main border-b border-border-subtle pb-2">
                    0{i+1} {layer.layer.toUpperCase()}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {layer.items.map(item => (
                      <span key={item} className="px-2 py-1 bg-gray-50 text-[10px] text-text-muted border border-border-subtle"
                        style={{fontFamily:'JetBrains Mono, monospace'}}>{item}</span>
                    ))}
                  </div>
                  <span className="block text-xs text-primary font-bold">● PRODUCTION READY</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ INTEGRATED PORTALS ═══ */}
        <section id="portals" className="bg-white py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display font-bold text-5xl text-text-main mb-4 text-center uppercase">INTEGRATED PORTALS</h2>
            <p className="text-text-muted text-center mb-12">6 portals, 33 screens — each role gets a purpose-built workspace with tailored features and data.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {portals.map(p => (
                <Link key={p.role} to={p.href}
                  className="p-8 border border-border-subtle hover:bg-gray-50 hover:border-primary/30 transition-all flex flex-col items-center text-center group">
                  <span className="material-symbols-outlined text-4xl mb-4 text-text-muted group-hover:text-primary transition-colors">{p.icon}</span>
                  <h4 className="font-bold text-text-main group-hover:text-primary transition-colors">{p.role}</h4>
                  <p className="text-xs text-text-muted mt-1">Portal →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="bg-gray-50 py-24 px-6 border-t border-border-subtle">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
            <span className="material-symbols-outlined text-primary text-6xl">eco</span>
            <h2 className="font-display font-bold text-5xl text-text-main uppercase">READY TO MAKE AN IMPACT?</h2>
            <p className="text-text-muted text-lg max-w-2xl">Join the sovereign ecosystem for institutional carbon trading. Free forever · No credit card required.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register" className="btn-primary h-14 px-10 text-sm">
                Register Organization<span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link to="/public/dashboard" className="btn-secondary h-14 px-10 text-sm">
                <span className="material-symbols-outlined">public</span>Explore Public Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="border-t border-border-subtle bg-gray-50 pt-16 pb-8 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-lg">eco</span>
                </div>
                <span className="font-display font-bold text-text-main">ECOCHAIN</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">Blockchain-Powered AI-Verified Carbon Emission Monitoring & Trading Platform.</p>
              <p className="text-xs text-text-muted mt-4">© 2026 EcoChain Protocol</p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-bold text-text-main mb-2">Platform</span>
              {[{label:'Dashboard', to:'/public/dashboard'},{label:'Policies & Reports', to:'/public/policies'}].map(l => (
                <Link key={l.to} className="text-text-muted hover:text-primary transition-colors" to={l.to}>{l.label}</Link>
              ))}
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-bold text-text-main mb-2">Learn</span>
              {[{label:'How It Works', to:'/how-it-works'},{label:'Register', to:'/register'}].map(l => (
                <Link key={l.to} className="text-text-muted hover:text-primary transition-colors" to={l.to}>{l.label}</Link>
              ))}
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-bold text-text-main mb-2">Portals</span>
              {[{label:'Industry Login', to:'/login'},{label:'Auditor Login', to:'/login'},{label:'Government Login', to:'/login'},{label:'Admin Login', to:'/login'}].map(l => (
                <Link key={l.label} className="text-text-muted hover:text-primary transition-colors" to={l.to}>{l.label}</Link>
              ))}
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-bold text-text-main mb-2">Compliance</span>
              {['GHG Protocol','ISO 14064','IPCC Factors','ERC-20 Standard','GDPR','OWASP Top 10'].map(l => (
                <span key={l} className="text-text-muted">{l}</span>
              ))}
            </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-border-subtle pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-sm">eco</span>MERN + Python FastAPI + Solidity/Foundry + Polygon
            </span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Mainnet Live</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> API Online</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" /> AI Service Up</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}


export default function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' },
        success: { iconTheme: { primary: '#1A7A4A', secondary: '#fff' } },
      }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Dashboard Layout with Protected Routes */}
        <Route element={<DashboardLayout />}>
          {/* Industry Routes */}
          <Route path="/industry/dashboard" element={<ProtectedRoute allowedRoles={['industry']}><IndustryDashboard /></ProtectedRoute>} />
          <Route path="/industry/emissions/new" element={<ProtectedRoute allowedRoles={['industry']}><AddEmission /></ProtectedRoute>} />
          <Route path="/industry/emissions" element={<ProtectedRoute allowedRoles={['industry']}><EmissionHistory /></ProtectedRoute>} />
          <Route path="/industry/marketplace" element={<ProtectedRoute allowedRoles={['industry']}><Marketplace /></ProtectedRoute>} />
          <Route path="/industry/ai-forecast" element={<ProtectedRoute allowedRoles={['industry']}><AiForecast /></ProtectedRoute>} />
          <Route path="/industry/wallet" element={<ProtectedRoute allowedRoles={['industry']}><Wallet /></ProtectedRoute>} />
          <Route path="/industry/tracker" element={<ProtectedRoute allowedRoles={['industry']}><SubmissionTracker /></ProtectedRoute>} />
          <Route path="/industry/notifications" element={<ProtectedRoute allowedRoles={['industry']}><IndustryNotifications /></ProtectedRoute>} />
          <Route path="/industry/reports" element={<ProtectedRoute allowedRoles={['industry']}><IndustryReports /></ProtectedRoute>} />
          <Route path="/industry/compliance" element={<ProtectedRoute allowedRoles={['industry']}><IndustryCompliance /></ProtectedRoute>} />
          <Route path="/industry/profile" element={<ProtectedRoute allowedRoles={['industry']}><IndustryProfile /></ProtectedRoute>} />

          {/* Government Routes */}
          <Route path="/gov/dashboard" element={<ProtectedRoute allowedRoles={['government']}><GovDashboard /></ProtectedRoute>} />
          <Route path="/gov/verification" element={<ProtectedRoute allowedRoles={['government']}><GovVerification /></ProtectedRoute>} />
          <Route path="/gov/reports" element={<ProtectedRoute allowedRoles={['government']}><ReportReview /></ProtectedRoute>} />
          <Route path="/gov/issue-credits" element={<ProtectedRoute allowedRoles={['government']}><IssueCredits /></ProtectedRoute>} />
          <Route path="/gov/registry" element={<ProtectedRoute allowedRoles={['government']}><GovRegistry /></ProtectedRoute>} />
          <Route path="/gov/compliance" element={<ProtectedRoute allowedRoles={['government']}><ComplianceMonitor /></ProtectedRoute>} />
          <Route path="/gov/monitoring" element={<ProtectedRoute allowedRoles={['government']}><GovIndustriesAnalytics /></ProtectedRoute>} />
          <Route path="/gov/analytics" element={<ProtectedRoute allowedRoles={['government']}><GovIndustriesAnalytics /></ProtectedRoute>} />
          <Route path="/gov/blockchain" element={<ProtectedRoute allowedRoles={['government']}><GovBlockchain /></ProtectedRoute>} />
          <Route path="/gov/notifications" element={<ProtectedRoute allowedRoles={['government']}><GovNotifications /></ProtectedRoute>} />
          <Route path="/gov/ai-verifier" element={<ProtectedRoute allowedRoles={['government']}><GovAIVerifier /></ProtectedRoute>} />
          <Route path="/gov/assignment" element={<ProtectedRoute allowedRoles={['government']}><GovAuditorAssignment /></ProtectedRoute>} />
          <Route path="/gov/profile" element={<ProtectedRoute allowedRoles={['government']}><GovProfile /></ProtectedRoute>} />

          {/* Auditor Routes */}
          <Route path="/auditor/dashboard" element={<ProtectedRoute allowedRoles={['auditor']}><AuditorDashboard /></ProtectedRoute>} />
          <Route path="/auditor/queue" element={<ProtectedRoute allowedRoles={['auditor']}><AuditQueue /></ProtectedRoute>} />
          <Route path="/auditor/verify/:id" element={<ProtectedRoute allowedRoles={['auditor']}><VerifySubmit /></ProtectedRoute>} />
          <Route path="/auditor/blockchain" element={<ProtectedRoute allowedRoles={['auditor']}><AuditorBlockchain /></ProtectedRoute>} />
          <Route path="/auditor/history" element={<ProtectedRoute allowedRoles={['auditor']}><AuditorHistory /></ProtectedRoute>} />
          <Route path="/auditor/profile" element={<ProtectedRoute allowedRoles={['auditor']}><AuditorProfile /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/config" element={<ProtectedRoute allowedRoles={['admin']}><AdminConfig /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['admin']}><AdminLogs /></ProtectedRoute>} />
          <Route path="/admin/content" element={<ProtectedRoute allowedRoles={['admin']}><AdminContent /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><AdminProfile /></ProtectedRoute>} />
        </Route>

        {/* Industry Onboarding */}
        <Route path="/register/industry/step1" element={<IndustryStep1 />} />
        <Route path="/register/industry/step2" element={<IndustryStep2 />} />
        <Route path="/register/industry/review" element={<IndustryStep3 />} />

        {/* Government Onboarding */}
        <Route path="/register/government/step1" element={<GovStep1 />} />
        <Route path="/register/government/step2" element={<GovStep2 />} />
        <Route path="/register/government/review" element={<GovStep3 />} />
        <Route path="/register/government/pending" element={<GovPendingVerification />} />

        {/* Auditor Onboarding */}
        <Route path="/register/auditor/step1" element={<AuditorStep1 />} />
        <Route path="/register/auditor/step2" element={<AuditorStep2 />} />
        <Route path="/register/auditor/review" element={<AuditorStep3 />} />
        <Route path="/register/auditor/pending" element={<AuditorPendingVerification />} />

        {/* Public Routes */}
        <Route path="/transparency" element={<TransparencyDashboard />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Navigate to="/how-it-works?tab=contact" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/public/dashboard" element={<PublicDashboard />} />
        <Route path="/public/map" element={<Navigate to="/public/dashboard" replace />} />
        <Route path="/public/market" element={<Navigate to="/public/dashboard" replace />} />
        <Route path="/public/policies" element={<PoliciesReports />} />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
