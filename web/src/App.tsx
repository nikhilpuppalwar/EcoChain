import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AnimatedCounter from './components/AnimatedCounter';
import LoginPage from './pages/LoginPage';
import ResetPassword from './pages/ResetPassword';


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
import GovAnalytics from './pages/goverment/GovAnalytics';
import GovBlockchain from './pages/goverment/GovBlockchain';
import GovNotifications from './pages/goverment/GovNotifications';
import TransparencyDashboard from './pages/TransparencyDashboard';
import NotFound from './pages/NotFound';
import GovPendingVerification from './pages/GovPendingVerification';
import AuditorPendingVerification from './pages/AuditorPendingVerification';
// Landing & Public pages
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Register from './pages/Register';
import PublicDashboard from './pages/public/PublicDashboard';
import EmissionMap from './pages/public/EmissionMap';
import CarbonMarket from './pages/public/CarbonMarket';
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
      {/* ═══════════════════════════════════════════════
          NAVBAR
      ═══════════════════════════════════════════════ */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-green">
              <span className="material-symbols-outlined text-white text-2xl">eco</span>
            </div>
            <span className="text-xl font-display font-bold tracking-wide text-text-main">ECOCHAIN</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link className="text-sm font-medium text-text-muted hover:text-primary transition-colors" to="/public/dashboard">Public Data</Link>
            <Link className="text-sm font-medium text-text-muted hover:text-primary transition-colors" to="/how-it-works">How It Works</Link>
            <Link className="text-sm font-medium text-text-muted hover:text-primary transition-colors" to="/public/market">Carbon Market</Link>
            <Link className="text-sm font-medium text-text-muted hover:text-primary transition-colors" to="/contact">Contact</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/register" className="hidden sm:block text-sm font-medium text-text-muted hover:text-primary transition-colors">Register</Link>
            <Link to="/login" className="btn-primary h-10 px-6 text-sm">
              Login
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════ */}
      <main className="relative pt-20">
        {/* Background layers */}
        <div className="absolute inset-0 z-0 pointer-events-none hero-glow" />
        <div className="absolute inset-0 z-0 pointer-events-none bg-dots opacity-50" />

        <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 lg:pt-28 lg:pb-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Hero text */}
          <div className="flex flex-col gap-8 animate-slide-up">
            <div className="section-label w-fit">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Mainnet Live · March 2026
            </div>

            <h1 className="font-display font-bold text-5xl lg:text-7xl leading-[0.92] text-text-main">
              TRANSPARENT<br />
              <span className="text-gradient-green">CARBON.</span><br />
              <span className="text-4xl lg:text-5xl text-text-muted font-normal">Verified by AI. Secured by Blockchain.</span>
            </h1>

            <p className="text-lg text-text-muted max-w-lg leading-relaxed">
              EcoChain brings accountability to carbon emissions — with AI anomaly detection, immutable blockchain audit trails, and trustless smart-contract trading.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary h-14 px-8 text-base">
                Get Started Free
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link to="/public/dashboard" className="btn-secondary h-14 px-8 text-base">
                <span className="material-symbols-outlined">public</span>
                Explore Public Data
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border-subtle">
              {[
                { icon: 'security', label: 'ISO 14064 Compliant' },
                { icon: 'gpp_good', label: 'OWASP Top 10 Secure' },
                { icon: 'currency_exchange', label: 'ERC-20 Standard' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="material-symbols-outlined text-primary text-base">{b.icon}</span>
                  {b.label}
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual: animated globe + floating cards */}
          <div className="relative h-[460px] flex items-center justify-center">
            {/* Orbiting rings */}
            <div className="absolute w-[380px] h-[380px] border border-primary/10 rounded-full animate-[spin_50s_linear_infinite]" />
            <div className="absolute w-[300px] h-[300px] border border-dashed border-primary/15 rounded-full animate-[spin_35s_linear_infinite_reverse]" />
            <div className="absolute w-[220px] h-[220px] border border-primary/20 rounded-full" />

            {/* Globe core */}
            <div className="relative w-48 h-48 bg-gradient-to-br from-primary to-primary-light rounded-full shadow-green flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 carbon-pattern opacity-30" />
              <span className="material-symbols-outlined text-white text-7xl z-10">public</span>
            </div>

            {/* Floating card: AI Result */}
            <div className="absolute top-6 right-4 lg:right-0 animate-float">
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-border-subtle shadow-card border-l-4 border-l-violet-500 min-w-[180px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-violet-500 text-base">psychology</span>
                  <span className="text-xs font-mono text-violet-600 font-bold">AI RESULT</span>
                </div>
                <div className="text-lg font-bold text-text-main font-display">Risk: 12/100</div>
                <div className="text-xs text-emerald-600 font-bold flex items-center gap-1"><span className="material-symbols-outlined text-xs">check_circle</span> Clean — Pass</div>
              </div>
            </div>

            {/* Floating card: Block confirmed */}
            <div className="absolute bottom-12 left-0 lg:-left-4 animate-float-slow">
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-border-subtle shadow-card border-l-4 border-l-primary min-w-[180px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-base">link</span>
                  <span className="text-xs font-mono text-primary font-bold">BLOCK #8,421</span>
                </div>
                <div className="text-lg font-bold text-text-main font-display">+840 tCO₂e</div>
                <div className="text-xs text-text-muted">Credits Minted • Polygon</div>
              </div>
            </div>

            {/* Floating card: Audit done */}
            <div className="absolute top-1/2 -translate-y-1/2 right-0 lg:-right-4 animate-[bounce_4s_ease-in-out_infinite]">
              <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl border border-border-subtle shadow-card">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-600 text-lg">verified_user</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-main">Audit Approved</p>
                    <p className="text-[10px] text-text-muted">Dr. Tanaka · 2s ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            LIVE STATS COUNTERS
        ═══════════════════════════════════════════════ */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Registered Industries', value: 500, suffix: '+', icon: 'factory', color: 'text-blue-600', bg: 'bg-blue-50', trend: '+48 this month' },
              { label: 'Carbon Credits Issued', value: 100000, suffix: '+', icon: 'token', color: 'text-primary', bg: 'bg-green-50', trend: 'tCO₂e tokenized' },
              { label: 'CO₂ Reduced', value: 2500000, suffix: '', icon: 'co2', color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Tonnes verified' },
              { label: 'Certified Auditors', value: 50, suffix: '+', icon: 'verified', color: 'text-violet-600', bg: 'bg-violet-50', trend: '94% approval rate' },
            ].map(s => (
              <div key={s.label} className="stat-card group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-light rounded-t-2xl" />
                <div className="flex justify-between items-start mb-4">
                  <span className="text-text-muted text-sm font-medium">{s.label}</span>
                  <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-base ${s.color}`}>{s.icon}</span>
                  </div>
                </div>
                <h3 className="text-3xl font-display font-bold text-text-main mb-1">
                  <AnimatedCounter end={s.value} suffix={s.suffix} />
                </h3>
                <p className="text-xs text-text-muted">{s.trend}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            6 FEATURE CARDS
        ═══════════════════════════════════════════════ */}
        <section className="relative z-10 bg-white border-y border-border-subtle py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="section-label w-fit mx-auto mb-4">Platform Features</div>
              <h2 className="font-display font-bold text-4xl lg:text-5xl text-text-main mb-4">
                EVERYTHING YOU NEED
              </h2>
              <p className="text-text-muted max-w-2xl mx-auto text-lg">
                Six integrated modules designed to make carbon compliance transparent, automated, and trustless.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(f => (
                <div key={f.title} className="group bg-white rounded-2xl border border-border-subtle p-7 card-hover-lift shadow-sm hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-2xl ${f.iconColor}`}>{f.icon}</span>
                    </div>
                    <span className={`feature-chip ${f.badgeColor}`}>{f.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold font-display text-text-main mb-3 group-hover:text-primary transition-colors">{f.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{f.description}</p>
                  <div className={`mt-5 h-1 w-16 bg-gradient-to-r ${f.color} rounded-full transition-all duration-300 group-hover:w-full`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            14-STEP WORKFLOW (4 PHASES)
        ═══════════════════════════════════════════════ */}
        <section className="relative z-10 py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="section-label w-fit mx-auto mb-4">14-Step Workflow</div>
            <h2 className="font-display font-bold text-4xl lg:text-5xl text-text-main mb-4">HOW IT WORKS</h2>
            <p className="text-text-muted max-w-2xl mx-auto text-lg">
              From raw emission data to blockchain-secured carbon credit — a fully automated 14-step pipeline with 3 AI decision gates.
            </p>
          </div>

          {/* Phase cards with connector arrows */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line (desktop only) */}
            <div className="absolute top-10 left-0 w-full h-0.5 bg-gradient-to-r from-blue-300 via-violet-300 via-emerald-300 to-orange-300 hidden lg:block z-0 pointer-events-none" />

            {workflowPhases.map((phase, i) => (
              <div key={phase.phase} className="relative z-10 flex flex-col bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden card-hover-lift">
                <div className={`${phase.color} p-5`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm font-display">PHASE {phase.phase}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white text-3xl">{phase.icon}</span>
                    <h3 className="text-white font-bold text-lg font-display">{phase.title}</h3>
                  </div>
                </div>
                <ul className="p-5 flex flex-col gap-2.5 flex-1">
                  {phase.steps.map((step, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm">
                      <div className={`w-5 h-5 rounded-full ${phase.lightBg} ${phase.textColor} flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5`}>
                        {(i * 4) + j + 1}
                      </div>
                      <span className="text-text-muted leading-snug">{step}</span>
                    </li>
                  ))}
                </ul>
                {i < workflowPhases.length - 1 && (
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-border-subtle rounded-full items-center justify-center z-20 hidden lg:flex">
                    <span className="material-symbols-outlined text-text-muted text-sm">arrow_forward</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/how-it-works" className="btn-secondary h-12 px-8 text-sm inline-flex">
              <span className="material-symbols-outlined text-base">info</span>
              See Full Workflow with AI Gate Details
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            MISSION & VISION
        ═══════════════════════════════════════════════ */}
        <section className="relative z-10 bg-gradient-to-br from-primary to-primary-dark py-24 overflow-hidden">
          <div className="absolute inset-0 carbon-pattern opacity-20" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="flex flex-col gap-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 w-fit">
                  <span className="material-symbols-outlined text-white text-base">eco</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Our Mission</span>
                </div>
                <h2 className="font-display font-bold text-4xl lg:text-5xl text-white leading-tight">
                  MAKING CARBON MARKETS<br />
                  <span className="text-primary-light">TRUSTWORTHY.</span>
                </h2>
                <p className="text-white/80 text-lg leading-relaxed">
                  Carbon markets fail when data can be manipulated, credits double-counted, and trades lack transparency. EcoChain solves all three — using AI to catch fraud, blockchain to ensure immutability, and smart contracts to eliminate intermediaries.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {[
                    { icon: 'verified_user', label: 'AI-Verified Data', sub: 'Isolation Forest catches fraud' },
                    { icon: 'lock', label: 'Blockchain Immutability', sub: 'Polygon stores every report' },
                    { icon: 'swap_horiz', label: 'Trustless Trading', sub: 'Smart contracts automate trades' },
                    { icon: 'loop', label: 'End-to-End Traceability', sub: 'Mint → Trade → Retire tracked' },
                  ].map(m => (
                    <div key={m.label} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-white text-lg">{m.icon}</span>
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{m.label}</p>
                        <p className="text-white/60 text-xs">{m.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vision stats */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '95%+', label: 'AI Detection Accuracy', icon: 'psychology' },
                  { value: '$0', label: 'Total Infrastructure Cost', icon: 'savings' },
                  { value: '500+', label: 'Industries (Year 1 Target)', icon: 'factory' },
                  { value: '100k', label: 'tCO₂e Credits (Year 1)', icon: 'token' },
                ].map(v => (
                  <div key={v.label} className="bg-white/10 border border-white/15 rounded-2xl p-6 text-center backdrop-blur-sm">
                    <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="material-symbols-outlined text-white text-xl">{v.icon}</span>
                    </div>
                    <div className="text-3xl font-display font-bold text-primary-light mb-1">{v.value}</div>
                    <p className="text-white/70 text-xs">{v.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            WHY BLOCKCHAIN + LIVE LEDGER
        ═══════════════════════════════════════════════ */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="flex flex-col gap-6 lg:sticky top-32">
              <div className="section-label w-fit">Blockchain First</div>
              <h2 className="font-display font-bold text-4xl lg:text-5xl text-text-main">WHY BLOCKCHAIN?</h2>
              <p className="text-text-muted text-lg leading-relaxed">
                Traditional carbon markets suffer from double-counting, opacity, and fraud. EcoChain uses a public, immutable ledger to ensure every credit is real, unique, and verifiable by anyone.
              </p>
              <ul className="space-y-5 mt-2">
                {[
                  { icon: 'lock', title: 'Immutable Record', desc: 'AuditRegistry.sol stores every verified report on Polygon. Once confirmed, data cannot be altered.', color: 'text-blue-600 bg-blue-50' },
                  { icon: 'do_not_touch', title: 'No Double Counting', desc: 'ERC-20 token burning via CreditRetirement.sol permanently removes credits — zero double spend.', color: 'text-emerald-600 bg-emerald-50' },
                  { icon: 'smart_toy', title: 'Smart Contract Automation', desc: 'CarbonMarketplace.sol executes trustless trades with zero intermediaries or manual approval.', color: 'text-violet-600 bg-violet-50' },
                  { icon: 'public', title: 'Public Verifiability', desc: 'Anyone can search, verify, and export any transaction on Polygonscan — no account required.', color: 'text-amber-600 bg-amber-50' },
                ].map(li => (
                  <li key={li.title} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${li.color}`}>
                      <span className="material-symbols-outlined text-xl">{li.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-text-main">{li.title}</h4>
                      <p className="text-sm text-text-muted mt-0.5 leading-snug">{li.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Live Ledger Feed */}
            <div className="bg-white rounded-2xl border border-border-subtle shadow-card overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-border-subtle bg-gray-50/70">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-mono font-bold text-primary">LIVE LEDGER</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted font-mono">Polygon Mainnet</span>
                  <span className="text-xs font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full">●&nbsp;Connected</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-xs font-bold text-text-muted uppercase tracking-wide px-5 py-3 border-b border-gray-50">
                <span>TX Hash</span>
                <span>Type</span>
                <span>Amount</span>
                <span className="text-right">Time</span>
              </div>

              <div className="divide-y divide-gray-50">
                {liveTxns.map((tx, i) => (
                  <div key={i} className={`grid grid-cols-4 gap-3 px-5 py-3.5 text-sm font-mono items-center ${i === 0 ? 'bg-green-50/50' : 'hover:bg-gray-50'} transition-colors`}>
                    <span className="text-primary font-bold truncate">{tx.hash}</span>
                    <span className={`font-bold text-xs inline-flex items-center gap-1 ${tx.type === 'MINT' ? 'text-emerald-600 bg-emerald-50' : tx.type === 'RETIRE' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'
                      } px-2 py-0.5 rounded-full w-fit`}>
                      {tx.type}
                    </span>
                    <span className={`font-bold ${tx.color}`}>{tx.amount}</span>
                    <span className="text-right text-text-muted text-xs">{tx.time}</span>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-border-subtle flex items-center justify-between">
                <span className="text-xs text-text-muted">Updated every block (~2s)</span>
                <Link to="/public/market" className="btn-primary text-xs h-8 px-4">
                  Explore Explorer
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            SYSTEM ARCHITECTURE OVERVIEW
        ═══════════════════════════════════════════════ */}
        <section className="relative z-10 bg-gray-50 border-y border-border-subtle py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="section-label w-fit mx-auto mb-4">System Architecture</div>
              <h2 className="font-display font-bold text-4xl lg:text-5xl text-text-main mb-4">BUILT FOR SCALE</h2>
              <p className="text-text-muted max-w-2xl mx-auto text-lg">
                Four independent service layers — all deployable at $0 using free tiers. Each layer scales independently.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {techLayers.map((layer, i) => (
                <div key={layer.layer} className="relative flex flex-col">
                  {/* Connector arrow */}
                  {i < techLayers.length - 1 && (
                    <div className="absolute -right-3 top-12 w-6 h-6 bg-white border border-border-subtle rounded-full items-center justify-center z-10 hidden lg:flex shadow-sm">
                      <span className="material-symbols-outlined text-text-muted text-sm">arrow_forward</span>
                    </div>
                  )}
                  <div className="bg-white rounded-2xl border border-border-subtle shadow-sm p-6 card-hover-lift flex flex-col gap-4 h-full">
                    <div className={`w-12 h-12 ${layer.color} rounded-2xl flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-2xl">{layer.icon}</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Layer {i + 1}</div>
                      <h3 className="font-bold text-lg font-display text-text-main">{layer.layer}</h3>
                      <p className="text-sm text-text-muted font-mono">{layer.tech}</p>
                    </div>
                    <div className="flex-1">
                      {layer.items.map(item => (
                        <div key={item} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                          <span className="material-symbols-outlined text-primary text-sm">check</span>
                          <span className="text-xs text-text-muted">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs font-bold text-text-muted bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">cloud</span>
                      {layer.host} — Free Tier
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            ROLE PORTAL CARDS
        ═══════════════════════════════════════════════ */}
        <section className="relative z-10 py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="section-label w-fit mx-auto mb-4">Role-Based Portals</div>
            <h2 className="font-display font-bold text-4xl lg:text-5xl text-text-main mb-4">YOUR PORTAL AWAITS</h2>
            <p className="text-text-muted max-w-2xl mx-auto text-lg">
              6 portals, 33 screens — each role gets a purpose-built workspace with tailored features and data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portals.map(p => (
              <Link key={p.role} to={p.href} className={`group block bg-white rounded-2xl border border-border-subtle ${p.hoverBorder} shadow-sm card-hover-lift overflow-hidden transition-all`}>
                <div className={`${p.color} p-6`}>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-white text-2xl">{p.icon}</span>
                  </div>
                  <h3 className="text-white font-bold text-xl font-display">{p.role} Portal</h3>
                  <p className="text-white/70 text-sm">Login to begin →</p>
                </div>
                <div className="p-5">
                  <ul className="space-y-2.5">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-text-muted">
                        <span className="material-symbols-outlined text-primary text-base flex-shrink-0 mt-0.5">check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            CTA SECTION
        ═══════════════════════════════════════════════ */}
        <section className="relative z-10 bg-white border-t border-border-subtle py-24 px-6">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-3xl">eco</span>
            </div>
            <h2 className="font-display font-bold text-4xl lg:text-6xl text-text-main">
              READY TO MAKE AN IMPACT?
            </h2>
            <p className="text-text-muted text-xl max-w-2xl">
              Join industries, auditors, and governments building the transparent carbon market of the future — at zero cost.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register" className="btn-primary h-14 px-10 text-base">
                Register Your Organization
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link to="/public/dashboard" className="btn-secondary h-14 px-10 text-base">
                <span className="material-symbols-outlined">public</span>
                Explore Public Dashboard
              </Link>
            </div>
            <p className="text-sm text-text-muted">Free forever · No credit card required · Deploy in minutes</p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════════ */}
        <footer className="border-t border-border-subtle bg-gray-50 pt-16 pb-8 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-lg">eco</span>
                </div>
                <span className="font-display font-bold text-text-main">ECOCHAIN</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Blockchain-Powered AI-Verified Carbon Emission Monitoring & Trading Platform.
              </p>
              <p className="text-xs text-text-muted mt-4">© 2026 EcoChain Protocol</p>
            </div>

            <div className="flex flex-col gap-2 text-sm">
              <span className="font-bold text-text-main mb-2">Platform</span>
              {[
                { label: 'Public Dashboard', to: '/public/dashboard' },
                { label: 'Carbon Market', to: '/public/market' },
                { label: 'Emission Map', to: '/public/map' },
                { label: 'Policies', to: '/public/policies' },
              ].map(l => (
                <Link key={l.to} className="text-text-muted hover:text-primary transition-colors" to={l.to}>{l.label}</Link>
              ))}
            </div>

            <div className="flex flex-col gap-2 text-sm">
              <span className="font-bold text-text-main mb-2">Learn</span>
              {[
                { label: 'How It Works', to: '/how-it-works' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'Register', to: '/register' },
              ].map(l => (
                <Link key={l.to} className="text-text-muted hover:text-primary transition-colors" to={l.to}>{l.label}</Link>
              ))}
            </div>

            <div className="flex flex-col gap-2 text-sm">
              <span className="font-bold text-text-main mb-2">Portals</span>
              {[
                { label: 'Industry Login', to: '/login' },
                { label: 'Auditor Login', to: '/login' },
                { label: 'Government Login', to: '/login' },
                { label: 'Admin Login', to: '/login' },
              ].map(l => (
                <Link key={l.label} className="text-text-muted hover:text-primary transition-colors" to={l.to}>{l.label}</Link>
              ))}
            </div>

            <div className="flex flex-col gap-2 text-sm">
              <span className="font-bold text-text-main mb-2">Compliance</span>
              {['GHG Protocol', 'ISO 14064', 'IPCC Factors', 'ERC-20 Standard', 'GDPR', 'OWASP Top 10'].map(l => (
                <span key={l} className="text-text-muted">{l}</span>
              ))}
            </div>
          </div>

          <div className="max-w-7xl mx-auto border-t border-border-subtle pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-primary text-sm">eco</span> MERN + Python FastAPI + Solidity/Foundry + Polygon</span>
            </div>
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

          {/* Government Routes */}
          <Route path="/gov/dashboard" element={<ProtectedRoute allowedRoles={['government']}><GovDashboard /></ProtectedRoute>} />
          <Route path="/gov/reports" element={<ProtectedRoute allowedRoles={['government']}><ReportReview /></ProtectedRoute>} />
          <Route path="/gov/issue-credits" element={<ProtectedRoute allowedRoles={['government']}><IssueCredits /></ProtectedRoute>} />
          <Route path="/gov/compliance" element={<ProtectedRoute allowedRoles={['government']}><ComplianceMonitor /></ProtectedRoute>} />
          <Route path="/gov/monitoring" element={<ProtectedRoute allowedRoles={['government']}><GovMonitoring /></ProtectedRoute>} />
          <Route path="/gov/analytics" element={<ProtectedRoute allowedRoles={['government']}><GovAnalytics /></ProtectedRoute>} />
          <Route path="/gov/blockchain" element={<ProtectedRoute allowedRoles={['government']}><GovBlockchain /></ProtectedRoute>} />
          <Route path="/gov/notifications" element={<ProtectedRoute allowedRoles={['government']}><GovNotifications /></ProtectedRoute>} />

          {/* Auditor Routes */}
          <Route path="/auditor/dashboard" element={<ProtectedRoute allowedRoles={['auditor']}><AuditorDashboard /></ProtectedRoute>} />
          <Route path="/auditor/queue" element={<ProtectedRoute allowedRoles={['auditor']}><AuditQueue /></ProtectedRoute>} />
          <Route path="/auditor/verify/:id" element={<ProtectedRoute allowedRoles={['auditor']}><VerifySubmit /></ProtectedRoute>} />
          <Route path="/auditor/blockchain" element={<ProtectedRoute allowedRoles={['auditor']}><AuditorBlockchain /></ProtectedRoute>} />
          <Route path="/auditor/history" element={<ProtectedRoute allowedRoles={['auditor']}><AuditorHistory /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/config" element={<ProtectedRoute allowedRoles={['admin']}><AdminConfig /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['admin']}><AdminLogs /></ProtectedRoute>} />
          <Route path="/admin/content" element={<ProtectedRoute allowedRoles={['admin']}><AdminContent /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
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
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/public/dashboard" element={<PublicDashboard />} />
        <Route path="/public/map" element={<EmissionMap />} />
        <Route path="/public/market" element={<CarbonMarket />} />
        <Route path="/public/policies" element={<PoliciesReports />} />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
