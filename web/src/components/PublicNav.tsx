import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ecochainLogo from '../assets/ecochain_icon_white.png';

const navLinks = [
    { label: 'Dashboard', to: '/public/dashboard', icon: 'bar_chart' },
    { label: 'Policies & Reports', to: '/public/policies', icon: 'policy' },
    { label: 'How It Works', to: '/how-it-works', icon: 'info' },
];

export default function PublicNav() {
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);

    return (
        <>
            <div style={{ height: '3px', background: 'linear-gradient(to right, #FF9933 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #138808 66.6%)' }} />
            <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <Link to="/" className="flex items-center gap-2">
                            <img src={ecochainLogo} alt="EcoChain Icon" className="w-8 h-8 object-contain" />
                            <span className="text-base font-black tracking-wide text-gray-900 font-display">ECOCHAIN</span>
                        </Link>
                        <Link to="/public/dashboard" className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full hover:bg-emerald-200 transition-colors">
                            PUBLIC
                        </Link>
                    </div>

                    {/* Desktop links */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map(l => (
                            <Link
                                key={l.to}
                                to={l.to}
                                className={`text-sm font-medium px-3 py-2 rounded-lg transition-all ${pathname === l.to || pathname.startsWith(l.to)
                                        ? 'bg-emerald-50 text-primary font-bold'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {l.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side: Actions + hamburger */}
                    <div className="flex items-center gap-2">
                        <Link
                            to="/login"
                            className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-primary border border-primary/30 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">login</span>
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="hidden sm:flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold py-2 px-4 rounded-xl transition-colors shadow-green"
                        >
                            Register
                        </Link>
                        {/* Hamburger - mobile */}
                        <button
                            onClick={() => setOpen(v => !v)}
                            className="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                            aria-label="Open menu"
                        >
                            <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile drawer */}
                {open && (
                    <div className="lg:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-1 shadow-md">
                        {navLinks.map(l => (
                            <Link
                                key={l.to}
                                to={l.to}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname === l.to
                                        ? 'bg-emerald-50 text-primary font-bold'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-base">{l.icon}</span>
                                {l.label}
                            </Link>
                        ))}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 mt-2">
                            <Link to="/login" onClick={() => setOpen(false)}
                                className="flex items-center justify-center gap-1.5 text-sm font-bold text-primary border border-primary/30 bg-emerald-50 py-2.5 rounded-xl">
                                <span className="material-symbols-outlined text-base">login</span> Login
                            </Link>
                            <Link to="/register" onClick={() => setOpen(false)}
                                className="flex items-center justify-center bg-primary text-white text-sm font-bold py-2.5 rounded-xl">
                                Register
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
