import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOnboardingStore } from '../../store/onboardingStore';

const step2Schema = z.object({
    fullName: z.string().min(2, 'Must be at least 2 characters').max(80, 'Must be less than 80 characters'),
    designation: z.enum([
        'officer',
        'manager',
        'director'
    ], { errorMap: () => ({ message: 'Please select a designation' }) }).or(z.literal('')),
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

    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<Step2FormValues>({
        resolver: zodResolver(step2Schema),
        defaultValues: (existingData as any) || {
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

    // Password Strength Logic
    const getPasswordStrength = (pass: string) => {
        let score = 0;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score;
    };

    const strengthScore = getPasswordStrength(passwordVal);

    const getStrengthDisplay = () => {
        if (strengthScore === 0 && passwordVal.length === 0) return { label: '', color: 'bg-slate-200 dark:bg-slate-700', bars: 0, textColor: 'text-slate-500' };
        if (strengthScore < 2) return { label: 'Weak password', color: 'bg-red-400', bars: 1, textColor: 'text-red-500' };
        if (strengthScore < 4) return { label: 'Fair strength', color: 'bg-yellow-600 dark:bg-yellow-500', bars: Math.max(2, strengthScore), textColor: 'text-yellow-600 dark:text-yellow-500' };
        return { label: 'Strong password', color: 'bg-[#1a7a4a]', bars: 4, textColor: 'text-[#1a7a4a]' };
    };

    const strengthInfo = getStrengthDisplay();

    // Mock Email Check
    const checkEmailUnique = async () => {
        if (!emailVal || errors.email) return;

        // Simulate API delay
        await new Promise(r => setTimeout(r, 600));

        if (emailVal.toLowerCase() === 'existing@company.com') {
            setEmailError('An account with this email already exists.');
        } else {
            setEmailError(null);
        }
    };

    const onSubmit = (data: Step2FormValues) => {
        if (emailError) return;

        // Store data
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
        <div className="bg-[#f6f8f7] dark:bg-[#122019] min-h-screen text-slate-900 dark:text-slate-100 flex flex-col antialiased font-['DM_Sans',sans-serif]">
            <nav className="w-full h-16 bg-[#ffffff] dark:bg-[#1a2c24] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0">
                <div className="flex items-center gap-2 text-[#1a7a4a]">
                    <div className="w-8 h-8 bg-[#1a7a4a]/10 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#1a7a4a] text-xl">eco</span>
                    </div>
                    <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight font-['Syne',sans-serif]">CarbonReg</h2>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                    <span className="hidden sm:inline">Already have an account?</span>
                    <Link className="text-[#1a7a4a] hover:text-[#145e39] transition-colors" to="/login">Log in</Link>
                </div>
            </nav>
            <main className="flex-1 w-full flex justify-center py-10 px-4 sm:px-6">
                <div className="w-full max-w-4xl flex flex-col">
                    <div className="w-full max-w-3xl mx-auto mb-12">
                        <nav aria-label="Progress">
                            <ol className="flex items-center" role="list">
                                <li className="relative pr-8 sm:pr-20">
                                    <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                        <div className="h-0.5 w-full bg-[#1a7a4a]"></div>
                                    </div>
                                    <Link className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#1a7a4a] hover:bg-[#145e39] transition-colors" to="/register/industry/step1">
                                        <span className="material-symbols-outlined text-white text-sm">check</span>
                                        <span className="absolute -bottom-8 w-32 text-center text-xs font-semibold text-[#1a7a4a]">Company Details</span>
                                    </Link>
                                </li>
                                <li className="relative pr-8 sm:pr-20">
                                    <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                        <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-700"></div>
                                    </div>
                                    <div aria-current="step" className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#1a7a4a] bg-white dark:bg-[#1a2c24]">
                                        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#1a7a4a]"></span>
                                        <span className="absolute -bottom-8 w-32 text-center text-xs font-bold text-slate-900 dark:text-white">Admin Setup</span>
                                    </div>
                                </li>
                                <li className="relative">
                                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1a2c24] hover:border-slate-400">
                                        <span aria-hidden="true" className="text-slate-500 text-xs font-bold">3</span>
                                        <span className="absolute -bottom-8 w-32 text-center text-xs font-medium text-slate-500">Review</span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>
                    <div className="bg-white dark:bg-[#1a2c24] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 lg:p-12">
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-bold font-['Syne',sans-serif] text-slate-900 dark:text-white tracking-tight mb-3">Create your admin account</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-lg">Enter the details of the person responsible for managing this registry.</p>
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="fullname">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1a7a4a] transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">person</span>
                                            </div>
                                            <input {...register('fullName')} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a7a4a]/20 focus:border-[#1a7a4a] transition-all shadow-sm outline-none" id="fullname" placeholder="e.g. Sarah Jenkins" type="text" />
                                        </div>
                                        {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="designation">Designation</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1a7a4a] transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">badge</span>
                                            </div>
                                            <select {...register('designation')} className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a7a4a]/20 focus:border-[#1a7a4a] transition-all shadow-sm appearance-none outline-none" id="designation">
                                                <option disabled value="">Select Role</option>
                                                <option value="officer">Compliance Officer</option>
                                                <option value="manager">Sustainability Manager</option>
                                                <option value="director">Director of Operations</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                                <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                            </div>
                                        </div>
                                        {errors.designation && <p className="text-red-500 text-xs">{errors.designation.message}</p>}
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">Work Email</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1a7a4a] transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">mail</span>
                                            </div>
                                            <input {...register('email')} onBlur={checkEmailUnique} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a7a4a]/20 focus:border-[#1a7a4a] transition-all shadow-sm outline-none" id="email" placeholder="name@company.com" type="email" />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                                        {emailError && <p className="text-red-500 text-xs">{emailError}</p>}
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="empid">Employee ID</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1a7a4a] transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">id_card</span>
                                            </div>
                                            <input {...register('employeeId')} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a7a4a]/20 focus:border-[#1a7a4a] transition-all shadow-sm outline-none" id="empid" placeholder="EMP-0000" type="text" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="phone">Phone Number</label>
                                        <div className="relative group flex">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1a7a4a] transition-colors z-10">
                                                <span className="material-symbols-outlined text-[20px]">call</span>
                                            </div>
                                            <div className="flex w-full">
                                                <span className="inline-flex items-center px-3 py-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-black/30 text-slate-500 dark:text-slate-400 text-sm pl-10">
                                                    +91
                                                </span>
                                                <input {...register('phone')} className="block w-full min-w-0 flex-1 rounded-none rounded-r-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-black/20 py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a7a4a]/20 focus:border-[#1a7a4a] transition-all shadow-sm focus:z-10 outline-none" id="phone" placeholder="98765 43210" type="tel" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1a7a4a] transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">lock</span>
                                            </div>
                                            <input {...register('password')} className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a7a4a]/20 focus:border-[#1a7a4a] transition-all shadow-sm outline-none" id="password" placeholder="Create password" type={showPassword ? "text" : "password"} />
                                            <button onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer outline-none" type="button">
                                                <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                        </div>
                                        <div className="flex gap-1.5 mt-2">
                                            {[1, 2, 3, 4].map(barIndex => (
                                                <div
                                                    key={barIndex}
                                                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${barIndex <= strengthInfo.bars ? strengthInfo.color : 'bg-slate-200 dark:bg-slate-700'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        {passwordVal.length > 0 && <p className={`text-xs font-medium mt-1 ${strengthInfo.textColor}`}>{strengthInfo.label}</p>}
                                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="confirm-password">Confirm Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1a7a4a] transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">lock</span>
                                            </div>
                                            <input {...register('confirmPassword')} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a7a4a]/20 focus:border-[#1a7a4a] transition-all shadow-sm outline-none" id="confirm-password" placeholder="Confirm password" type={showPassword ? "text" : "password"} />
                                        </div>
                                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-10 mt-6 border-t border-slate-100 dark:border-slate-800">
                                    <button onClick={() => navigate('/register/industry/step1')} className="px-6 py-3 rounded-xl border border-transparent text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-2 group outline-none" type="button">
                                        <span className="material-symbols-outlined text-lg group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                                        Back
                                    </button>
                                    <button className="px-8 py-3 bg-[#1a7a4a] hover:bg-[#145e39] text-white rounded-xl font-bold shadow-lg shadow-[#1a7a4a]/25 hover:shadow-[#1a7a4a]/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 outline-none" type="submit">
                                        Review & Submit
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            Need help? <Link className="text-[#1a7a4a] hover:text-[#145e39] font-medium transition-colors" to="#">Contact Support</Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
