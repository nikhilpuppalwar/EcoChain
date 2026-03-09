import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function DashboardLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isIndustry = user?.role === 'industry';
    const isAuditor = user?.role === 'auditor';
    const isAdmin = user?.role === 'admin';
    const roleLabel = isIndustry ? 'Industry Portal' : isAuditor ? 'Auditor Portal' : isAdmin ? 'Admin Portal' : 'Government Admin';

    const industryLinks = [
        { name: 'Dashboard', href: '/industry/dashboard', icon: 'bar_chart' },
        { name: 'Emission History', href: '/industry/emissions', icon: 'eco' },
        { name: 'Add Emission', href: '/industry/emissions/new', icon: 'add_circle' },
        { name: 'Submission Tracker', href: '/industry/tracker', icon: 'assignment_turned_in' },
        { name: 'AI Forecast', href: '/industry/ai-forecast', icon: 'monitoring' },
        { name: 'Marketplace', href: '/industry/marketplace', icon: 'shopping_cart' },
        { name: 'Web3 Wallet', href: '/industry/wallet', icon: 'account_balance_wallet' },
        { name: 'Reports', href: '/industry/reports', icon: 'description' },
        { name: 'Notifications', href: '/industry/notifications', icon: 'notifications' },
    ];

    const govLinks = [
        { name: 'Dashboard', href: '/gov/dashboard', icon: 'bar_chart' },
        { name: 'Report Review', href: '/gov/reports', icon: 'description' },
        { name: 'Issue Credits', href: '/gov/issue-credits', icon: 'verified_user' },
        { name: 'Compliance Monitor', href: '/gov/compliance', icon: 'admin_panel_settings' },
        { name: 'Monitor Industries', href: '/gov/monitoring', icon: 'factory' },
        { name: 'Sector Analytics', href: '/gov/analytics', icon: 'analytics' },
        { name: 'Blockchain Records', href: '/gov/blockchain', icon: 'link' },
        { name: 'Send Notifications', href: '/gov/notifications', icon: 'campaign' },
    ];

    const auditorLinks = [
        { name: 'Dashboard', href: '/auditor/dashboard', icon: 'bar_chart' },
        { name: 'Audit Queue', href: '/auditor/queue', icon: 'assignment' },
        { name: 'Verify & Submit', href: '/auditor/verify/new', icon: 'fact_check' },
        { name: 'Blockchain Records', href: '/auditor/blockchain', icon: 'link' },
        { name: 'History & Alerts', href: '/auditor/history', icon: 'history' },
    ];

    const adminLinks = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: 'bar_chart' },
        { name: 'User Management', href: '/admin/users', icon: 'people' },
        { name: 'System Config', href: '/admin/config', icon: 'settings' },
        { name: 'Activity Logs', href: '/admin/logs', icon: 'receipt_long' },
        { name: 'Content Manager', href: '/admin/content', icon: 'article' },
        { name: 'Platform Settings', href: '/admin/settings', icon: 'tune' },
    ];

    const navLinks = isIndustry ? industryLinks : isAuditor ? auditorLinks : isAdmin ? adminLinks : govLinks;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const SidebarContent = () => (
        <>
            <div className="p-6">
                <Link to="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                    <span className="material-symbols-outlined text-[#1A7A4A] text-3xl">eco</span>
                    <span className="text-xl font-bold font-['Syne',sans-serif] text-slate-900 tracking-tight">EcoChain</span>
                </Link>
                <div className="mt-2 inline-block px-2 py-1 bg-[#1A7A4A]/10 text-[#1A7A4A] text-[10px] font-bold uppercase tracking-wider rounded-md border border-[#1A7A4A]/20">
                    {roleLabel}
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navLinks.map((link) => {
                    const isActive = location.pathname === link.href || location.pathname.startsWith(link.href + '/');
                    return (
                        <Link
                            key={link.name}
                            to={link.href}
                            onClick={() => setSidebarOpen(false)}
                            aria-label={link.name}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/30 ${isActive
                                ? 'bg-[#1A7A4A] text-white font-bold shadow-md shadow-[#1A7A4A]/20'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}
                        >
                            <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-white' : 'text-slate-400'}`}>{link.icon}</span>
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-[#1A7A4A] text-white flex items-center justify-center font-bold text-sm shadow-sm" aria-hidden="true">
                        {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div className="text-sm truncate">
                        <p className="font-bold text-slate-900 truncate font-['Syne',sans-serif]">
                            {isIndustry ? user?.company?.name : user?.governmentProfile?.officerName || user?.email}
                        </p>
                        <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 bg-white border border-slate-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
                    onClick={handleLogout}
                    aria-label="Logout"
                >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Logout
                </button>
            </div>
        </>
    );

    return (
        <div className="flex bg-slate-50 min-h-screen font-['DM_Sans',sans-serif]">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex sticky top-0 h-screen">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar (drawer) */}
            <aside
                className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col z-50 md:hidden transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                aria-label="Mobile navigation"
            >
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
                    {/* Hamburger for mobile */}
                    <button
                        className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/30"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open navigation menu"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>

                    {/* Mobile logo (shown only on mobile) */}
                    <Link to="/" className="flex items-center gap-2 md:hidden">
                        <span className="material-symbols-outlined text-[#1A7A4A] text-2xl">eco</span>
                        <span className="text-lg font-bold font-['Syne',sans-serif] text-slate-900">EcoChain</span>
                    </Link>

                    <div className="md:hidden w-8" /> {/* spacer */}

                    <div className="flex items-center gap-4 ml-auto">
                        <Link
                            to={isIndustry ? '/industry/notifications' : '/gov/notifications'}
                            className="p-2 relative text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/30"
                            aria-label="Notifications"
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" aria-hidden="true" />
                        </Link>
                        <ConnectButton />
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto bg-[#f3f4f6] dark:bg-slate-900 p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
