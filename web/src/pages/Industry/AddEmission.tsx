import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function AddEmission() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [formData, setFormData] = useState({
        scope: '1',
        source: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        location: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiEstimate, setAiEstimate] = useState<number | null>(null);
    const [isEstimating, setIsEstimating] = useState(false);

    const handleGenerateAiEstimate = async () => {
        if (!formData.source || !formData.amount) {
            toast.error("Please provide a source and an initial amount/quantity to estimate.");
            return;
        }

        setIsEstimating(true);
        // Simulate AI call
        setTimeout(() => {
            const baseAmount = parseFloat(formData.amount) || 100;
            const factor = formData.scope === '1' ? 1.2 : formData.scope === '2' ? 0.8 : 0.5;
            setAiEstimate(Math.round(baseAmount * factor * 1.05));
            setIsEstimating(false);
            toast.success("AI estimate generated based on industry averages.");
        }, 1500);
    };

    const applyAiEstimate = () => {
        if (aiEstimate) {
            setFormData(prev => ({ ...prev, amount: aiEstimate.toString() }));
            setAiEstimate(null);
            toast.success("AI estimate applied to form.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Mock API Submission
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Emission record successfully logged and pending verification.");
            navigate('/industry/dashboard');
        } catch (error) {
            toast.error("Failed to log emission.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/industry/dashboard')}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-2xl font-bold font-syne text-slate-800">Log New Emission</h1>
                    <p className="text-sm text-slate-500">Record your Scope 1, 2, or 3 emissions for verification.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Container */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Emission Scope*</label>
                                <select
                                    name="scope"
                                    value={formData.scope}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1A7A4A] focus:ring-1 focus:ring-[#1A7A4A]"
                                >
                                    <option value="1">Scope 1 (Direct)</option>
                                    <option value="2">Scope 2 (Indirect - Energy)</option>
                                    <option value="3">Scope 3 (Supply Chain)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Date of Record*</label>
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    value={formData.date}
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
                                    placeholder="e.g., Diesel Generators - Plant A, Corporate Flight to London"
                                    value={formData.source}
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
                                    value={formData.amount}
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
                                    value={formData.location}
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
                                    value={formData.description}
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
                            <button
                                type="button"
                                onClick={() => navigate('/industry/dashboard')}
                                className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-8 py-3 bg-[#1A7A4A] text-white font-bold rounded-lg shadow-md shadow-[#1A7A4A]/20 transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#13613a] active:scale-[0.98]'}`}
                            >
                                {isSubmitting ? 'Logging...' : 'Submit for Verification'}
                                {!isSubmitting && <span className="material-symbols-outlined text-[18px]">verified</span>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* AI Assistant Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] rounded-xl p-6 border border-blue-100 shadow-sm relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-blue-200/50">
                            <span className="material-symbols-outlined text-[120px]">psychology</span>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-blue-700 mb-4">
                                <span className="material-symbols-outlined">auto_awesome</span>
                                <h3 className="font-bold font-syne text-lg">AI Estimator</h3>
                            </div>

                            <p className="text-sm text-blue-800/80 mb-6 leading-relaxed">
                                Not sure about the exact conversion? Use our AI model trained on GHG Protocol standards to estimate your emissions based on activity data.
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
                                    <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">Calculated Result</p>
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
                                <p>Submit your emission record with supporting documentation.</p>
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
