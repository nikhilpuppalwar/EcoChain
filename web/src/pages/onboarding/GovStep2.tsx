import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGovOnboardingStore } from '../../store/govOnboardingStore';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

const govStep2Schema = z.object({
    officerName: z.string().min(2, 'Must be at least 2 characters').max(100),
    designation: z.enum([
        'Joint Secretary',
        'Deputy Secretary',
        'Director',
        'Deputy Director',
        'Senior Environmental Officer',
        'Regional Officer'
    ]).or(z.literal('')),
    email: z.string().email('Please enter a valid email address').refine(val => val.endsWith('.gov.in') || val.endsWith('.nic.in'), {
        message: 'Must use official .gov.in or .nic.in email address'
    }),
    serviceId: z.string().min(5, 'Enter valid service ID'),
    phone: z.string().min(10, 'Required for government accounts'),
    password: z.string()
        .min(12, 'Government accounts require minimum 12 characters')
        .regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/, 'Must include uppercase, number, and special character'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

type FormValues = z.infer<typeof govStep2Schema>;

export default function GovStep2() {
    const navigate = useNavigate();
    const setStep2 = useGovOnboardingStore((state) => state.setStep2);
    const existingData = useGovOnboardingStore((state) => state.step2);

    const [emailError, setEmailError] = useState<string | null>(null);
    const [idFile, setIdFile] = useState<File | null>(existingData?.idDocumentFile || null);
    const [fileError, setFileError] = useState<string | null>(null);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(govStep2Schema),
        defaultValues: existingData ? {
            officerName: existingData.officerName,
            designation: existingData.designation,
            email: existingData.email,
            serviceId: existingData.serviceId,
            phone: existingData.phone,
            password: '',
            confirmPassword: ''
        } : {
            officerName: '',
            designation: '',
            email: '',
            serviceId: '',
            phone: '',
            password: '',
            confirmPassword: '',
        }
    });

    const passwordVal = watch('password') || '';
    const emailVal = watch('email');

    // Government Password Strength Logic (>= 12)
    const getPasswordStrength = (pass: string) => {
        let score = 0;
        if (pass.length >= 12) score += 1;
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
                setIdFile(null);
                return;
            }
            if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
                setFileError("Only PDF, JPG, or PNG allowed");
                setIdFile(null);
                return;
            }
            setIdFile(file);
        }
    };

    // Mock Email Check
    const checkEmailUnique = async () => {
        if (!emailVal || errors.email) return;

        // Check .gov extension early (zod does this but good for UI sync)
        if (!emailVal.endsWith('.gov.in') && !emailVal.endsWith('.nic.in')) return;

        await new Promise(r => setTimeout(r, 600));

        if (emailVal.toLowerCase() === 'admin@moefcc.gov.in') {
            setEmailError('Account exists, sign in instead');
        } else {
            setEmailError(null);
        }
    };

    const onSubmit = (data: FormValues) => {
        if (emailError) return;
        if (!idFile) {
            setFileError('Identity document is required');
            return;
        }

        setStep2({
            officerName: data.officerName,
            designation: data.designation,
            email: data.email,
            phone: data.phone,
            serviceId: data.serviceId,
            password: data.password,
            idDocumentFile: idFile
        });

        navigate('/register/government/review');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-slate-100 font-display">
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                <header className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">eco</span>
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">EcoChain</h1>
                    </div>
                    <div className="flex gap-4">
                        <button className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">notifications</span>
                        </button>
                        <button className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">account_circle</span>
                        </button>
                    </div>
                </header>
                <div className="mb-12">
                    <div className="flex items-center justify-between relative">
                        <div className="flex flex-col items-center gap-2 z-10 bg-background-light dark:bg-background-dark pr-4">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white ring-4 ring-primary/20">
                                <span className="material-symbols-outlined text-lg">check</span>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Step 1</span>
                        </div>
                        <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 z-0">
                            <div className="h-full bg-primary w-1/2"></div>
                        </div>
                        <div className="flex flex-col items-center gap-2 z-10 bg-background-light dark:bg-background-dark px-4">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white ring-8 ring-primary/10">
                                <span className="text-sm font-bold">2</span>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Step 2</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 z-10 bg-background-light dark:bg-background-dark pl-4">
                            <div className="w-10 h-10 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                                <span className="text-sm font-bold">3</span>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Step 3</span>
                        </div>
                    </div>
                </div>
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-4 border border-primary/20">
                        <span className="material-symbols-outlined text-sm">verified_user</span>
                        <span className="text-sm font-bold tracking-wide uppercase">Regulatory Officer</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">Create officer account</h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                        This account represents an authorized government regulatory officer on EcoChain. Please ensure all details match your official service record.
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Officer Full Name</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                                <input
                                    {...register('officerName')}
                                    className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border ${errors.officerName ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary'} rounded-lg focus:ring-2 transition-all text-slate-900 dark:text-slate-100`}
                                    placeholder="e.g. Dr. Rajesh Kumar"
                                    type="text"
                                />
                            </div>
                            {errors.officerName && <p className="text-red-500 text-xs mt-1">{errors.officerName.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Official Designation</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">work</span>
                                <select
                                    {...register('designation')}
                                    className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border ${errors.designation ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary'} rounded-lg focus:ring-2 transition-all text-slate-900 dark:text-slate-100 appearance-none`}
                                >
                                    <option value="">Select designation</option>
                                    <option value="Joint Secretary">Joint Secretary</option>
                                    <option value="Deputy Secretary">Deputy Secretary</option>
                                    <option value="Director">Director</option>
                                    <option value="Deputy Director">Deputy Director</option>
                                    <option value="Senior Environmental Officer">Senior Environmental Officer</option>
                                    <option value="Regional Officer">Regional Officer</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                            </div>
                            {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation.message}</p>}
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Official Government Email</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                                <input
                                    {...register('email')}
                                    onBlur={checkEmailUnique}
                                    className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border ${errors.email || emailError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary'} rounded-lg focus:ring-2 transition-all text-slate-900 dark:text-slate-100`}
                                    placeholder="officer@nic.in or officer@gov.in"
                                    type="email"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            {emailError && <p className="text-red-500 text-xs mt-1">{emailError} <Link to="/login" className="underline font-bold">Sign in instead →</Link></p>}
                            <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg mt-1">
                                <span className="material-symbols-outlined text-primary text-xl">info</span>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                                    Critical: Verification is restricted to official <span className="font-bold text-primary">.gov.in</span> or <span className="font-bold text-primary">.nic.in</span> domains only.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Employee / Service ID</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">badge</span>
                                <input
                                    {...register('serviceId')}
                                    className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border ${errors.serviceId ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary'} rounded-lg focus:ring-2 transition-all text-slate-900 dark:text-slate-100`}
                                    placeholder="ID-8829-X"
                                    type="text"
                                />
                            </div>
                            {errors.serviceId && <p className="text-red-500 text-xs mt-1">{errors.serviceId.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Official Contact Number</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">call</span>
                                <input
                                    {...register('phone')}
                                    className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary'} rounded-lg focus:ring-2 transition-all text-slate-900 dark:text-slate-100`}
                                    placeholder="+91 00000 00000"
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
                                    className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary'} rounded-lg focus:ring-2 transition-all text-slate-900 dark:text-slate-100`}
                                    placeholder="••••••••"
                                    type="password"
                                />
                            </div>
                            <div className="flex gap-1.5 mt-1 items-center">
                                <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 1 ? 'bg-primary/40' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                                <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 2 ? 'bg-primary/70' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                                <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 3 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                                <div className={`h-1.5 flex-1 rounded-full ${strengthScore >= 4 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                                {strengthScore >= 4 && <span className="text-[10px] font-bold text-primary uppercase ml-2">Strong</span>}
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock_reset</span>
                                <input
                                    {...register('confirmPassword')}
                                    className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-primary focus:border-primary'} rounded-lg focus:ring-2 transition-all text-slate-900 dark:text-slate-100`}
                                    placeholder="••••••••"
                                    type="password"
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Identity Document Upload</label>

                            <input
                                type="file"
                                id="idUpload"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="idUpload" className={`relative border-2 border-dashed ${fileError ? 'border-red-500 bg-red-50' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50'} rounded-xl p-8 hover:bg-primary/5 hover:border-primary transition-all cursor-pointer flex flex-col items-center justify-center text-center group`}>
                                {idFile ? (
                                    <>
                                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-3xl">check_circle</span>
                                        </div>
                                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 text-primary">{idFile.name}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">{(idFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <div className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:shadow-md transition-shadow">
                                            Change File
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                                        </div>
                                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Upload Government ID Card / Service Book</h4>
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
                    <div className="pt-10 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                        <button onClick={() => navigate('/register/government/step1')} className="flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-400 font-bold hover:text-primary transition-colors" type="button">
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back
                        </button>
                        <button className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/25" type="submit">
                            Review Application
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </form>
                <footer className="mt-16 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Facing issues? Contact <a className="text-primary font-semibold hover:underline" href="#">Officer Support Desk</a> or call 1800-GREEN-01
                    </p>
                </footer>
            </div>
        </div>
    );
}
