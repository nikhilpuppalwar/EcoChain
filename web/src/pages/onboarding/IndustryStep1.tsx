import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOnboardingStore } from '../../store/onboardingStore';

const step1Schema = z.object({
    companyName: z.string().min(3, 'Company name must be at least 3 characters').max(100),
    sector: z.enum(['Energy', 'Cement', 'Steel', 'Mining', 'Transport', 'Other']).or(z.literal('')),
    state: z.string().min(1, 'Select a state'),
    registrationNo: z.string().min(3, 'Registration No is required'),
    panId: z.string().min(3, 'PAN or Tax ID is required'),
    carbonBudget: z.number().positive('Must be positive').max(1000000, 'Must be less than 1,000,000'),
});

type Step1FormValues = z.infer<typeof step1Schema>;

export default function IndustryStep1() {
    const navigate = useNavigate();
    const setStep1 = useOnboardingStore((state) => state.setStep1);
    const existingData = useOnboardingStore((state) => state.step1);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<Step1FormValues>({
        resolver: zodResolver(step1Schema),
        defaultValues: existingData || {
            companyName: '',
            sector: '',
            registrationNo: '',
            panId: '',
            state: '',
            carbonBudget: undefined,
        }
    });

    const selectedSector = watch('sector');

    const onSubmit = (data: Step1FormValues) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setStep1(data as any);
        navigate('/register/industry/step2');
    };

    const sectors = [
        { id: 'Energy', icon: 'bolt', name: 'Energy' },
        { id: 'Cement', icon: 'foundation', name: 'Cement' },
        { id: 'Steel', icon: 'construction', name: 'Steel' },
        { id: 'Mining', icon: 'diamond', name: 'Mining' },
        { id: 'Transport', icon: 'local_shipping', name: 'Transport' },
        { id: 'Other', icon: 'apps', name: 'Other' },
    ] as const;

    return (
        <div className="bg-[#f3f4f6] dark:bg-[#1a1625] font-['DM_Sans',sans-serif] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col justify-center items-center py-12 px-4">
            <div className="w-full max-w-3xl flex flex-col gap-8">
                <div className="flex flex-col items-center justify-center gap-3 text-center mb-2">
                    <div className="w-12 h-12 rounded-xl bg-[#1A7A4A] flex items-center justify-center text-white shadow-lg shadow-[#1A7A4A]/20">
                        <span className="material-symbols-outlined text-3xl">domain</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-['Syne',sans-serif] font-bold tracking-tight text-slate-900 dark:text-white">EcoChain</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Industry Registration Portal</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden w-full">
                    <div className="flex border-b border-slate-100 dark:border-slate-800">
                        <div className="flex-1 py-5 text-center border-b-2 border-[#1A7A4A] bg-[#1A7A4A]/5 dark:bg-[#1A7A4A]/10 relative">
                            <span className="text-xs font-bold font-['Syne',sans-serif] text-[#1A7A4A] dark:text-emerald-400 flex items-center justify-center gap-2 tracking-wide">
                                <span className="w-6 h-6 rounded-full bg-[#1A7A4A] text-white text-[11px] flex items-center justify-center shadow-sm">1</span>
                                COMPANY
                            </span>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                        </div>
                        <div className="flex-1 py-5 text-center border-b-2 border-transparent relative">
                            <span className="text-xs font-bold font-['Syne',sans-serif] text-slate-400 flex items-center justify-center gap-2 tracking-wide">
                                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] flex items-center justify-center">2</span>
                                EMPLOYEE
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
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#1A7A4A]/10 dark:bg-[#1A7A4A]/20 text-[#1A7A4A] dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-4 border border-[#1A7A4A]/20 dark:border-emerald-800">
                                Step 1 of 3
                            </span>
                            <h2 className="text-2xl md:text-3xl font-['Syne',sans-serif] font-bold text-slate-900 dark:text-white mb-3">Company Information</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                                Please provide your official entity details as per government records.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Primary Sector <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                    {sectors.map((s) => (
                                        <label key={s.id} className={`relative flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedSector === s.id ? 'border-[#1A7A4A] bg-[#1A7A4A]/5 dark:bg-[#1A7A4A]/20 shadow-sm' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-[#1A7A4A]/40 dark:hover:border-emerald-800'}`}>
                                            <input {...register('sector')} value={s.id} className="hidden" type="radio" />
                                            <span className={`material-symbols-outlined mr-3 ${selectedSector === s.id ? 'text-[#1A7A4A] dark:text-emerald-400' : 'text-slate-400'}`}>{s.icon}</span>
                                            <span className={`text-sm font-bold ${selectedSector === s.id ? 'text-[#1A7A4A] dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>{s.name}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.sector && <p className="text-red-500 text-xs mt-1">{errors.sector.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Company Name <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">domain</span>
                                        <input
                                            {...register('companyName')}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-[#1A7A4A] focus:border-[#1A7A4A] transition-all placeholder-slate-400"
                                            placeholder="e.g. Acme Industries Ltd."
                                        />
                                    </div>
                                    {errors.companyName && <p className="text-red-500 text-xs">{errors.companyName.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">State / Region <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            {...register('state')}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3.5 px-4 focus:ring-2 focus:ring-[#1A7A4A] focus:border-[#1A7A4A] transition-all appearance-none"
                                        >
                                            <option value="" disabled>Select State</option>
                                            <option value="Mumbai">Mumbai</option>
                                            <option value="Pune">Pune</option>
                                            <option value="Delhi">Delhi</option>
                                            <option value="Bangalore">Bangalore</option>
                                            <option value="Hyderabad">Hyderabad</option>
                                            <option value="Chennai">Chennai</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                    </div>
                                    {errors.state && <p className="text-red-500 text-xs">{errors.state.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Registration No. <span className="text-red-500">*</span></label>
                                    <input
                                        {...register('registrationNo')}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3.5 px-4 focus:ring-2 focus:ring-[#1A7A4A] focus:border-[#1A7A4A] transition-all placeholder-slate-400 uppercase"
                                        placeholder="U12345MH2024PTC123456"
                                    />
                                    {errors.registrationNo && <p className="text-red-500 text-xs">{errors.registrationNo.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Tax ID / PAN <span className="text-red-500">*</span></label>
                                    <input
                                        {...register('panId')}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3.5 px-4 focus:ring-2 focus:ring-[#1A7A4A] focus:border-[#1A7A4A] transition-all placeholder-slate-400 uppercase"
                                        placeholder="ABCDE1234F"
                                    />
                                    {errors.panId && <p className="text-red-500 text-xs">{errors.panId.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Est. Carbon Budget <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">eco</span>
                                        <input
                                            {...register('carbonBudget', { valueAsNumber: true })}
                                            type="number"
                                            className="w-full bg-[#1A7A4A]/5 dark:bg-[#1A7A4A]/10 border-[#1A7A4A]/10 dark:border-emerald-800 rounded-xl text-sm py-3.5 pl-11 pr-16 focus:ring-2 focus:ring-[#1A7A4A] focus:border-[#1A7A4A] transition-all font-semibold"
                                            placeholder="0.00"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium font-mono">tCO2e/yr</span>
                                    </div>
                                    {errors.carbonBudget && <p className="text-red-500 text-xs">{errors.carbonBudget.message}</p>}
                                </div>
                            </div>

                            <div className="flex gap-4 p-5 rounded-xl bg-[#1A7A4A]/5 dark:bg-[#1A7A4A]/10 border border-[#1A7A4A]/10 dark:border-emerald-800/30 mt-6">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-[#1A7A4A]/10 dark:bg-[#1A7A4A]/20 flex items-center justify-center text-[#1A7A4A] dark:text-emerald-400">
                                    <span className="material-symbols-outlined text-[20px]">info</span>
                                </div>
                                <div className="pt-1">
                                    <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-1">Compliance Check</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        Ensure your Carbon Budget matches your Environmental Clearance filing. Discrepancies may trigger an automatic audit flag.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full py-4 px-6 bg-[#1A7A4A] hover:bg-[#2E9E68] text-white font-bold font-['Syne',sans-serif] rounded-xl shadow-lg shadow-[#1A7A4A]/20 active:scale-[0.99] transition-all flex items-center justify-center gap-3 group tracking-wide">
                                    Continue to Employee details
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-400 font-medium">
                    Already registered? <Link className="text-[#1A7A4A] dark:text-emerald-400 font-bold hover:underline transition-all" to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
