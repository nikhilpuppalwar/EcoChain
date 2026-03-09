import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGovOnboardingStore } from '../../store/govOnboardingStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function GovStep3() {
    const navigate = useNavigate();
    const step1 = useGovOnboardingStore((state) => state.step1);
    const step2 = useGovOnboardingStore((state) => state.step2);
    const register = useAuthStore((state) => state.register);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);

    if (!step1 || !step2) {
        navigate('/register/government/step1');
        return null;
    }

    const onSubmit = async () => {
        if (!termsAccepted) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();

            // Step 1 data
            formData.append('ministryName', step1.ministry);
            formData.append('department', step1.department);
            formData.append('jurisdiction', step1.jurisdiction);
            formData.append('authorizationCode', step1.authorizationCode);

            // Step 2 data
            formData.append('officerName', step2.officerName);
            formData.append('designation', step2.designation);
            formData.append('officialEmail', step2.email);
            formData.append('serviceId', step2.serviceId);
            if (step2.password) formData.append('password', step2.password);

            if (step2.idDocumentFile) {
                formData.append('identityDocument', step2.idDocumentFile);
            }

            await register('/auth/register/government', formData);
            navigate('/register/government/pending');
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
            toast.error("Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display">
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-primary">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10">
                            <span className="material-symbols-outlined font-bold">eco</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EcoChain</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                        </button>
                        <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            <span className="material-symbols-outlined text-[20px]">account_circle</span>
                        </button>
                        <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCLXkhMxql-b40TIbu89MyHsmEHenpWQPsSqEaEhDkdOci26GkNtOpue9vZV5UpTEg54_Y5elBMXpjZDGyPbL4FArq_ZHLYBV1HbZkolNEBcDoDEPsPklaxICeb6eDDoMZkccz6F20UGsU23KTrI3VwnGquXCZvPmAdisi6dRAM_iHRIn92EKRpUfuGgq8gps39B568bn567u6nHHgmFxtBqS47LLhFf-TsOhKrLWhhl32sVe75IplcDOk9kGsp--VWfjw62zZJkYM')" }}>
                        </div>
                    </div>
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col items-center gap-2 group">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                            </div>
                            <span className="text-xs font-semibold text-primary">Identity</span>
                        </div>
                        <div className="flex-1 h-[2px] mx-4 bg-primary mb-6"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                            </div>
                            <span className="text-xs font-semibold text-primary">Documents</span>
                        </div>
                        <div className="flex-1 h-[2px] mx-4 bg-slate-200 dark:bg-slate-700 mb-6"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-primary text-primary flex items-center justify-center ring-4 ring-primary/10">
                                <span className="text-sm font-bold">3</span>
                            </div>
                            <span className="text-xs font-bold text-primary">Review</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center bg-primary/5 dark:bg-primary/10 p-3 rounded-xl border border-primary/10">
                        <p className="text-primary text-sm font-medium">Registration Progress</p>
                        <p className="text-primary text-sm font-bold">Step 3 of 3</p>
                    </div>
                </div>
                <div className="mb-8">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                        Final Review
                    </span>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Review your application</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                        Your registration will be manually verified by the EcoChain team within <span className="font-semibold text-slate-900 dark:text-slate-200">2 business days</span>.
                    </p>
                </div>
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-primary/5 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-primary">
                                <span className="material-symbols-outlined">account_balance</span>
                                <h3 className="font-bold text-lg">Ministry & Department</h3>
                            </div>
                            <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-sm">
                                Pending Verification
                            </span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Ministry</p>
                                <p className="font-medium text-slate-800 dark:text-slate-200">{step1.ministry}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Department</p>
                                <p className="font-medium text-slate-800 dark:text-slate-200">{step1.department}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Jurisdiction</p>
                                <p className="font-medium text-slate-800 dark:text-slate-200">{step1.jurisdiction}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Authorization Code</p>
                                <p className="font-mono text-primary font-bold">****-{step1.authorizationCode ? step1.authorizationCode.slice(-4) : '****'}</p>
                            </div>
                        </div>
                        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/30 flex justify-end">
                            <button onClick={() => navigate('/register/government/step1')} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                                <span className="material-symbols-outlined text-sm">edit</span> Edit Details
                            </button>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-primary/5 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-primary">
                                <span className="material-symbols-outlined">badge</span>
                                <h3 className="font-bold text-lg">Regulatory Officer</h3>
                            </div>
                            <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded-full uppercase tracking-tighter">
                                IAS Officer
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Officer Name</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{step2.officerName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Designation</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{step2.designation}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Work Email</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{step2.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Service ID</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{step2.serviceId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-primary">description</span>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{step2.idDocumentFile?.name || 'Document Uploaded'}</p>
                                    <p className="text-xs text-slate-500">{step2.idDocumentFile ? (step2.idDocumentFile.size / 1024 / 1024).toFixed(1) : 'Unknown'} MB • Document</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-400">check_circle</span>
                            </div>
                        </div>
                        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/30 flex justify-end">
                            <button onClick={() => navigate('/register/government/step2')} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                                <span className="material-symbols-outlined text-sm">edit</span> Edit Officer Info
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
                                    className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary focus:ring-offset-0 dark:bg-slate-900"
                                    required
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                />
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                I hereby certify that all information provided in this registration is true and accurate to the best of my knowledge. I acknowledge that I am an <span className="font-bold text-slate-900 dark:text-slate-100">authorized representative</span> under MoEFCC guidelines and understand that any falsification may lead to legal action or immediate suspension of EcoChain access.
                            </span>
                        </label>
                    </div>
                    <div className="pt-4 flex flex-col items-center">
                        <button
                            onClick={onSubmit}
                            disabled={!termsAccepted || isSubmitting}
                            className={`w-full bg-gradient-to-r ${(!termsAccepted || isSubmitting) ? 'from-slate-400 to-slate-500 cursor-not-allowed opacity-70' : 'from-primary to-[#2a9c63] hover:from-[#13613a] hover:to-[#1a7a4a] active:scale-[0.98]'} text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Government Registration'}
                            {!isSubmitting && <span className="material-symbols-outlined">send</span>}
                        </button>
                        <p className="text-center mt-4 text-xs text-slate-500 uppercase tracking-widest font-medium">
                            Secured by MoEFCC Blockchain Infrastructure
                        </p>
                    </div>
                </div>
            </main>
            <footer className="mt-12 py-8 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 dark:text-slate-500 text-sm">
                    <p>© 2024 EcoChain Government Portal. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a className="hover:text-primary" href="#">Privacy Policy</a>
                        <a className="hover:text-primary" href="#">Compliance Standards</a>
                        <a className="hover:text-primary" href="#">Help Center</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
