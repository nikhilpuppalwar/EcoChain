import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuditorOnboardingStore } from '../../store/auditorOnboardingStore';

const specializations = ['Environmental', 'Carbon', 'ESG', 'GHG Protocol', 'ISO 14064'];

const auditorStep1Schema = z.object({
    organization: z.string().min(1, 'Organization name is required'),
    designation: z.string().min(1, 'Designation is required'),
    experience: z.string().min(1, 'Years of experience is required').regex(/^\d+$/, 'Must be a valid number'),
    specialization: z.array(z.string()).min(1, 'At least one specialization is required'),
});

type AuditorStep1FormValues = z.infer<typeof auditorStep1Schema>;

export default function AuditorStep1() {
    const navigate = useNavigate();
    const setStep1 = useAuditorOnboardingStore((state) => state.setStep1);
    const existingData = useAuditorOnboardingStore((state) => state.step1);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AuditorStep1FormValues>({
        resolver: zodResolver(auditorStep1Schema),
        defaultValues: existingData || {
            organization: '',
            designation: '',
            experience: '',
            specialization: [],
        }
    });

    const selectedSpecializations = watch('specialization') || [];

    const toggleSpecialization = (spec: string) => {
        const newSpecs = selectedSpecializations.includes(spec)
            ? selectedSpecializations.filter(s => s !== spec)
            : [...selectedSpecializations, spec];
        setValue('specialization', newSpecs, { shouldValidate: true });
    };

    const onSubmit = (data: AuditorStep1FormValues) => {
        setStep1(data);
        navigate('/register/auditor/step2');
    };

    return (
        <div className="bg-[#f3f4f6] dark:bg-[#1a1625] font-['DM_Sans',sans-serif] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col justify-center items-center py-12 px-4">
            <div className="w-full max-w-3xl flex flex-col gap-8">
                <div className="flex flex-col items-center justify-center gap-3 text-center mb-2">
                    <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/20">
                        <span className="material-symbols-outlined text-3xl">fact_check</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-['Syne',sans-serif] font-bold tracking-tight text-slate-900 dark:text-white">EcoChain</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Auditor Verification Portal</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden w-full">
                    <div className="flex border-b border-slate-100 dark:border-slate-800">
                        <div className="flex-1 py-5 text-center border-b-2 border-violet-600 bg-violet-50 dark:bg-violet-900/10 relative">
                            <span className="text-xs font-bold font-['Syne',sans-serif] text-violet-600 dark:text-violet-400 flex items-center justify-center gap-2 tracking-wide">
                                <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-[11px] flex items-center justify-center shadow-sm">1</span>
                                PROFESSIONAL
                            </span>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                        </div>
                        <div className="flex-1 py-5 text-center border-b-2 border-transparent relative">
                            <span className="text-xs font-bold font-['Syne',sans-serif] text-slate-400 flex items-center justify-center gap-2 tracking-wide">
                                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] flex items-center justify-center">2</span>
                                PERSONAL
                            </span>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                        </div>
                        <div className="flex-1 py-5 text-center border-b-2 border-transparent">
                            <span className="text-xs font-bold font-['Syne',sans-serif] text-slate-400 flex items-center justify-center gap-2 tracking-wide">
                                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] flex items-center justify-center">3</span>
                                VERIFY
                            </span>
                        </div>
                    </div>

                    <div className="p-8 md:p-10">
                        <div className="mb-10 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-[10px] font-bold uppercase tracking-wider mb-4 border border-violet-200 dark:border-violet-800">
                                Step 1 of 3
                            </span>
                            <h2 className="text-2xl md:text-3xl font-['Syne',sans-serif] font-bold text-slate-900 dark:text-white mb-3">Professional Background</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                                Tell us about your professional expertise as an environmental auditor. This information will be reviewed by platform administrators.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Organization / Firm <span className="text-red-500">*</span></label>
                                    <input
                                        {...register('organization')}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3.5 px-4 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all placeholder-slate-400"
                                        placeholder="Green Audit Firm LLC"
                                    />
                                    {errors.organization && <p className="text-red-500 text-xs">{errors.organization.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Designation <span className="text-red-500">*</span></label>
                                    <input
                                        {...register('designation')}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3.5 px-4 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all placeholder-slate-400"
                                        placeholder="Senior Environmental Auditor"
                                    />
                                    {errors.designation && <p className="text-red-500 text-xs">{errors.designation.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Years of Experience <span className="text-red-500">*</span></label>
                                <input
                                    {...register('experience')}
                                    type="number"
                                    min="1"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3.5 px-4 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all placeholder-slate-400"
                                    placeholder="e.g. 8"
                                />
                                {errors.experience && <p className="text-red-500 text-xs">{errors.experience.message}</p>}
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Specializations <span className="text-red-500">*</span></label>
                                <div className="flex flex-wrap gap-2">
                                    {specializations.map(s => (
                                        <button
                                            type="button"
                                            key={s}
                                            onClick={() => toggleSpecialization(s)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${selectedSpecializations.includes(s)
                                                    ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-600/20'
                                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-400'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                                {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization.message}</p>}
                            </div>

                            <div className="flex gap-4 p-5 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/30 mt-6">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                    <span className="material-symbols-outlined text-[20px]">info</span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium pt-1">
                                    Platform administrators will verify your organization and experience. Ensure all details exactly match your official certifications.
                                </p>
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full py-4 px-6 bg-violet-600 hover:bg-violet-700 text-white font-bold font-['Syne',sans-serif] rounded-xl shadow-lg shadow-violet-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-3 group tracking-wide">
                                    Continue to Personal Details
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-400 font-medium">
                    Already an auditor? <Link className="text-violet-600 dark:text-violet-400 font-bold hover:underline transition-all" to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
