import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useAuthStore } from '../../store/authStore';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

export default function IndustryStep3() {
    const navigate = useNavigate();
    const step1 = useOnboardingStore((state) => state.step1);
    const step2 = useOnboardingStore((state) => state.step2);
    const register = useAuthStore((state) => state.register);
    const login = useAuthStore((state) => state.login);

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
            setError("Please accept the Terms of Service and Privacy Policy.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                ...step1,
                ...step2,
                // Map frontend state to expected backend fields if they differ slightly
                annualCarbonBudget: step1.carbonBudget,
                workEmail: step2.email,
                phoneNumber: step2.phone
            };

            await register('/auth/register/industry', payload);

            // Auto-login after successful registration
            await login({
                email: step2.email,
                password: step2.password,
                role: 'industry'
            });

            setSubmitSuccess(true);
            confetti({ particleCount: 120, spread: 80, colors: ['#1A7A4A', '#2ECC71', '#E8F5E9'] });

        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
            toast.error("Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDashboard = () => {
        useOnboardingStore.getState().reset();
        navigate('/industry/dashboard');
    };

    return (
        <div className="bg-[#f6f8f7] dark:bg-[#122019] font-['Public_Sans',sans-serif] text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-10 py-3 sticky top-0 z-40">
                <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                    <div className="size-8 text-[#1a7a4a]">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_6_319)">
                                <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor"></path>
                            </g>
                            <defs>
                                <clipPath id="clip0_6_319"><rect fill="white" height="48" width="48"></rect></clipPath>
                            </defs>
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">EcoChain</h2>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center justify-center rounded-xl size-10 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors">
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                    </button>
                    <button className="flex items-center justify-center rounded-xl size-10 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors">
                        <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                    </button>
                    <div className="ml-2 flex items-center gap-2">
                        <div className="size-8 rounded-full bg-slate-200 bg-cover bg-center border border-slate-300 dark:border-slate-600" style={{ backgroundImage: "url('https://eu.ui-avatars.com/api/?name=User&size=250')" }}></div>
                    </div>
                </div>
            </header>
            <main className="flex-1 flex justify-center py-10 px-4 sm:px-6 lg:px-8 relative">
                <div className="w-full max-w-5xl flex flex-col gap-8">
                    <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
                        <div className="w-full max-w-md pb-6">
                            <div className="flex items-center w-full">
                                <div className="flex flex-col items-center relative">
                                    <div className="size-8 rounded-full bg-[#1a7a4a] flex items-center justify-center text-white z-10 ring-4 ring-[#f6f8f7] dark:ring-[#122019]">
                                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                                    </div>
                                    <span className="absolute top-10 text-xs font-bold text-[#1a7a4a] whitespace-nowrap">Entity Details</span>
                                </div>
                                <div className="flex-auto border-t-2 border-[#1a7a4a] mx-2"></div>
                                <div className="flex flex-col items-center relative">
                                    <div className="size-8 rounded-full bg-[#1a7a4a] flex items-center justify-center text-white z-10 ring-4 ring-[#f6f8f7] dark:ring-[#122019]">
                                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                                    </div>
                                    <span className="absolute top-10 text-xs font-bold text-[#1a7a4a] whitespace-nowrap">Administrator</span>
                                </div>
                                <div className="flex-auto border-t-2 border-[#1a7a4a] mx-2"></div>
                                <div className="flex flex-col items-center relative">
                                    <div className="size-8 rounded-full bg-[#1a7a4a] flex items-center justify-center text-white z-10 ring-4 ring-[#f6f8f7] dark:ring-[#122019]">
                                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                                    </div>
                                    <span className="absolute top-10 text-xs font-bold text-[#1a7a4a] whitespace-nowrap">Review</span>
                                </div>
                            </div>
                        </div>
                        <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Review & Submit Registration</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-normal">Please verify your information below before creating your account.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-4">
                        {/* Company Info Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-full">
                            <div className="bg-[#1a7a4a]/10 dark:bg-[#1a7a4a]/20 px-6 py-4 flex items-center justify-between border-b border-[#1a7a4a]/10 dark:border-[#1a7a4a]/20">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[#1a7a4a] dark:text-emerald-400 font-bold text-lg">Company Info</h3>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                                        <span className="material-symbols-outlined text-[14px]">verified</span>
                                        Verified
                                    </span>
                                </div>
                                <button onClick={() => navigate('/register/industry/step1')} className="text-slate-400 hover:text-[#1a7a4a] transition-colors outline-none">
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                            </div>
                            <div className="p-6 flex flex-col gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Legal Company Name</label>
                                    <div className="text-[15px] font-semibold text-slate-900 dark:text-white">{step1.companyName}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Tax ID / PAN</label>
                                        <div className="text-[15px] font-semibold text-slate-900 dark:text-white uppercase">{step1.panId}</div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Industry Sector</label>
                                        <div className="text-[15px] font-semibold text-slate-900 dark:text-white">{step1.sector}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Registration No / State</label>
                                    <div className="text-[15px] font-semibold text-slate-900 dark:text-white leading-relaxed">
                                        {step1.registrationNo}<br />
                                        {step1.state}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Est. Annual Carbon Budget</label>
                                    <div className="flex items-center gap-2 text-[15px] font-semibold text-[#1a7a4a]">
                                        {step1.carbonBudget?.toLocaleString()} tonnes CO₂e/yr
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Account Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-full">
                            <div className="bg-[#1a7a4a]/10 dark:bg-[#1a7a4a]/20 px-6 py-4 flex items-center justify-between border-b border-[#1a7a4a]/10 dark:border-[#1a7a4a]/20">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[#1a7a4a] dark:text-emerald-400 font-bold text-lg">Admin Account</h3>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                                        <span className="material-symbols-outlined text-[14px]">shield_person</span>
                                        Authorized
                                    </span>
                                </div>
                                <button onClick={() => navigate('/register/industry/step2')} className="text-slate-400 hover:text-[#1a7a4a] transition-colors outline-none">
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                            </div>
                            <div className="p-6 flex flex-col gap-6">
                                <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="size-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 ring-4 ring-white dark:ring-slate-800 shadow-sm border border-slate-300 dark:border-slate-600 bg-cover bg-center" style={{ backgroundImage: `url('https://eu.ui-avatars.com/api/?name=${step2.fullName}&size=250')` }}>
                                    </div>
                                    <div>
                                        <div className="text-base font-bold text-slate-900 dark:text-white capitalize">{step2.fullName}</div>
                                        <div className="text-sm text-slate-500 capitalize">{step2.designation}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Work Email</label>
                                    <div className="text-[15px] font-semibold text-slate-900 dark:text-white">{step2.email}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Phone Number</label>
                                        <div className="text-[15px] font-semibold text-slate-900 dark:text-white">{step2.phone || 'N/A'}</div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Employee ID</label>
                                        <div className="text-[15px] font-semibold text-slate-900 dark:text-white">{step2.employeeId || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">2FA Method</label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700 w-fit">
                                        <span className="material-symbols-outlined text-[18px] text-[#1a7a4a]">smartphone</span>
                                        <span className="text-[14px] font-semibold text-slate-900 dark:text-white">Email & SMS Verification</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col items-center gap-8 max-w-2xl mx-auto w-full">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-full">
                            <div className="flex items-start gap-3">
                                <div className="flex h-6 items-center">
                                    <input
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                        className="h-5 w-5 rounded border-slate-300 text-[#1a7a4a] focus:ring-[#1a7a4a] outline-none dark:border-slate-600 dark:bg-slate-800 cursor-pointer"
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                    />
                                </div>
                                <div className="text-sm leading-6">
                                    <label className="font-medium text-slate-900 dark:text-white cursor-pointer" htmlFor="terms">I agree to the <Link className="text-[#1a7a4a] hover:underline font-semibold" to="#">Terms of Service</Link> and <Link className="text-[#1a7a4a] hover:underline font-semibold" to="#">Privacy Policy</Link>.</label>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">By creating an account, you certify that you are an authorized representative of the entity listed above.</p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="w-full text-center text-red-500 text-sm font-semibold">{error}</div>
                        )}

                        <div className="flex flex-col w-full gap-4">
                            <button
                                onClick={onSubmit}
                                disabled={isSubmitting}
                                className={`group relative flex items-center justify-center gap-3 w-full h-[56px] rounded-xl text-white font-bold text-lg shadow-xl shadow-[#1a7a4a]/20 hover:shadow-[#1a7a4a]/40 transition-all transform active:scale-[0.99] overflow-hidden outline-none ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#1a7a4a] to-[#0D5C34]"></div>
                                {!isSubmitting && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
                                {isSubmitting ? (
                                    <>
                                        <span className="relative z-10 material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                                        <span className="relative z-10">Creating your account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="relative z-10 material-symbols-outlined text-[24px]">eco</span>
                                        <span className="relative z-10">Create My EcoChain Account</span>
                                    </>
                                )}
                            </button>
                            <button
                                disabled={isSubmitting}
                                onClick={() => navigate('/register/industry/step2')}
                                className="flex items-center justify-center gap-2 w-full h-[48px] rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold transition-colors outline-none"
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Edit Details
                            </button>
                        </div>
                    </div>
                </div>

                {submitSuccess && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D5C34]/95 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1a7a4a] to-emerald-400"></div>
                            <div className="mx-auto size-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-6xl text-[#1a7a4a] animate-bounce">check_circle</span>
                            </div>
                            <h2 className="text-3xl font-black font-['Syne',sans-serif] text-slate-900 dark:text-white mb-2">Registration Successful!</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">Your organization <span className="font-bold text-slate-900 dark:text-white">{step1.companyName}</span> has been successfully registered. You can now access your dashboard.</p>
                            <button onClick={handleDashboard} className="w-full h-12 bg-[#1a7a4a] hover:bg-[#0D5C34] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 outline-none">
                                <span>Go to Dashboard</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
