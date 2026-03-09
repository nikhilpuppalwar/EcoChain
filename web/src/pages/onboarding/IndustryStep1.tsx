import React from 'react';
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

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Step1FormValues>({
        resolver: zodResolver(step1Schema),
        defaultValues: existingData || {
            companyName: '',
            registrationNo: '',
            panId: '',
            state: '',
            carbonBudget: undefined,
        }
    });

    const selectedSector = watch('sector');

    const onSubmit = (data: Step1FormValues) => {
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
        <div className="bg-[#F0F4F1] text-slate-900 font-['DM_Sans',sans-serif] min-h-screen flex flex-col relative overflow-y-auto">
            <header className="w-full bg-[#072A19] text-white py-6 px-6 md:px-10 border-b border-white/10">
                <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-green-400 text-3xl">eco</span>
                        </div>
                        <div>
                            <h1 className="font-['Syne',sans-serif] text-2xl font-bold leading-none">Carbon Credit Portal</h1>
                            <p className="text-green-200/60 text-xs mt-1">National Registry Compliance Wizard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
                            </span>
                            <span className="text-xs font-medium tracking-wide text-green-50 uppercase">Registration Open</span>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1 w-full px-4 py-8 md:px-6 md:py-12">
                <div className="max-w-4xl mx-auto w-full">
                    <div className="mb-6 flex justify-end">
                        <div className="flex items-center gap-2 text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                            <span className="text-sm font-medium">Registration ID:</span>
                            <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">UNK-2024-X88</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-[20px] shadow-xl border border-slate-100 overflow-hidden">
                        <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-8 md:px-12">
                            <nav aria-label="Progress">
                                <ol className="flex items-center w-full" role="list">
                                    <li className="relative flex-1 group">
                                        <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                            <div className="h-0.5 w-full bg-slate-200 group-hover:bg-slate-300 transition-colors"></div>
                                        </div>
                                        <a className="relative flex items-center justify-start group" href="#">
                                            <span className="h-10 w-10 flex items-center justify-center rounded-full bg-[#1a7a4a] hover:bg-[#0D5C34] transition-colors ring-4 ring-white z-10">
                                                <span className="material-symbols-outlined text-white text-lg">check</span>
                                            </span>
                                            <span className="ml-3 flex flex-col min-w-0 bg-white px-2 z-10">
                                                <span className="text-xs font-bold text-[#1a7a4a] tracking-wide uppercase">Step 01</span>
                                                <span className="text-sm font-bold text-slate-900 font-['Syne',sans-serif]">Company</span>
                                            </span>
                                        </a>
                                    </li>
                                    <li className="relative flex-1 group">
                                        <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                            <div className="h-0.5 w-full bg-slate-200"></div>
                                        </div>
                                        <a className="relative flex items-center justify-center group" href="#">
                                            <span className="h-10 w-10 flex items-center justify-center rounded-full bg-white border-2 border-slate-300 group-hover:border-slate-400 transition-colors z-10">
                                                <span className="text-sm font-bold text-slate-500">02</span>
                                            </span>
                                            <span className="ml-3 flex flex-col min-w-0 bg-white px-2 z-10 hidden sm:flex">
                                                <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">Step 02</span>
                                                <span className="text-sm font-medium text-slate-500 font-['Syne',sans-serif]">Admin Setup</span>
                                            </span>
                                        </a>
                                    </li>
                                    <li className="relative group">
                                        <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                            <div className="h-0.5 w-full bg-transparent"></div>
                                        </div>
                                        <a className="relative flex items-center justify-end group" href="#">
                                            <span className="h-10 w-10 flex items-center justify-center rounded-full bg-white border-2 border-slate-300 group-hover:border-slate-400 transition-colors z-10">
                                                <span className="text-sm font-bold text-slate-500">03</span>
                                            </span>
                                            <span className="ml-3 flex flex-col min-w-0 bg-white px-2 z-10 hidden sm:flex">
                                                <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">Step 03</span>
                                                <span className="text-sm font-medium text-slate-500 font-['Syne',sans-serif]">Final Review</span>
                                            </span>
                                        </a>
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="p-8 md:p-12">
                            <div className="mb-10 text-center max-w-2xl mx-auto">
                                <h2 className="font-['Syne',sans-serif] text-3xl md:text-4xl font-bold text-slate-900 mb-3">Company Information</h2>
                                <p className="text-slate-500 text-lg">Please provide your official entity details as per government records.</p>
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="mb-10">
                                    <label className="block text-sm font-bold text-slate-700 mb-4">Primary Sector <span className="text-red-500">*</span></label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                        {sectors.map((s) => (
                                            <label key={s.id} className="cursor-pointer group">
                                                <input {...register('sector')} value={s.id} className="peer sr-only" type="radio" />
                                                <div className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all h-28 ${selectedSector === s.id ? 'border-[#1a7a4a] bg-[#1a7a4a]/5 text-[#1a7a4a] shadow-inner' : 'border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md hover:border-[#1a7a4a]/30'}`}>
                                                    <span className={`material-symbols-outlined text-3xl mb-2 transition-transform ${selectedSector !== s.id ? 'group-hover:scale-110' : 'scale-110'}`}>{s.icon}</span>
                                                    <span className="text-xs font-semibold">{s.name}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.sector && <p className="mt-1.5 text-sm text-red-500">{errors.sector.message}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-10">
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="company_name">Company Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-slate-400">domain</span>
                                            </div>
                                            <input {...register('companyName')} className="block w-full pl-10 pr-3 py-3 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#1a7a4a] focus:border-[#1a7a4a] sm:text-sm transition-shadow outline-none" id="company_name" placeholder="e.g. Acme Industries Ltd." type="text" />
                                        </div>
                                        {errors.companyName && <p className="mt-1.5 text-sm text-red-500">{errors.companyName.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="state">State / Region</label>
                                        <div className="relative">
                                            <select {...register('state')} className="block w-full pl-3 pr-10 py-3 rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#1a7a4a] focus:border-[#1a7a4a] sm:text-sm appearance-none transition-shadow outline-none" id="state">
                                                <option value="" disabled>Select State</option>
                                                <option value="Mumbai">Mumbai</option>
                                                <option value="Pune">Pune</option>
                                                <option value="Delhi">Delhi</option>
                                                <option value="Bangalore">Bangalore</option>
                                                <option value="Hyderabad">Hyderabad</option>
                                                
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-slate-500 text-lg">expand_more</span>
                                            </div>
                                        </div>
                                        {errors.state && <p className="mt-1.5 text-sm text-red-500">{errors.state.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="reg_no">Registration No. (CIN/LLPIN)</label>
                                        <input {...register('registrationNo')} className="block w-full px-3 py-3 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#1a7a4a] focus:border-[#1a7a4a] sm:text-sm transition-shadow outline-none" id="reg_no" placeholder="U12345MH2024PTC123456" type="text" />
                                        {errors.registrationNo && <p className="mt-1.5 text-sm text-red-500">{errors.registrationNo.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="pan">Tax ID / PAN</label>
                                        <input {...register('panId')} className="block w-full px-3 py-3 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#1a7a4a] focus:border-[#1a7a4a] sm:text-sm transition-shadow uppercase outline-none" id="pan" placeholder="ABCDE1234F" type="text" />
                                        {errors.panId && <p className="mt-1.5 text-sm text-red-500">{errors.panId.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="budget">Est. Annual Carbon Budget</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-[#1a7a4a]">eco</span>
                                            </div>
                                            <input {...register('carbonBudget', { valueAsNumber: true })} className="block w-full pl-10 pr-16 py-3 rounded-lg border-slate-200 bg-[#E8F5E9] text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#1a7a4a] focus:border-[#1a7a4a] sm:text-sm font-semibold transition-shadow outline-none" id="budget" placeholder="0.00" type="number" />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-xs text-slate-500 font-medium">tCO2e/yr</span>
                                            </div>
                                        </div>
                                        {errors.carbonBudget && <p className="mt-1.5 text-sm text-red-500">{errors.carbonBudget.message}</p>}
                                    </div>
                                </div>
                                <div className="rounded-xl bg-[#E8F5E9] border border-[#1a7a4a]/20 p-5 flex gap-4 items-start mb-10">
                                    <div className="shrink-0 p-1.5 bg-[#1a7a4a]/20 rounded-full text-[#1a7a4a] mt-0.5">
                                        <span className="material-symbols-outlined text-base">info</span>
                                    </div>
                                    <div className="text-sm">
                                        <h4 className="font-bold text-[#0D5C34] mb-1">Compliance Check</h4>
                                        <p className="text-slate-600 leading-relaxed">
                                            Ensure your Carbon Budget matches your Environmental Clearance filing. Discrepancies may trigger an automatic audit flag during the verification step.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6">
                                    <button type="button" onClick={() => navigate('/login')} className="text-slate-500 font-medium hover:text-slate-800 transition-colors">Cancel Application</button>
                                    <button type="submit" className="w-full md:w-auto bg-[#1a7a4a] hover:bg-[#0D5C34] text-white font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group">
                                        Continue to Admin Account
                                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-12 mb-8 text-sm text-slate-400">
                        <Link className="hover:text-[#1a7a4a] transition-colors" to="#">Privacy Policy</Link>
                        <span className="text-slate-300">•</span>
                        <Link className="hover:text-[#1a7a4a] transition-colors" to="#">Terms of Service</Link>
                        <span className="text-slate-300">•</span>
                        <Link className="hover:text-[#1a7a4a] transition-colors" to="#">Contact Support</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
