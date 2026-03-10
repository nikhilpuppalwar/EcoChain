import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditorOnboardingStore } from '../../store/auditorOnboardingStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function AuditorStep3() {
    const navigate = useNavigate();
    const step1 = useAuditorOnboardingStore((state) => state.step1);
    const step2 = useAuditorOnboardingStore((state) => state.step2);
    const register = useAuthStore((state) => state.register);
    const login = useAuthStore((state) => state.login);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);

    if (!step1 || !step2) {
        navigate('/register/auditor/step1');
        return null;
    }

    const onSubmit = async () => {
        if (!termsAccepted) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();

            // Step 1 data
            formData.append('organization', step1.organization);
            formData.append('designation', step1.designation);
            formData.append('experience', step1.experience);
            formData.append('specialization', JSON.stringify(step1.specialization));

            // Step 2 data
            formData.append('fullName', step2.fullName);
            formData.append('workEmail', step2.workEmail);
            formData.append('licenseNumber', step2.licenseNumber);
            if (step2.password) formData.append('password', step2.password);

            if (step2.licenseDocument) {
                formData.append('licenseDocument', step2.licenseDocument);
            }

            await register('/auth/register/auditor', formData);
            // Hackathon UX: if backend auto-approves and we have a password, log in immediately.
            if (step2.password) {
                await login({ email: step2.workEmail, password: step2.password, role: 'auditor' });
                navigate('/auditor/dashboard');
            } else {
                navigate('/login');
            }
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            setError(err.response?.data?.message || "Registration failed. Please try again.");
            toast.error("Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#f3f4f6] dark:bg-[#1a1625] text-slate-900 dark:text-slate-100 min-h-screen font-['DM_Sans',sans-serif]">
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1625]/80 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-violet-600 dark:text-violet-400">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                            <span className="material-symbols-outlined font-bold">fact_check</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EcoChain</h2>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col items-center gap-2 group">
                            <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/20">
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                            </div>
                            <span className="text-xs font-semibold text-violet-600">Professional</span>
                        </div>
                        <div className="flex-1 h-[2px] mx-4 bg-violet-600 mb-6"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/20">
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                            </div>
                            <span className="text-xs font-semibold text-violet-600">Personal</span>
                        </div>
                        <div className="flex-1 h-[2px] mx-4 bg-slate-200 dark:bg-slate-700 mb-6"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-violet-600 text-violet-600 flex items-center justify-center ring-4 ring-violet-600/10">
                                <span className="text-sm font-bold">3</span>
                            </div>
                            <span className="text-xs font-bold text-violet-600">Review</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center bg-violet-50 dark:bg-violet-900/10 p-3 rounded-xl border border-violet-100 dark:border-violet-800/30">
                        <p className="text-violet-600 dark:text-violet-400 text-sm font-medium">Registration Progress</p>
                        <p className="text-violet-600 dark:text-violet-400 text-sm font-bold">Step 3 of 3</p>
                    </div>
                </div>

                <div className="mb-8">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-bold uppercase tracking-wider mb-4">
                        Final Review
                    </span>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Review your application</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                        Your registration will be manually verified by platform administrators within <span className="font-semibold text-slate-900 dark:text-slate-200">2 to 5 business days</span>.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-violet-50/50 dark:bg-violet-900/5 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                                <span className="material-symbols-outlined">domain</span>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Professional Information</h3>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Organization</p>
                                <p className="font-medium text-slate-800 dark:text-slate-200">{step1.organization}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Designation</p>
                                <p className="font-medium text-slate-800 dark:text-slate-200">{step1.designation}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Experience</p>
                                <p className="font-medium text-slate-800 dark:text-slate-200">{step1.experience} Years</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Specializations</p>
                                <p className="font-medium text-slate-800 dark:text-slate-200">{step1.specialization.join(', ')}</p>
                            </div>
                        </div>
                        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/30 flex justify-end">
                            <button onClick={() => navigate('/register/auditor/step1')} className="text-violet-600 dark:text-violet-400 text-sm font-bold flex items-center gap-1 hover:underline">
                                <span className="material-symbols-outlined text-sm">edit</span> Edit Details
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-violet-50/50 dark:bg-violet-900/5 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                                <span className="material-symbols-outlined">person</span>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Personal Information</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Full Name</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{step2.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Work Email</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{step2.workEmail}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">License Number</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{step2.licenseNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-violet-600 dark:text-violet-400">description</span>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{step2.licenseDocument?.name || 'Document Uploaded'}</p>
                                    <p className="text-xs text-slate-500">{step2.licenseDocument ? (step2.licenseDocument.size / 1024 / 1024).toFixed(1) : 'Unknown'} MB • Document</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-400">check_circle</span>
                            </div>
                        </div>
                        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/30 flex justify-end">
                            <button onClick={() => navigate('/register/auditor/step2')} className="text-violet-600 dark:text-violet-400 text-sm font-bold flex items-center gap-1 hover:underline">
                                <span className="material-symbols-outlined text-sm">edit</span> Edit Identity Info
                            </button>
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
                                    className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-violet-600 focus:ring-violet-600 focus:ring-offset-0 dark:bg-slate-900"
                                    required
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                />
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                I hereby certify that all information provided in this registration is true and accurate to the best of my knowledge. I acknowledge that I am a certified environmental auditor and understand that any falsification may lead to permanent suspension from the EcoChain network.
                            </span>
                        </label>
                    </div>

                    <div className="pt-4 flex flex-col items-center">
                        <button
                            onClick={onSubmit}
                            disabled={!termsAccepted || isSubmitting}
                            className={`w-full bg-gradient-to-r ${(!termsAccepted || isSubmitting) ? 'from-slate-400 to-slate-500 cursor-not-allowed opacity-70' : 'from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 active:scale-[0.98]'} text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl shadow-violet-600/20 transition-all flex items-center justify-center gap-2`}
                        >
                            {isSubmitting ? 'Submitting Application...' : 'Submit Auditor Registration'}
                            {!isSubmitting && <span className="material-symbols-outlined">send</span>}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
