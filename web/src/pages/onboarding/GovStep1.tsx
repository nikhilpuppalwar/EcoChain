import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGovOnboardingStore } from '../../store/govOnboardingStore';

const govStep1Schema = z.object({
    ministry: z.string().min(1, 'Select a ministry'),
    department: z.enum(['Carbon Markets Division', 'Compliance & Enforcement', 'Emission Reporting Cell', 'PAT Scheme Bureau']).or(z.literal('')),
    jurisdiction: z.string().min(1, 'Select jurisdiction'),
    authorizationCode: z.string().min(8, 'Enter valid authorization code'),
    officeAddress: z.string().optional(),
    websiteUrl: z.string().url('Must be a valid URL (e.g., https://example.gov.in)').optional().or(z.literal('')),
});

type GovStep1FormValues = z.infer<typeof govStep1Schema>;

export default function GovStep1() {
    const navigate = useNavigate();
    const setStep1 = useGovOnboardingStore((state) => state.setStep1);
    const existingData = useGovOnboardingStore((state) => state.step1);

   const { register, handleSubmit, watch, formState: { errors } } = useForm<GovStep1FormValues>({
    resolver: zodResolver(govStep1Schema),
    // Use a function or a ternary to safely map existing data
    defaultValues: {
        ministry: existingData?.ministry || '',
        department: (existingData?.department as GovStep1FormValues['department']) || '',
        jurisdiction: existingData?.jurisdiction || '',
        authorizationCode: existingData?.authorizationCode || '',
        officeAddress: existingData?.officeAddress || '',
        websiteUrl: existingData?.websiteUrl || '',
    }
});

    const selectedDept = watch('department');

    const onSubmit = (data: GovStep1FormValues) => {
        setStep1(data);
        navigate('/register/government/step2');
    };

    return (
        <div className="bg-[#f3f4f6] dark:bg-[#221610] font-['DM_Sans',sans-serif] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col justify-center items-center py-12 px-4">
            <div className="w-full max-w-3xl flex flex-col gap-8">
                <div className="flex flex-col items-center justify-center gap-3 text-center mb-2">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                        <span className="material-symbols-outlined text-3xl">eco</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-['Syne',sans-serif] font-bold tracking-tight text-slate-900 dark:text-white">EcoChain</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Government Regulatory Portal</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05),_0_0_20px_-10px_rgba(37,99,235,0.1)] dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden w-full">
                    <div className="flex border-b border-slate-100 dark:border-slate-800">
                        <div className="flex-1 py-5 text-center border-b-2 border-blue-600 bg-blue-50 relative">
                            <span className="text-xs font-bold font-['Syne',sans-serif] text-blue-600 flex items-center justify-center gap-2 tracking-wide">
                                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center shadow-sm">1</span>
                                MINISTRY
                            </span>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                        </div>
                        <div className="flex-1 py-5 text-center border-b-2 border-transparent relative">
                            <span className="text-xs font-bold font-['Syne',sans-serif] text-slate-400 flex items-center justify-center gap-2 tracking-wide">
                                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 text-[11px] flex items-center justify-center">2</span>
                                OFFICER
                            </span>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                        </div>
                        <div className="flex-1 py-5 text-center border-b-2 border-transparent">
                            <span className="text-xs font-bold font-['Syne',sans-serif] text-slate-400 flex items-center justify-center gap-2 tracking-wide">
                                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 text-[11px] flex items-center justify-center">3</span>
                                VERIFY
                            </span>
                        </div>
                    </div>
                    <div className="p-8 md:p-10">
                        <div className="mb-10 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-4 border border-blue-200">
                                Step 1 of 3
                            </span>
                            <h2 className="text-2xl md:text-3xl font-['Syne',sans-serif] font-bold text-slate-900 dark:text-white mb-3 leading-tight">Ministry &amp; Department Details</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
                                Government accounts require ministry authorization. Your account will be verified by the central administrator before activation.
                            </p>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                    Ministry Name
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <select {...register('ministry')} className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-4 px-5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none text-slate-700 dark:text-slate-200 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                        <option value="" disabled>Select a Ministry</option>
                                        <option value="Ministry of Environment Forest & Climate Change (MoEFCC)">Ministry of Environment Forest &amp; Climate Change (MoEFCC)</option>
                                        <option value="Ministry of New and Renewable Energy (MNRE)">Ministry of New and Renewable Energy (MNRE)</option>
                                        <option value="Ministry of Power">Ministry of Power</option>
                                        <option value="Ministry of Jal Shakti">Ministry of Jal Shakti</option>
                                        <option value="Ministry of Commerce and Industry">Ministry of Commerce and Industry</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-600 transition-colors pointer-events-none">expand_more</span>
                                </div>
                                {errors.ministry && <p className="text-red-500 text-xs mt-1">{errors.ministry.message}</p>}
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                    Select Primary Department
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedDept === 'Carbon Markets Division' ? 'border-blue-600 bg-blue-50 hover:shadow-md' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:border-blue-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm group'}`}>
                                        <input {...register('department')} value="Carbon Markets Division" className="hidden peer" type="radio" />
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 shadow-sm transition-colors ${selectedDept === 'Carbon Markets Division' ? 'bg-white dark:bg-slate-900 text-blue-600 border border-blue-100' : 'bg-white dark:bg-slate-700 text-slate-400 group-hover:text-blue-600'}`}>
                                            <span className="material-symbols-outlined">analytics</span>
                                        </div>
                                        <div>
                                            <span className={`text-sm font-bold block font-['Syne',sans-serif] ${selectedDept === 'Carbon Markets Division' ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>Carbon Markets</span>
                                            <span className="text-xs text-slate-500">Market Oversight Division</span>
                                        </div>
                                        <div className={`absolute top-3 right-3 text-blue-600 transition-all ${selectedDept === 'Carbon Markets Division' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                                            <span className="material-symbols-outlined text-xl">check_circle</span>
                                        </div>
                                    </label>
                                    <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedDept === 'Compliance & Enforcement' ? 'border-blue-600 bg-blue-50 hover:shadow-md' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:border-blue-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm group'}`}>
                                        <input {...register('department')} value="Compliance & Enforcement" className="hidden peer" type="radio" />
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 shadow-sm transition-colors ${selectedDept === 'Compliance & Enforcement' ? 'bg-white dark:bg-slate-900 text-blue-600 border border-blue-100' : 'bg-white dark:bg-slate-700 text-slate-400 group-hover:text-blue-600'}`}>
                                            <span className="material-symbols-outlined">policy</span>
                                        </div>
                                        <div>
                                            <span className={`text-sm font-bold block font-['Syne',sans-serif] ${selectedDept === 'Compliance & Enforcement' ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>Compliance</span>
                                            <span className="text-xs text-slate-500">Enforcement Wing</span>
                                        </div>
                                        <div className={`absolute top-3 right-3 text-blue-600 transition-all ${selectedDept === 'Compliance & Enforcement' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                                            <span className="material-symbols-outlined text-xl">check_circle</span>
                                        </div>
                                    </label>
                                    <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedDept === 'Emission Reporting Cell' ? 'border-blue-600 bg-blue-50 hover:shadow-md' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:border-blue-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm group'}`}>
                                        <input {...register('department')} value="Emission Reporting Cell" className="hidden peer" type="radio" />
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 shadow-sm transition-colors ${selectedDept === 'Emission Reporting Cell' ? 'bg-white dark:bg-slate-900 text-blue-600 border border-blue-100' : 'bg-white dark:bg-slate-700 text-slate-400 group-hover:text-blue-600'}`}>
                                            <span className="material-symbols-outlined">database</span>
                                        </div>
                                        <div>
                                            <span className={`text-sm font-bold block font-['Syne',sans-serif] ${selectedDept === 'Emission Reporting Cell' ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>Reporting Cell</span>
                                            <span className="text-xs text-slate-500">Data Management</span>
                                        </div>
                                        <div className={`absolute top-3 right-3 text-blue-600 transition-all ${selectedDept === 'Emission Reporting Cell' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                                            <span className="material-symbols-outlined text-xl">check_circle</span>
                                        </div>
                                    </label>
                                    <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedDept === 'PAT Scheme Bureau' ? 'border-blue-600 bg-blue-50 hover:shadow-md' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:border-blue-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm group'}`}>
                                        <input {...register('department')} value="PAT Scheme Bureau" className="hidden peer" type="radio" />
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 shadow-sm transition-colors ${selectedDept === 'PAT Scheme Bureau' ? 'bg-white dark:bg-slate-900 text-blue-600 border border-blue-100' : 'bg-white dark:bg-slate-700 text-slate-400 group-hover:text-blue-600'}`}>
                                            <span className="material-symbols-outlined">business_center</span>
                                        </div>
                                        <div>
                                            <span className={`text-sm font-bold block font-['Syne',sans-serif] ${selectedDept === 'PAT Scheme Bureau' ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>PAT Bureau</span>
                                            <span className="text-xs text-slate-500">Scheme Operations</span>
                                        </div>
                                        <div className={`absolute top-3 right-3 text-blue-600 transition-all ${selectedDept === 'PAT Scheme Bureau' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                                            <span className="material-symbols-outlined text-xl">check_circle</span>
                                        </div>
                                    </label>
                                </div>
                                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                        State/UT Jurisdiction
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <select {...register('jurisdiction')} className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none text-slate-700 dark:text-slate-200">
                                            <option value="" disabled>Select Jurisdiction</option>
                                            <option value="National (Delhi NCR)">National (Delhi NCR)</option>
                                            <option value="Maharashtra">Maharashtra</option>
                                            <option value="Karnataka">Karnataka</option>
                                            <option value="Gujarat">Gujarat</option>
                                            <option value="Tamil Nadu">Tamil Nadu</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-600 transition-colors pointer-events-none">map</span>
                                    </div>
                                    {errors.jurisdiction && <p className="text-red-500 text-xs mt-1">{errors.jurisdiction.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                                            Authorization Code
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="group/tooltip relative">
                                            <span className="material-symbols-outlined text-slate-400 text-sm cursor-help hover:text-blue-600 transition-colors">help</span>
                                            <div className="absolute bottom-full right-0 mb-2 w-56 p-3 bg-slate-800 text-white text-[11px] rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10 leading-relaxed font-medium">
                                                Enter the unique 12-digit code provided by your department administrator for secure linking.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input {...register('authorizationCode')} className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3.5 px-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono tracking-wide placeholder-slate-400" placeholder="XXXX-XXXX-XXXX" type="text" />
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">vpn_key</span>
                                    </div>
                                    {errors.authorizationCode && <p className="text-red-500 text-xs mt-1">{errors.authorizationCode.message}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Office Address</label>
                                    <input {...register('officeAddress')} className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-slate-400" placeholder="Floor, Building, Area" type="text" />
                                    {errors.officeAddress && <p className="text-red-500 text-xs mt-1">{errors.officeAddress.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Official Website</label>
                                    <input {...register('websiteUrl')} className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-sm py-3.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-slate-400" placeholder="https://gov.in/..." type="url" />
                                    {errors.websiteUrl && <p className="text-red-500 text-xs mt-1">{errors.websiteUrl.message}</p>}
                                </div>
                            </div>
                            <div className="flex gap-4 p-5 rounded-xl bg-blue-50 border border-blue-100 mt-6">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <span className="material-symbols-outlined text-[20px]">info</span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium pt-1">
                                    Account activation is subject to manual verification. Once you complete the officer profile in the next step, a senior administrator will review your credentials within 24-48 business hours.
                                </p>
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold font-['Syne',sans-serif] rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-3 group text-base tracking-wide">
                                    Continue to Officer Account
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <p className="text-center text-xs text-slate-400 font-medium">
                    Already registered? <Link className="text-blue-600 font-bold hover:underline transition-all" to="/login">Sign In to Dashboard</Link>
                </p>
            </div>
        </div>
    );
}
