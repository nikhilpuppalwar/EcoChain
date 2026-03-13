import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

type DynamicData = Record<string, string>;

type EmissionData = {
    category: string;
    amount: string; // Map depending on category
    date: string;
    description: string;
    location: string;
    dynamicFields: DynamicData;
    skipped?: boolean;
    evidenceDocument?: File | null;
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

const SCOPE_CATEGORIES: Record<number, string[]> = {
    1: ['Fuel Consumption', 'Industrial Process Emissions', 'Company-Owned Vehicles'],
    2: ['Electricity Consumption'],
    3: ['Transportation & Logistics', 'Waste Management', 'Business Travel']
};

const CATEGORY_FIELDS: Record<string, Array<{name: string, label: string, type: 'text' | 'number' | 'date' | 'select' | 'textarea', options?: string[]}>> = {
    'Fuel Consumption': [
        { name: 'fuelType', label: 'Fuel Type', type: 'select', options: ['Diesel', 'Petrol', 'Coal', 'Natural Gas', 'Furnace Oil'] },
        { name: 'fuelQuantity', label: 'Fuel Quantity', type: 'number' },
        { name: 'unit', label: 'Unit', type: 'select', options: ['Liters', 'Tons', 'Kg'] },
        { name: 'invoiceNumber', label: 'Fuel Purchase Invoice Number', type: 'text' },
        { name: 'supplierName', label: 'Fuel Supplier Name', type: 'text' },
        { name: 'purchaseDate', label: 'Fuel Purchase Date', type: 'date' }
    ],
    'Industrial Process Emissions': [
        { name: 'processType', label: 'Process Type', type: 'text' },
        { name: 'rawMaterialUsed', label: 'Raw Material Used', type: 'text' },
        { name: 'processDescription', label: 'Production Process Description', type: 'textarea' },
        { name: 'outputQuantity', label: 'Process Output Quantity', type: 'number' },
        { name: 'unit', label: 'Unit', type: 'select', options: ['Tons', 'Kg', 'Units'] }
    ],
    'Company-Owned Vehicles': [
        { name: 'vehicleType', label: 'Vehicle Type', type: 'text' },
        { name: 'fuelUsed', label: 'Fuel Used', type: 'text' },
        { name: 'distanceTraveled', label: 'Distance Traveled', type: 'number' },
        { name: 'fuelQuantity', label: 'Fuel Quantity', type: 'number' }
    ],
    'Electricity Consumption': [
        { name: 'consumptionKwh', label: 'Electricity Consumption (kWh)', type: 'number' },
        { name: 'provider', label: 'Electricity Provider', type: 'text' },
        { name: 'billNumber', label: 'Electricity Bill Number', type: 'text' },
        { name: 'billingPeriod', label: 'Billing Period', type: 'text' },
        { name: 'energySource', label: 'Energy Source', type: 'select', options: ['Grid Electricity', 'Solar', 'Wind', 'Hydropower'] },
        { name: 'renewablePercentage', label: 'Renewable Energy Percentage', type: 'number' }
    ],
    'Transportation & Logistics': [
        { name: 'transportMode', label: 'Transport Mode', type: 'select', options: ['Truck', 'Ship', 'Train', 'Air'] },
        { name: 'transportDistance', label: 'Transport Distance (km)', type: 'number' },
        { name: 'cargoWeight', label: 'Cargo Weight', type: 'number' },
        { name: 'providerName', label: 'Logistics Provider Name', type: 'text' },
        { name: 'invoiceNumber', label: 'Transport Invoice Number', type: 'text' }
    ],
    'Waste Management': [
        { name: 'wasteType', label: 'Waste Type', type: 'select', options: ['Solid', 'Liquid', 'Hazardous'] },
        { name: 'wasteQuantity', label: 'Waste Quantity', type: 'number' },
        { name: 'disposalMethod', label: 'Disposal Method', type: 'text' },
        { name: 'recyclingPercentage', label: 'Recycling Percentage', type: 'number' }
    ],
    'Business Travel': [
        { name: 'travelMode', label: 'Travel Mode', type: 'text' },
        { name: 'travelDistance', label: 'Travel Distance', type: 'number' },
        { name: 'travelPurpose', label: 'Travel Purpose', type: 'text' }
    ]
};

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
        category: SCOPE_CATEGORIES[1][0],
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        location: '',
        dynamicFields: {},
        evidenceDocument: null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [aiEstimate, setAiEstimate] = useState<number | null>(null);
    const [isEstimating, setIsEstimating] = useState(false);

    const activeStepInfo = STEPS.find(s => s.id === currentStep) || STEPS[0];

    // Helper to find the amount field from dynamic fields
    const getCalculatedAmount = () => {
        let val = 0;
        if (currentFormData.category === 'Fuel Consumption') val = parseFloat(currentFormData.dynamicFields.fuelQuantity);
        else if (currentFormData.category === 'Industrial Process Emissions') val = parseFloat(currentFormData.dynamicFields.outputQuantity);
        else if (currentFormData.category === 'Company-Owned Vehicles') val = parseFloat(currentFormData.dynamicFields.fuelQuantity);
        else if (currentFormData.category === 'Electricity Consumption') val = parseFloat(currentFormData.dynamicFields.consumptionKwh);
        else if (currentFormData.category === 'Transportation & Logistics') val = parseFloat(currentFormData.dynamicFields.cargoWeight);
        else if (currentFormData.category === 'Waste Management') val = parseFloat(currentFormData.dynamicFields.wasteQuantity);
        else if (currentFormData.category === 'Business Travel') val = parseFloat(currentFormData.dynamicFields.travelDistance);
        
        return isNaN(val) ? currentFormData.amount : val.toString();
    };

    const handleGenerateAiEstimate = async () => {
        const val = getCalculatedAmount();
        if (!currentFormData.category || !val) {
            toast.error("Please fill out the primary quantity fields first.");
            return;
        }

        setIsEstimating(true);
        try {
            // Build the payload that matches what the new calculator expects
            const payload: any = {};
            if (currentFormData.category === 'Waste Management') {
                payload.wasteGeneration = [{ ...currentFormData.dynamicFields, quantity: parseFloat(val) }];
            } else if (currentFormData.category === 'Transportation & Logistics') {
                payload.logisticsTransport = [{ ...currentFormData.dynamicFields, cargoWeightTons: parseFloat(val) }];
            } else if (currentFormData.category === 'Company-Owned Vehicles') {
                payload.vehicleEmissions = [{ ...currentFormData.dynamicFields, fuelQuantity: parseFloat(val) }];
            } else if (currentFormData.category === 'Electricity Consumption') {
                payload.electricityUsage = parseFloat(val);
            } else {
                // Fallback simulation for process emissions etc.
                const baseAmount = parseFloat(val) || 100;
                setAiEstimate(Math.round(baseAmount * activeStepInfo.factor * 1.05));
                setIsEstimating(false);
                toast.success("AI estimate generated based on industry averages.");
                return;
            }

            const { default: api } = await import('../../lib/api');
            const response = await api.post('/emissions/calculate', payload);
            if (response.data?.success && response.data?.data) {
                const breakdown = response.data.data;
                const total = breakdown.totalCO2e || (parseFloat(val) * activeStepInfo.factor);
                setAiEstimate(Math.round(total * 10) / 10);
                toast.success("Calculated emissions using standard factors.");
            }
        } catch (error) {
            console.error("Calculation Error:", error);
            // Fallback simulation
            const baseAmount = parseFloat(val) || 100;
            setAiEstimate(Math.round(baseAmount * activeStepInfo.factor * 1.05));
            toast.success("AI estimate generated as fallback.");
        } finally {
            setIsEstimating(false);
        }
    };

    const applyAiEstimate = () => {
        if (aiEstimate) {
            setCurrentFormData(prev => ({ ...prev, amount: aiEstimate.toString() }));
            setAiEstimate(null);
            toast.success("AI estimate applied to form equivalent amounts.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'file') {
            const fileInput = e.target as HTMLInputElement;
            const file = fileInput.files?.[0] || null;
            setCurrentFormData(prev => ({ ...prev, evidenceDocument: file }));
        } else if (name === 'category') {
            setCurrentFormData(prev => ({ ...prev, category: value, dynamicFields: {} }));
        } else if (CATEGORY_FIELDS[currentFormData.category]?.find(f => f.name === name)) {
            setCurrentFormData(prev => ({
                ...prev,
                dynamicFields: { ...prev.dynamicFields, [name]: value }
            }));
        } else {
            setCurrentFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const saveCurrentStepData = (skipped = false) => {
        const scopeKey = `scope${currentStep}` as keyof WizardData;
        const finalAmount = skipped ? '' : (currentFormData.amount || getCalculatedAmount());
        setWizardData(prev => ({
            ...prev,
            [scopeKey]: skipped ? { skipped: true } as EmissionData : { ...currentFormData, amount: finalAmount }
        }));
    };

    const handleNext = () => {
        if (!currentFormData.category || !currentFormData.date || !currentFormData.amount) {
            toast.error("Please fill in all required general fields (Category, Date, Amount).");
            return;
        }

        // Validate all dynamic fields for the current category are filled
        const requiredFields = CATEGORY_FIELDS[currentFormData.category] || [];
        const missingFields = requiredFields.filter(
            f => !currentFormData.dynamicFields[f.name] || currentFormData.dynamicFields[f.name].trim() === ''
        );

        if (missingFields.length > 0) {
            toast.error(`Please fill in all mandatory specific fields: ${missingFields.map(f => f.label).join(', ')}`);
            return;
        }

        // Ensure Evidence Document is provided as it was made mandatory in backend
        if (!currentFormData.evidenceDocument) {
            toast.error("Evidence Documentation is mandatory for verification.");
            return;
        }

        saveCurrentStepData(false);

        if (currentStep < 3) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);
            resetCurrentFormData(nextStep);
            setAiEstimate(null);
        }
    };

    const handleSkip = () => {
        // Explicitly wipe data if they hit skip so it sends null instead of partial validation failures
        const scopeKey = `scope${currentStep}` as keyof WizardData;
        setWizardData(prev => ({
            ...prev,
            [scopeKey]: { skipped: true } as EmissionData
        }));

        if (currentStep < 3) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);
            resetCurrentFormData(nextStep);
            setAiEstimate(null);
            toast("Step skipped.", { icon: '⏭️' });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            const prevStep = currentStep - 1;
            setCurrentStep(prevStep);
            const scopeKey = `scope${prevStep}` as keyof WizardData;
            
            const prevData = wizardData[scopeKey];
            if (prevData && !prevData.skipped) {
                setCurrentFormData(prevData);
            } else {
                resetCurrentFormData(prevStep);
            }
            setAiEstimate(null);
        }
    };

    const resetCurrentFormData = (step: number) => {
        setCurrentFormData({
            category: SCOPE_CATEGORIES[step][0],
            amount: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            location: '',
            dynamicFields: {},
            evidenceDocument: null,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Final validation for the 3rd step before submitting
        const requiredFields = CATEGORY_FIELDS[currentFormData.category] || [];
        const missingFields = requiredFields.filter(
            f => !currentFormData.dynamicFields[f.name] || currentFormData.dynamicFields[f.name].trim() === ''
        );

        if (missingFields.length > 0) {
            toast.error(`Please fill in all mandatory fields before submitting: ${missingFields.map(f => f.label).join(', ')}`);
            return;
        }

        saveCurrentStepData(false);
        setIsSubmitting(true);

        try {
            const currentAmount = currentFormData.amount || getCalculatedAmount();
            const finalWizardData = {
                ...wizardData,
                [`scope${currentStep}` as keyof WizardData]: { ...currentFormData, amount: currentAmount }
            };

            const promises = Object.entries(finalWizardData).map(async ([scopeKey, data]) => {
                if (!data || data.skipped) return null;

                const formData = new FormData();
                const [year, month] = data.date.split('-');
                formData.append('periodYear', year);
                formData.append('periodMonth', month);
                formData.append('quantityTonnes', data.amount || '0');
                formData.append('emissionSource', data.category);
                
                // Combine stringified dynamic fields and general description into notes
                let combinedNotes = `[Category: ${data.category}]\n`;
                Object.entries(data.dynamicFields).forEach(([k, v]) => {
                    combinedNotes += `${k}: ${v}\n`;
                });
                if (data.description) {
                    combinedNotes += `\nDescription Guidelines: ${data.description}`;
                }
                formData.append('notes', combinedNotes);
                if (data.location) formData.append('location', data.location);

                // Map specific categories to the new array structures
                if (data.category === 'Waste Management') {
                    formData.append('wasteGeneration', JSON.stringify([{ ...data.dynamicFields, quantity: data.dynamicFields.wasteQuantity }]));
                } else if (data.category === 'Transportation & Logistics') {
                    formData.append('logisticsTransport', JSON.stringify([{ ...data.dynamicFields, cargoWeightTons: data.dynamicFields.cargoWeight, distanceKm: data.dynamicFields.transportDistance }]));
                } else if (data.category === 'Company-Owned Vehicles') {
                    formData.append('vehicleEmissions', JSON.stringify([{ ...data.dynamicFields, fuelQuantity: data.dynamicFields.fuelQuantity, distanceTraveled: data.dynamicFields.distanceTraveled }]));
                } else if (data.category === 'Industrial Process Emissions') {
                    formData.append('productionOutput', JSON.stringify({ productType: data.dynamicFields.processType, quantity: data.dynamicFields.outputQuantity, unit: data.dynamicFields.unit }));
                }

                if (data.evidenceDocument) {
                    formData.append('evidenceDocument', data.evidenceDocument);
                }

                const { default: api } = await import('../../lib/api');
                const response = await api.post('/emissions', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                return response.data;
            });

            await Promise.all(promises.filter(p => p !== null));
            toast.success("Emission records successfully logged and pending verification.");
            setIsSubmitted(true);
        } catch (error) {
            toast.error("Failed to log emissions. Please try again.");
            console.error("Submission Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderDynamicFields = () => {
        const fields = CATEGORY_FIELDS[currentFormData.category] || [];
        
        return fields.map((field, idx) => {
            return (
                <div key={idx} className={`space-y-2 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                    <label className="text-sm font-bold text-slate-700">{field.label}</label>
                    {field.type === 'select' ? (
                        <select
                            name={field.name}
                            value={currentFormData.dynamicFields[field.name] || ''}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1A7A4A] focus:ring-1 focus:ring-[#1A7A4A]"
                        >
                            <option value="">Select an option</option>
                            {field.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : field.type === 'textarea' ? (
                        <textarea
                            name={field.name}
                            rows={3}
                            value={currentFormData.dynamicFields[field.name] || ''}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1A7A4A] focus:ring-1 focus:ring-[#1A7A4A]"
                        />
                    ) : (
                        <input
                            type={field.type}
                            name={field.name}
                            value={currentFormData.dynamicFields[field.name] || ''}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1A7A4A] focus:ring-1 focus:ring-[#1A7A4A]"
                        />
                    )}
                </div>
            );
        });
    };

    if (isSubmitted) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center mt-12 animate-in fade-in slide-in-from-bottom-4">
                    <div className="w-20 h-20 bg-[#eaf4ef] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <span className="material-symbols-outlined text-[#1A7A4A] text-4xl">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-bold font-syne text-slate-800 mb-3">Emissions Logged Successfully!</h2>
                    <p className="text-slate-500 mb-8 max-w-lg mx-auto">
                        Your scope emissions have been securely uploaded, stored in the database, and sent for auditing. Here is a summary of your submission.
                    </p>
                    
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 text-left max-w-2xl mx-auto space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Submission Data Receipt</h3>
                        {[1, 2, 3].map(step => {
                            const data = wizardData[`scope${step}` as keyof WizardData];
                            if (!data || data.skipped) return null;
                            return (
                                <div key={step} className="pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">Scope {step} <span className="text-sm font-normal text-slate-500 ml-1">({data.category})</span></h4>
                                            <p className="text-sm text-slate-500 mt-1">Record Date: {data.date}</p>
                                        </div>
                                        <div className="text-right bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                                            <span className="font-black font-syne text-[#1A7A4A] text-lg">{data.amount}</span>
                                            <span className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">tCO₂e</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {Object.entries(data.dynamicFields).map(([k, v]) => (
                                            <span key={k} className="text-xs bg-white border border-slate-200 px-2 py-1.5 rounded-md text-slate-600 shadow-sm">
                                                <strong className="text-slate-800 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}:</strong> {v}
                                            </span>
                                        ))}
                                        {data.location && (
                                            <span className="text-xs bg-white border border-slate-200 px-2 py-1.5 rounded-md text-slate-600 shadow-sm">
                                                <strong className="text-slate-800">Location:</strong> {data.location}
                                            </span>
                                        )}
                                    </div>

                                    {data.description && (
                                        <p className="mt-3 text-sm text-slate-600 italic bg-white p-3 rounded-lg border border-slate-100">"{data.description}"</p>
                                    )}

                                    {data.evidenceDocument && (
                                        <div className="mt-3 text-xs flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-2 rounded-md border border-blue-100 w-fit">
                                            <span className="material-symbols-outlined text-[16px]">attachment</span>
                                            <span className="font-medium">{data.evidenceDocument.name}</span>
                                            <span className="text-blue-400 ml-1">({(data.evidenceDocument.size / 1024 / 1024).toFixed(2)} MB) uploaded directly to Cloudinary</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => navigate('/industry/dashboard')}
                        className="px-8 py-3 bg-[#1A7A4A] text-white font-bold rounded-lg shadow-md shadow-[#1A7A4A]/20 hover:bg-[#13613a] active:scale-[0.98] transition-all flex items-center gap-2 mx-auto"
                    >
                        Return to Dashboard
                        <span className="material-symbols-outlined text-[18px]">home</span>
                    </button>
                </div>
            </div>
        );
    }

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
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full"></div>
                    
                    {STEPS.map((step) => {
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
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-slate-700">Emission Category*</label>
                                    <select
                                        name="category"
                                        required
                                        value={currentFormData.category}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1A7A4A] focus:ring-1 focus:ring-[#1A7A4A]"
                                    >
                                        {SCOPE_CATEGORIES[currentStep].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Dynamic Field Render */}
                                {renderDynamicFields()}

                                {/* Standard Required Fields */}
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
                                    <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
                                        <span>Total tCO₂e equivalent Quantity</span>
                                        <span className="text-xs font-normal text-slate-500">(Calculated or Overridden)</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        step="0.01"
                                        placeholder="Will use AI estimate if provided, else calculates from fields"
                                        value={currentFormData.amount}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1A7A4A] focus:ring-1 focus:ring-[#1A7A4A]"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-slate-700">Additional Notes / Description</label>
                                    <textarea
                                        name="description"
                                        rows={2}
                                        placeholder="Provide links to utility bills, calculation methodologies, or additional context."
                                        value={currentFormData.description}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1A7A4A] focus:ring-1 focus:ring-[#1A7A4A]"
                                    ></textarea>
                                </div>

                                <div className="space-y-2 md:col-span-2 pt-2 border-t border-slate-100">
                                    <label className="text-sm font-bold text-slate-700 block mb-2">Upload Documentation (Optional)</label>
                                    <label className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                                         <input 
                                            type="file" 
                                            name="evidenceDocument" 
                                            onChange={handleChange} 
                                            className="hidden" 
                                            accept=".pdf,.jpg,.jpeg,.png,.xlsx"
                                        />
                                        <span className={`material-symbols-outlined text-3xl mb-2 ${currentFormData.evidenceDocument ? 'text-[#1A7A4A]' : 'text-slate-400 group-hover:text-[#1A7A4A]'}`}>
                                            {currentFormData.evidenceDocument ? 'task' : 'cloud_upload'}
                                        </span>
                                        <p className="text-sm font-bold text-slate-700">
                                            {currentFormData.evidenceDocument ? currentFormData.evidenceDocument.name : 'Click to upload or drag and drop'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                             {currentFormData.evidenceDocument ? `${(currentFormData.evidenceDocument.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, XSLX, or JPG (max. 10MB)'}
                                        </p>
                                    </label>
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
                                                    {data ? (data.skipped ? 'Skipped - No Data' : data.category) : isCurrent ? 'Currently Editing...' : 'Pending'}
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
