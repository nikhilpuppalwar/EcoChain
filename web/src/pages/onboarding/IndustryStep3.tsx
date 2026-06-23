import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useAuthStore } from '../../store/authStore';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

export default function IndustryStep3() {
    const navigate = useNavigate();
    const step1 = useOnboardingStore((state) => state.step1);
    const step2 = useOnboardingStore((state) => state.step2);
    const register = useAuthStore((state) => state.register);

    const { address, isConnected } = useAccount();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);

    if (!step1 || !step2) {
        navigate('/register/industry/step1');
        return null;
    }

    const onSubmit = async () => {
        if (!termsAccepted) {
            setError("Please accept the certification.");
            return;
        }

        if (!isConnected || !address) {
            setError("Please connect your MetaMask wallet first. This is required to receive your free 5,000 CCR carbon credits.");
            toast.error("MetaMask connection required");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                ...step1,
                ...step2,
                taxId: step1.panId,
                annualCarbonBudget: step1.carbonBudget,
                workEmail: step2.email,
                phoneNumber: step2.phone,
                walletAddress: address
            };

            await register('/auth/register/industry', payload);

            setSubmitSuccess(true);
            confetti({ particleCount: 120, spread: 80, colors: ['#1A7A4A', '#10B981', '#34D399'] });

        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            setError(err.response?.data?.message || "Registration failed. Please try again.");
            toast.error("Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackToLogin = () => {
        useOnboardingStore.getState().reset();
        navigate('/login');
    };

    return (
        <div className="bg-[#f3f4f6] dark:bg-[#1a1625] text-slate-900 dark:text-slate-100 min-h-screen font-['DM_Sans',sans-serif]">
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1625]/80 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[#1A7A4A] dark:text-emerald-400">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1A7A4A]/10 dark:bg-[#1A7A4A]/20">
                            <span className="material-symbols-outlined font-bold">domain</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EcoChain</h2>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col items-center gap-2 group">
                            <div className="w-10 h-10 rounded-full bg-[#1A7A4A] text-white flex items-center justify-center shadow-lg shadow-[#1A7A4A]/20">
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                            </div>
                            <span className="text-xs font-semibold text-[#1A7A4A] dark:text-emerald-400">Company</span>
                        </div>
                        <div className="flex-1 h-[2px] mx-4 bg-[#1A7A4A] mb-6"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-[#1A7A4A] text-white flex items-center justify-center shadow-lg shadow-[#1A7A4A]/20">
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                            </div>
                            <span className="text-xs font-semibold text-[#1A7A4A] dark:text-emerald-400">Employee</span>
                        </div>
                        <div className="flex-1 h-[2px] mx-4 bg-[#1A7A4A] mb-6"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-[#1A7A4A] text-[#1A7A4A] flex items-center justify-center ring-4 ring-[#1A7A4A]/10">
                                <span className="text-sm font-bold">3</span>
                            </div>
                            <span className="text-xs font-bold text-[#1A7A4A] dark:text-emerald-400">Review</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center bg-[#1A7A4A]/5 dark:bg-[#1A7A4A]/10 p-3 rounded-xl border border-[#1A7A4A]/10 dark:border-emerald-800/30">
                        <p className="text-[#1A7A4A] dark:text-emerald-400 text-sm font-medium">Registration Progress</p>
                        <p className="text-[#1A7A4A] dark:text-emerald-400 text-sm font-bold">Step 3 of 3</p>
                    </div>
                </div>

                <div className="mb-8">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#1A7A4A]/10 dark:bg-[#1A7A4A]/20 text-[#1A7A4A] dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
                        Final Review
                    </span>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Review your application</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                        Your registration will be manually verified by platform administrators before activation.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-[#1A7A4A]/5 dark:bg-[#1A7A4A]/5 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-[#1A7A4A] dark:text-emerald-400">
                                <span className="material-symbols-outlined">domain</span>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Company Information</h3>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Company Name</p>
                                <p className="font-medium text-slate-800 dark:text-slate-200">{step1.companyName}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Tax ID / PAN</p>
                                <p className="font-medium text-slate-800 dark:text-slate-200 uppercase">{step1.panId}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Sector</p>
                                <p className="font-medium text-slate-800 dark:text-slate-200">{step1.sector}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Location</p>
                                <p className="font-medium text-slate-800 dark:text-slate-200">{step1.state}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Annual Carbon Budget</p>
                                <p className="font-medium text-slate-800 dark:text-slate-200">{step1.carbonBudget?.toLocaleString()} tonnes CO₂e/yr</p>
                            </div>
                        </div>
                        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/30 flex justify-end">
                            <button onClick={() => navigate('/register/industry/step1')} className="text-[#1A7A4A] dark:text-emerald-400 text-sm font-bold flex items-center gap-1 hover:underline">
                                <span className="material-symbols-outlined text-sm">edit</span> Edit Details
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-[#1A7A4A]/5 dark:bg-[#1A7A4A]/5 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-[#1A7A4A] dark:text-emerald-400">
                                <span className="material-symbols-outlined">person</span>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Admin / Employee Information</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Full Name</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{step2.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Designation</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200 capitalize">{step2.designation}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Work Email</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{step2.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Phone Number</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{step2.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Employee ID</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{step2.employeeId || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/30 flex justify-end">
                            <button onClick={() => navigate('/register/industry/step2')} className="text-[#1A7A4A] dark:text-emerald-400 text-sm font-bold flex items-center gap-1 hover:underline">
                                <span className="material-symbols-outlined text-sm">edit</span> Edit Employee Info
                            </button>
                        </div>
                    </div>

                    {/* Web3 MetaMask Integration Card */}
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-[#1A7A4A]/5 dark:bg-[#1A7A4A]/5 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-[#1A7A4A] dark:text-emerald-400">
                                <span className="material-symbols-outlined">account_balance_wallet</span>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Web3 MetaMask Integration</h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                Connect your MetaMask wallet. This address will be dynamically retrieved and registered to your industry profile, automatically awarding you <strong>5,000 CCR</strong> on the Ethereum Sepolia testnet upon registration.
                            </p>
                            
                            {isConnected && address ? (
                                <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl px-4 py-3">
                                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">verified</span>
                                    <div>
                                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                                            {address}
                                        </p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Connected via MetaMask</p>
                                    </div>
                                    <span className="ml-auto text-xs px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded-full font-bold uppercase tracking-wider">
                                        Linked
                                    </span>
                                </div>
                            ) : (
                                <div className="bg-amber-50 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-900/30 rounded-xl px-4 py-3 text-sm text-amber-855 dark:text-amber-300 flex items-center gap-3 font-medium">
                                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">warning</span>
                                    Please connect your MetaMask wallet using the button below.
                                </div>
                            )}

                            <div className="flex justify-start">
                                <ConnectButton label="Connect MetaMask Wallet" />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg font-medium">
                            {error}
                        </div>
                    )}

                    <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                        <label className="flex items-start gap-4 cursor-pointer">
                            <div className="mt-1">
                                <input
                                    className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-[#1A7A4A] focus:ring-[#1A7A4A] focus:ring-offset-0 dark:bg-slate-900"
                                    required
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                />
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                I hereby certify that all information provided in this registration is true and accurate to the best of my knowledge. By creating an account, you certify that you are an authorized representative of the entity listed above.
                            </span>
                        </label>
                    </div>

                    <div className="pt-4 flex flex-col items-center">
                        <button
                            onClick={onSubmit}
                            disabled={!termsAccepted || isSubmitting}
                            className={`w-full bg-gradient-to-r ${(!termsAccepted || isSubmitting) ? 'from-slate-400 to-slate-500 cursor-not-allowed opacity-70' : 'from-[#1A7A4A] to-[#2E9E68] hover:from-[#2E9E68] hover:to-[#1A7A4A] active:scale-[0.98]'} text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl shadow-[#1A7A4A]/20 transition-all flex items-center justify-center gap-2`}
                        >
                            {isSubmitting ? 'Submitting Application...' : 'Submit Registration'}
                            {!isSubmitting && <span className="material-symbols-outlined">send</span>}
                        </button>
                    </div>
                </div>

                {submitSuccess && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1A7A4A] to-[#2E9E68]"></div>
                            <div className="mx-auto w-24 h-24 bg-[#1A7A4A]/10 dark:bg-[#1A7A4A]/20 rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-5xl text-[#1A7A4A] dark:text-emerald-400 animate-pulse">schedule</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Registration Submitted!</h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg leading-relaxed">
                                Your organization <span className="font-bold text-slate-900 dark:text-white">{step1.companyName}</span>'s registration has been submitted and is currently <span className="font-bold text-[#1A7A4A] dark:text-emerald-400">waiting for approval</span>. We will notify you once verified.
                            </p>
                            <button onClick={handleBackToLogin} className="w-full h-14 bg-slate-900 hover:bg-slate-800 dark:bg-[#1A7A4A] dark:hover:bg-[#2E9E68] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 outline-none">
                                <span>Back to Login</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
