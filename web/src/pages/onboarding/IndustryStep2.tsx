import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOnboardingStore } from '../../store/onboardingStore';

const step2Schema = z.object({
    fullName: z.string().min(2, 'Must be at least 2 characters').max(80, 'Must be less than 80 characters'),
    designation: z.enum(['officer', 'manager', 'director']).or(z.literal('')),
    email: z.string().email('Please enter a valid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/, 'Must include uppercase, number, and special character'),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    employeeId: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

type Step2FormValues = z.infer<typeof step2Schema>;

export default function IndustryStep2() {
    const navigate = useNavigate();
    const setStep2 = useOnboardingStore((state) => state.setStep2);
    const existingData = useOnboardingStore((state) => state.step2);

    const [emailError, setEmailError] = useState<string | null>(null);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<Step2FormValues>({
        resolver: zodResolver(step2Schema),
        defaultValues: existingData ? {
            fullName: existingData.fullName,
            designation: existingData.designation as Step2FormValues['designation'],
            email: existingData.email,
            password: existingData.password || '',
            confirmPassword: existingData.password || '',
            phone: existingData.phone || '',
            employeeId: existingData.employeeId || '',
        } : {
            fullName: '',
            designation: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            employeeId: '',
        }
    });

    const passwordVal = watch('password') || '';
    const emailVal = watch('email');

    const getPasswordStrength = (pass: string) => {
        let score = 0;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score;
    };

    const strengthScore = getPasswordStrength(passwordVal);

    const checkEmailUnique = async () => {
        if (!emailVal || errors.email) return;
        await new Promise(r => setTimeout(r, 600));
        if (emailVal.toLowerCase() === 'existing@company.com') {
            setEmailError('An account with this email already exists.');
        } else {
            setEmailError(null);
        }
    };

    const onSubmit = (data: Step2FormValues) => {
        if (emailError) return;

        setStep2({
            fullName: data.fullName,
            designation: data.designation,
            email: data.email,
            phone: data.phone,
            employeeId: data.employeeId,
            password: data.password
        });

        navigate('/register/industry/review');
    };

    return (
        <div className="bg-[#f3f4f6] dark:bg-[#1a1625] font-['DM_Sans',sans-serif] text-slate-900 dark:text-slate-100 min-h-screen py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-[#1A7A4A] rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">domain</span>
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">EcoChain</h1>
                    </div>
                </header>

                <div className="mb-12">
                    <div className="flex items-center justify-between relative">
                        <div className="flex flex-col items-center gap-2 z-10 bg-[#f3f4f6] dark:bg-[#1a1625] pr-4">
                            <div className="w-10 h-10 rounded-full bg-[#1A7A4A] flex items-center justify-center text-white ring-4 ring-[#1A7A4A]/20">
                                <span className="material-symbols-outlined text-lg">check</span>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Step 1</span>
                        </div>
                        <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 z-0">
                            <div className="h-full bg-[#1A7A4A] w-1/2"></div>
                        </div>
                        <div className="flex flex-col items-center gap-2 z-10 bg-[#f3f4f6] dark:bg-[#1a1625] px-4">
                            <div className="w-10 h-10 rounded-full bg-[#1A7A4A] flex items-center justify-center text-white ring-8 ring-[#1A7A4A]/10">
                                <span className="text-sm font-bold">2</span>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#1A7A4A] dark:text-emerald-400">Step 2</span>
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
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">Create employee account</h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                        Enter the details of the person responsible for managing this registry.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                                <input
                                    {...register('fullName')}
                                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.fullName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-[#1A7A4A] transition-all`}
                                    placeholder="e.g. Sarah Jenkins"
                                    type="text"
                                />
                            </div>
                            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Designation</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">badge</span>
                                <select
                                    {...register('designation')}
                                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.designation ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-[#1A7A4A] transition-all appearance-none`}
                                >
                                    <option value="" disabled>Select Role</option>
                                    <option value="officer">Compliance Officer</option>
                                    <option value="manager">Sustainability Manager</option>
                                    <option value="director">Director of Operations</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                            </div>
                            {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation.message}</p>}
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Work Email</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                                <input
                                    {...register('email')}
                                    onBlur={checkEmailUnique}
                                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.email || emailError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-[#1A7A4A] transition-all`}
                                    placeholder="name@company.com"
                                    type="email"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Employee ID</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">id_card</span>
                                <input
                                    {...register('employeeId')}
                                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.employeeId ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-[#1A7A4A] transition-all`}
                                    placeholder="EMP-0000"
                                    type="text"
                                />
                            </div>
                            {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId.message}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">call</span>
                                <input
                                    {...register('phone')}
                                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-[#1A7A4A] transition-all`}
                                    placeholder="+91 98765 43210"
                                    type="tel"
                                />
                            </div>
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Create Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                                <input
                                    {...register('password')}
                                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-[#1A7A4A] transition-all`}
                                    placeholder="••••••••"
                                    type="password"
                                />
                            </div>
                            <div className="flex gap-1.5 mt-1 items-center">
                                <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 1 ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 2 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 3 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 4 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock_reset</span>
                                <input
                                    {...register('confirmPassword')}
                                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-[#1A7A4A] transition-all`}
                                    placeholder="••••••••"
                                    type="password"
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    <div className="pt-6 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                        <button onClick={() => navigate('/register/industry/step1')} className="flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-400 font-bold hover:text-[#1A7A4A] transition-colors" type="button">
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back
                        </button>
                        <button className="flex items-center gap-2 px-8 py-3 bg-[#1A7A4A] text-white rounded-xl font-bold hover:bg-[#2E9E68] hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#1A7A4A]/25" type="submit">
                            Review Details
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
