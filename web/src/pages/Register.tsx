import { Link, useNavigate } from 'react-router-dom';
import ecochainIconDark from '../assets/ecochain_icon_dark.png';
import ecochainIconWhite from '../assets/ecochain_icon_white.png';
type Role = 'industry' | 'auditor' | 'government';

export default function Register() {
    const navigate = useNavigate();

    const roleMeta = {
        industry: { icon: 'factory', label: 'Industry / Business', desc: 'Manufacturing, energy, transport, or other emission-producing entities.', color: 'green' },
        auditor: { icon: 'fact_check', label: 'Environmental Auditor', desc: 'Certified professionals who review and sign emission audit reports.', color: 'violet' },
        government: { icon: 'account_balance', label: 'Government Official', desc: 'Ministry/EPA officials who verify industries and oversee compliance.', color: 'blue' },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white font-sans">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                            <img src={ecochainIconWhite} alt="EcoChain Logo" className="w-full h-full rounded-xl object-contain" />
                        </div>
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

                    {/* Role Picker */}
                    <div className="space-y-4">
                        {(Object.keys(roleMeta) as Role[]).map(r => (
                            <button
                                key={r}
                                onClick={() => navigate(`/register/${r}/step1`)}
                                className="w-full flex items-center gap-5 p-6 rounded-2xl border-2 hover:shadow-lg transition-all text-left border-gray-200 bg-white hover:border-gray-300"
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
                </div>
            </main>
        </div>
    );
}
