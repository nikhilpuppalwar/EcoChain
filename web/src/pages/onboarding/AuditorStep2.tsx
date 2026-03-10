import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuditorOnboardingStore } from '../../store/auditorOnboardingStore';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

const auditorStep2Schema = z.object({
    fullName: z.string().min(2, 'Must be at least 2 characters').max(100),
    workEmail: z.string().email('Please enter a valid email address'),
    licenseNumber: z.string().min(5, 'Enter valid license number'),
    password: z.string()
        .min(8, 'Minimum 8 characters')
        .regex(/^(?=.*[A-Z])(?=.*[0-9])/, 'Must include uppercase and number'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

type AuditorStep2FormValues = z.infer<typeof auditorStep2Schema>;

export default function AuditorStep2() {
    const navigate = useNavigate();
    const setStep2 = useAuditorOnboardingStore((state) => state.setStep2);
    const existingData = useAuditorOnboardingStore((state) => state.step2);

    const [licenseFile, setLicenseFile] = useState<File | null>(existingData?.licenseDocument || null);
    const [fileError, setFileError] = useState<string | null>(null);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<AuditorStep2FormValues>({
        resolver: zodResolver(auditorStep2Schema),
        defaultValues: existingData ? {
            fullName: existingData.fullName,
            workEmail: existingData.workEmail,
            licenseNumber: existingData.licenseNumber,
            password: '',
            confirmPassword: ''
        } : {
            fullName: '',
            workEmail: '',
            licenseNumber: '',
            password: '',
            confirmPassword: '',
        }
    });

    const passwordVal = watch('password') || '';

    const getPasswordStrength = (pass: string) => {
        let score = 0;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score;
    };

    const strengthScore = getPasswordStrength(passwordVal);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileError(null);
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                setFileError("File must be smaller than 5MB");
                setLicenseFile(null);
                return;
            }
            if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
                setFileError("Only PDF, JPG, or PNG allowed");
                setLicenseFile(null);
                return;
            }
            setLicenseFile(file);
        }
    };

    const onSubmit = (data: AuditorStep2FormValues) => {
        if (!licenseFile) {
            setFileError('Auditor license document is required');
            return;
        }

        setStep2({
            fullName: data.fullName,
            workEmail: data.workEmail,
            password: data.password,
            licenseNumber: data.licenseNumber,
            licenseDocument: licenseFile
        });

        navigate('/register/auditor/review');
    };

    return (
        <div className="bg-[#f3f4f6] dark:bg-[#1a1625] font-['DM_Sans',sans-serif] text-slate-900 dark:text-slate-100 min-h-screen py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">fact_check</span>
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">EcoChain</h1>
                    </div>
                </header>

                <div className="mb-12">
                    <div className="flex items-center justify-between relative">
                        <div className="flex flex-col items-center gap-2 z-10 bg-[#f3f4f6] dark:bg-[#1a1625] pr-4">
                            <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white ring-4 ring-violet-500/20">
                                <span className="material-symbols-outlined text-lg">check</span>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Step 1</span>
                        </div>
                        <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 z-0">
                            <div className="h-full bg-violet-600 w-1/2"></div>
                        </div>
                        <div className="flex flex-col items-center gap-2 z-10 bg-[#f3f4f6] dark:bg-[#1a1625] px-4">
                            <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white ring-8 ring-violet-500/10">
                                <span className="text-sm font-bold">2</span>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-violet-600">Step 2</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 z-10 bg-[#f3f4f6] dark:bg-[#1a1625] pl-4">
                            <div className="w-10 h-10 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                                <span className="text-sm font-bold">3</span>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Step 3</span>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">Create personal auditor account</h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                        This account is personally tied to your professional auditor license. You will use it to approve or reject emission reports.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Legal Name</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                                <input
                                    {...register('fullName')}
                                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.fullName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-violet-500 transition-all`}
                                    placeholder="Your Full Name"
                                    type="text"
                                />
                            </div>
                            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Professional/Work Email</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                                <input
                                    {...register('workEmail')}
                                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.workEmail ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-violet-500 transition-all`}
                                    placeholder="email@firm.com"
                                    type="email"
                                />
                            </div>
                            {errors.workEmail && <p className="text-red-500 text-xs mt-1">{errors.workEmail.message}</p>}
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Professional License Number / ID</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">badge</span>
                                <input
                                    {...register('licenseNumber')}
                                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.licenseNumber ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-violet-500 transition-all`}
                                    placeholder="e.g. AUD-90210"
                                    type="text"
                                />
                            </div>
                            {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber.message}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Create Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                                <input
                                    {...register('password')}
                                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-violet-500 transition-all`}
                                    placeholder="••••••••"
                                    type="password"
                                />
                            </div>
                            <div className="flex gap-1.5 mt-1 items-center">
                                <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 1 ? 'bg-violet-400' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 2 ? 'bg-violet-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 3 ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 4 ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock_reset</span>
                                <input
                                    {...register('confirmPassword')}
                                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-violet-500 transition-all`}
                                    placeholder="••••••••"
                                    type="password"
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-2 mt-4">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Auditor License / Certificate Document</label>

                            <input
                                type="file"
                                id="idUpload"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="idUpload" className={`relative border-2 border-dashed ${fileError ? 'border-red-500 bg-red-50' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'} rounded-xl p-8 hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:border-violet-500 transition-all cursor-pointer flex flex-col items-center justify-center text-center group`}>
                                {licenseFile ? (
                                    <>
                                        <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 mb-4 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-3xl">check_circle</span>
                                        </div>
                                        <h4 className="text-base font-bold text-violet-600">{licenseFile.name}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">{(licenseFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <div className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:shadow-md transition-shadow">
                                            Change File
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center text-violet-600 mb-4 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                                        </div>
                                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Upload Auditor Certificate</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Supported formats: PDF, JPG, PNG (Max 5MB)</p>
                                        <div className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:shadow-md transition-shadow">
                                            Browse Files
                                        </div>
                                    </>
                                )}
                            </label>
                            {fileError && <p className="text-red-500 text-xs mt-1">{fileError}</p>}
                        </div>
                    </div>

                    <div className="pt-6 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                        <button onClick={() => navigate('/register/auditor/step1')} className="flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-400 font-bold hover:text-violet-600 transition-colors" type="button">
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back
                        </button>
                        <button className="flex items-center gap-2 px-8 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-violet-600/25" type="submit">
                            Review Details
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
