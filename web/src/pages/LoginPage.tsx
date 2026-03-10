import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, CheckCircle, Brain, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function LoginPage() {
    const navigate = useNavigate();
    const [role, setRole] = useState<'industry' | 'government' | 'auditor' | 'admin'>('industry');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading: storeLoading } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const savedRole = localStorage.getItem('gc_role') as 'industry' | 'government' | 'auditor' | 'admin';
        if (savedRole === 'industry' || savedRole === 'government' || savedRole === 'auditor' || savedRole === 'admin') {
            setRole(savedRole);
        }
    }, []);

    const handleRoleChange = (newRole: 'industry' | 'government' | 'auditor' | 'admin') => {
        setRole(newRole);
        localStorage.setItem('gc_role', newRole);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            await login({ email, password, role });
            toast.success('Login successful!');

            const currentUser = useAuthStore.getState().user;

            if (role === 'industry') {
                navigate('/industry/dashboard');
            } else if (role === 'auditor') {
                navigate('/auditor/dashboard');
            } else if (role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                if (currentUser?.governmentProfile?.status === 'approved') {
                    navigate('/gov/dashboard');
                } else {
                    toast('Your account is pending verification.', { icon: '⏳' });
                    navigate('/register/government/pending');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email to reset password.");
            return;
        }
        try {
            const response = await api.post('/auth/forgot-password', { email });
            const data = response.data;
            toast.success(data.message || "Password reset link created.");

            // In hackathon mode backend returns a resetPath we can navigate to directly
            if (data.resetPath) {
                navigate(data.resetPath);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to start password reset. Please try again.');
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-body antialiased h-screen overflow-hidden">
            <div className="flex h-full w-full flex-row">

                {/* Left Panel: Brand & Vision */}
                <div className="hidden lg:flex w-[45%] flex-col justify-between relative bg-gradient-to-br from-brand-dark to-brand-light p-12 text-white overflow-hidden">

                    {/* Animated Background Pattern */}
                    <motion.div
                        className="absolute inset-0 carbon-pattern opacity-10 pointer-events-none"
                        animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }}
                        transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                    />

                    {/* Logo Section */}
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                            <Leaf className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">EcoChain</h1>
                    </div>

                    {/* Main Content */}
                    <div className="relative z-10 my-auto">
                        <h2 className="text-4xl font-bold leading-tight mb-4">
                            Carbon Compliance.<br />
                            <span className="italic font-light text-white/90">Simplified.</span>
                        </h2>
                        <p className="text-lg text-white/80 max-w-md font-light">
                            Secure, verified, and standardized carbon tracking for the modern enterprise.
                        </p>
                    </div>

                    {/* Trust Indicators */}
                    <div className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                        <div className="flex flex-col gap-1">
                            <span className="text-2xl font-bold">500+</span>
                            <span className="text-xs font-medium uppercase tracking-wider text-white/70">Industries</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <CheckCircle className="text-white w-6 h-6" />
                            <span className="text-xs font-medium uppercase tracking-wider text-white/70">ISO 14064 Ready</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <Brain className="text-white w-6 h-6" />
                            <span className="text-xs font-medium uppercase tracking-wider text-white/70">AI-Powered</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Login Form */}
                <div className="flex w-full lg:w-[55%] flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6 overflow-y-auto">
                    <div className="w-full max-w-[400px] flex flex-col gap-8">

                        {/* Mobile Logo */}
                        <div className="lg:hidden flex items-center gap-2 mb-4 self-center text-primary">
                            <Leaf className="text-primary w-8 h-8" />
                            <span className="text-xl font-bold text-slate-900 dark:text-white">EcoChain</span>
                        </div>

                        {/* Form Header */}
                        <div className="flex flex-col gap-2 text-center">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
                            <p className="text-slate-500 dark:text-slate-400">Please enter your details to sign in.</p>
                        </div>

                        {/* Error Banner */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0, x: [-5, 5, -5, 5, 0] }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4 }}
                                    className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Login Card */}
                        <div className="flex flex-col gap-6 rounded-xl bg-white dark:bg-slate-800 p-8 shadow-sm border border-slate-200 dark:border-slate-700">

                            {/* Role Toggle — 4 tabs */}
                            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-lg gap-1">
                                {([
                                    { value: 'industry', label: 'Industry', icon: 'factory' },
                                    { value: 'government', label: 'Government', icon: 'account_balance' },
                                    { value: 'auditor', label: 'Auditor', icon: 'fact_check' },
                                    { value: 'admin', label: 'Admin', icon: 'admin_panel_settings' },
                                ] as const).map(r => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => handleRoleChange(r.value)}
                                        className={`flex-1 flex flex-col items-center justify-center py-2.5 px-1 rounded-lg text-xs font-bold transition-all gap-1 ${role === r.value
                                                ? r.value === 'admin'
                                                    ? 'bg-slate-800 text-white shadow-sm'
                                                    : 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-base leading-none">{r.icon}</span>
                                        {r.label}
                                    </button>
                                ))}
                            </div>

                            {/* Inputs */}
                            <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                                <div className="space-y-1">
                                    <label htmlFor="email" className="text-sm font-medium text-slate-900 dark:text-white">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="text-slate-400 w-5 h-5" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="name@company.com"
                                            className="block w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="password" className="text-sm font-medium text-slate-900 dark:text-white">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="text-slate-400 w-5 h-5" />
                                        </div>
                                        <input
                                            type="password"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="••••••••••"
                                            className="block w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="remember-me"
                                            name="remember-me"
                                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-400">
                                            Remember me
                                        </label>
                                    </div>
                                    <div className="text-sm">
                                        <a href="#" onClick={handleForgotPassword} className="font-medium text-primary hover:text-primary-dark hover:underline">
                                            Forgot password?
                                        </a>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="mt-2 w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : "Sign In"}
                                </button>
                            </form>
                        </div>

                        {/* Footer Link */}
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                            Don't have an account?{' '}
                            <a
                                href="/register"
                                className="font-medium text-primary hover:text-primary-dark hover:underline"
                            >
                                Create an account
                            </a>
                        </p>
                    </div>

                    <div className="mt-8 text-xs text-slate-400 dark:text-slate-600">
                        © 2024 EcoChain Compliance Systems. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
}
