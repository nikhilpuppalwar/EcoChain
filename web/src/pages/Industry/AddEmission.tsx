import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

type EmissionData = {
    source: string;
    amount: string;
    date: string;
    description: string;
    location: string;
    skipped?: boolean;
};

type WizardData = {
    scope1: EmissionData | null;
    scope2: EmissionData | null;
    scope3: EmissionData | null;
};

const STEPS = [
    { id: 1, title: 'Scope 1', subtitle: 'Direct Emissions', factor: 1.2 },
    { id: 2, title: 'Scope 2', subtitle: 'Indirect (Energy)', factor: 0.8 },
    { id: 3, title: 'Scope 3', subtitle: 'Value Chain', factor: 0.5 },
];

export default function AddEmission() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [currentStep, setCurrentStep] = useState(1);
    const [wizardData, setWizardData] = useState<WizardData>({
        scope1: null,
        scope2: null,
        scope3: null,
    });

    const [currentFormData, setCurrentFormData] = useState<EmissionData>({
        source: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        location: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiEstimate, setAiEstimate] = useState<number | null>(null);
    const [isEstimating, setIsEstimating] = useState(false);

    const activeStepInfo = STEPS.find(s => s.id === currentStep) || STEPS[0];

    const handleGenerateAiEstimate = async () => {
        if (!currentFormData.source || !currentFormData.amount) {
            toast.error("Please provide a source and an initial amount/quantity to estimate.");
            return;
        }

        setIsEstimating(true);
        // Simulate AI call
        setTimeout(() => {
            const baseAmount = parseFloat(currentFormData.amount) || 100;
            const factor = activeStepInfo.factor;
            setAiEstimate(Math.round(baseAmount * factor * 1.05));
            setIsEstimating(false);
            toast.success("AI estimate generated based on industry averages.");
        }, 1500);
    };

    const applyAiEstimate = () => {
        if (aiEstimate) {
            setCurrentFormData(prev => ({ ...prev, amount: aiEstimate.toString() }));
            setAiEstimate(null);
            toast.success("AI estimate applied to form.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentFormData(prev => ({ ...prev, [name]: value }));
    };

    const saveCurrentStepData = (skipped = false) => {
        const scopeKey = `scope${currentStep}` as keyof WizardData;
        setWizardData(prev => ({
            ...prev,
            [scopeKey]: skipped ? { skipped: true } as EmissionData : { ...currentFormData }
        }));
    };

    const handleNext = () => {
        // Validate
        if (!currentFormData.source || !currentFormData.amount || !currentFormData.date) {
            toast.error("Please fill in all required fields.");
            return;
        }

        saveCurrentStepData(false);

        if (currentStep < 3) {
            setCurrentStep(prev => prev + 1);
            resetCurrentFormData();
            setAiEstimate(null);
        }
    };

    const handleSkip = () => {
        saveCurrentStepData(true);
        if (currentStep < 3) {
            setCurrentStep(prev => prev + 1);
            resetCurrentFormData();
            setAiEstimate(null);
            toast("Step skipped.", { icon: '⏭️' });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            const prevStep = currentStep - 1;
            setCurrentStep(prevStep);
            const scopeKey = `scope${prevStep}` as keyof WizardData;
            
            // Re-populate form data from previously saved state if it exists and wasn't skipped
            const prevData = wizardData[scopeKey];
            if (prevData && !prevData.skipped) {
                setCurrentFormData(prevData);
            } else {
                resetCurrentFormData();
            }
            setAiEstimate(null);
        }
    };

    const resetCurrentFormData = () => {
        setCurrentFormData({
            source: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            location: '',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Save the final step data
        saveCurrentStepData(false);

        setIsSubmitting(true);

        try {
            // Mock API Submission - sending the full wizardData object
            console.log("Submitting payload:", wizardData);
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success("Emission records successfully logged and pending verification.");
            navigate('/industry/dashboard');
        } catch (error) {
            toast.error("Failed to log emissions.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/industry/dashboard')}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">Log New Emission</h1>
                    <p className="text-sm text-slate-500">Record your Scope 1, 2, and 3 emissions for verification.</p>
                </div>
            </div>

            {/* Stepper UI */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <div className="flex items-center justify-between relative">
                    {/* Connecting line */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full"></div>
                    
                    {STEPS.map((step, idx) => {
                        const isCompleted = currentStep > step.id || (wizardData[`scope${step.id}` as keyof WizardData] !== null);
                        const isActive = currentStep === step.id;
                        return (
                            <div key={step.id} className="flex flex-col items-center relative z-10 bg-white px-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-syne text-sm transition-colors duration-300 border-2 
                                    ${isActive ? 'border-[#1A7A4A] bg-[#1A7A4A] text-white shadow-md shadow-[#1A7A4A]/20' 
                                      : isCompleted ? 'border-[#1A7A4A] bg-[#eaf4ef] text-[#1A7A4A]' 
                                        : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                                    {isCompleted && !isActive ? <span className="material-symbols-outlined text-[18px]">check</span> : step.id}
                                </div>
                                <div className="text-center mt-3">
                                    <p className={`font-bold text-sm ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{step.title}</p>
                                    <p className="text-xs text-slate-400 hidden sm:block">{step.subtitle}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Container */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <div className="mb-6 pb-6 border-b border-slate-100 flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#1A7A4A] text-3xl">target</span>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{activeStepInfo.title}: {activeStepInfo.subtitle}</h2>
                                <p className="text-sm text-slate-500">
                                    {currentStep === 1 && "Direct emissions from owned or controlled sources."}
                                    {currentStep === 2 && "Indirect emissions from the generation of purchased energy."}
                                    {currentStep === 3 && "All other indirect emissions that occur in a company's value chain."}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Date of Record*</label>
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        value={currentFormData.date}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1A7A4A] focus:ring-1 focus:ring-[#1A7A4A]"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-slate-700">Emission Source / Activity*</label>
                                    <input
                                        type="text"
                                        name="source"
                                        required
                                        placeholder={`e.g., ${currentStep === 1 ? 'Diesel Generators - Plant A' : currentStep === 2 ? 'Purchased Electricity - Office' : 'Business Travel - Flight to London'}`}
                                        value={currentFormData.source}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1A7A4A] focus:ring-1 focus:ring-[#1A7A4A]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
                                        <span>Amount (ton)*</span>
                                        <span className="text-xs font-normal text-slate-500">Metric Tons</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        step="0.01"
                                        required
                                        placeholder="0.00"
                                        value={currentFormData.amount}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1A7A4A] focus:ring-1 focus:ring-[#1A7A4A]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Location / Facility</label>
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="e.g., Mumbai Manufacturing Unit"
                                        value={currentFormData.location}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1A7A4A] focus:ring-1 focus:ring-[#1A7A4A]"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-slate-700">Supporting Evidence / Description</label>
                                    <textarea
                                        name="description"
                                        rows={3}
                                        placeholder="Provide links to utility bills, calculation methodologies, or additional context."
                                        value={currentFormData.description}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1A7A4A] focus:ring-1 focus:ring-[#1A7A4A]"
                                    ></textarea>
                                </div>

                                <div className="space-y-2 md:col-span-2 pt-2 border-t border-slate-100">
                                    <label className="text-sm font-bold text-slate-700 block mb-2">Upload Documentation (Optional)</label>
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">cloud_upload</span>
                                        <p className="text-sm font-bold text-slate-700">Click to upload or drag and drop</p>
                                        <p className="text-xs text-slate-500 mt-1">PDF, XSLX, or JPG (max. 10MB)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                                <div className="flex gap-2">
                                    {currentStep > 1 && (
                                        <button
                                            type="button"
                                            onClick={handleBack}
                                            className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                            Back
                                        </button>
                                    )}
                                    {currentStep === 1 && (
                                        <button
                                            type="button"
                                            onClick={() => navigate('/industry/dashboard')}
                                            className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                                
                                <div className="flex gap-3">
                                    {currentStep > 1 && (
                                         <button
                                         type="button"
                                         onClick={handleSkip}
                                         className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                                     >
                                         Skip / No Data
                                     </button>
                                    )}

                                    {currentStep < 3 ? (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="px-6 py-3 bg-[#1A7A4A] text-white font-bold rounded-lg shadow-md shadow-[#1A7A4A]/20 hover:bg-[#13613a] active:scale-[0.98] transition-all flex items-center gap-2"
                                        >
                                            Next: Add Scope {currentStep + 1}
                                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`px-8 py-3 bg-[#1A7A4A] text-white font-bold rounded-lg shadow-md shadow-[#1A7A4A]/20 transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#13613a] active:scale-[0.98]'}`}
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                                            {!isSubmitting && <span className="material-symbols-outlined text-[18px]">verified</span>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Summary Block */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#1A7A4A]">list_alt</span>
                                Emission Summary
                            </h3>
                            <span className="text-xs font-bold text-[#1A7A4A] bg-[#1A7A4A]/10 px-2 py-1 rounded-md uppercase tracking-wider">
                                Draft
                            </span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {[1, 2, 3].map((step) => {
                                const data = wizardData[`scope${step}` as keyof WizardData];
                                const isCurrent = currentStep === step;
                                
                                return (
                                    <div key={step} className={`p-4 px-6 flex items-center justify-between ${isCurrent ? 'bg-blue-50/50' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0
                                                ${data ? 'bg-[#1A7A4A] text-white' : isCurrent ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                                                {data && !data.skipped ? <span className="material-symbols-outlined text-[14px]">check</span> : step}
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm ${data ? 'text-slate-900' : isCurrent ? 'text-blue-900' : 'text-slate-500'}`}>
                                                    Scope {step} Emissions
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {data ? (data.skipped ? 'Skipped - No Data' : data.source) : isCurrent ? 'Currently Editing...' : 'Pending'}
                                                </p>
                                            </div>
                                        </div>
                                        {data && !data.skipped && (
                                             <div className="text-right">
                                                <p className="font-syne font-black text-slate-800">{data.amount}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tons</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* AI Assistant Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] rounded-xl p-6 border border-blue-100 shadow-sm relative overflow-hidden transition-all duration-300">
                        <div className="absolute -right-4 -top-4 text-blue-200/50">
                            <span className="material-symbols-outlined text-[120px]">psychology</span>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-blue-700 mb-4">
                                <span className="material-symbols-outlined">auto_awesome</span>
                                <h3 className="font-bold font-syne text-lg">AI Estimator</h3>
                            </div>

                            <p className="text-sm text-blue-800/80 mb-6 leading-relaxed">
                                Not sure about the exact conversion for <strong>Scope {currentStep}</strong>? Use our AI model trained on GHG Protocol standards to estimate your emissions based on activity data.
                            </p>

                            <button
                                type="button"
                                onClick={handleGenerateAiEstimate}
                                disabled={isEstimating}
                                className={`w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 ${isEstimating ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 active:scale-[0.98]'}`}
                            >
                                {isEstimating ? 'Analyzing data...' : 'Generate Estimate'}
                            </button>

                            {aiEstimate !== null && (
                                <div className="mt-6 pt-6 border-t border-blue-200/50 animate-in fade-in slide-in-from-bottom-2">
                                    <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">Calculated Result (Scope {currentStep})</p>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-3xl font-black font-syne text-blue-900">{aiEstimate.toLocaleString()}</span>
                                        <span className="font-bold text-blue-700">tCO₂e</span>
                                    </div>
                                    <button
                                        onClick={applyAiEstimate}
                                        className="w-full py-2 bg-white text-blue-700 border border-blue-200 font-bold rounded-lg hover:bg-blue-50 transition-colors text-sm"
                                    >
                                        Apply to Form
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="font-bold font-syne text-slate-800 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#1A7A4A]">info</span>
                            Verification Process
                        </h3>
                        <ul className="space-y-4 text-sm text-slate-600">
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs shrink-0 text-slate-500">1</div>
                                <p>Submit your combined emission record across all applicable scopes.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs shrink-0 text-slate-500">2</div>
                                <p>Government auditors will review the submission within 3-5 business days.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs shrink-0 text-slate-500">3</div>
                                <p>Once verified, the record is permanently logged to the associated smart contract.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
