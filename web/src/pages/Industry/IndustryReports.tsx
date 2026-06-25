import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

// VITE_API_URL is already "http://localhost:5001/api" — use it directly
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api$/, '');

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
    company: string;
    industry: string;
    revenue: string;
    diesel: string;
    petrol: string;
    coal: string;
    electricity: string;
    transport_distance: string;
    cargo_weight: string;
    waste_generated: string;
    waste_recycled: string;
    employees: string;
    female_employees: string;
    board_members: string;
    female_directors: string;
}

const DEFAULT_FORM: FormData = {
    company: '',
    industry: '',
    revenue: '',
    diesel: '',
    petrol: '',
    coal: '',
    electricity: '',
    transport_distance: '',
    cargo_weight: '',
    waste_generated: '',
    waste_recycled: '',
    employees: '',
    female_employees: '',
    board_members: '',
    female_directors: '',
};

// ─── Animated progress steps ─────────────────────────────────────────────────
const PROGRESS_STEPS = [
    { label: 'Calculating emissions', icon: 'calculate', delay: 0 },
    { label: 'Running ESG analysis', icon: 'analytics', delay: 1800 },
    { label: 'Generating AI narratives', icon: 'psychology', delay: 5000 },
    { label: 'Building Word document', icon: 'description', delay: 25000 },
];

// ─── Past reports (static demo data) ─────────────────────────────────────────
const PAST_REPORTS = [
    { name: 'Annual ESG Report 2024', date: 'Feb 15, 2025', size: '2.4 MB', type: 'ESG' },
    { name: 'Carbon Compliance Q3 2024', date: 'Oct 10, 2024', size: '1.1 MB', type: 'Carbon' },
];

// ─── Field group config ───────────────────────────────────────────────────────
const FIELD_GROUPS = [
    {
        id: 'company',
        title: 'Company Overview',
        icon: 'domain',
        color: 'text-blue-600 bg-blue-50',
        fields: [
            { key: 'company', label: 'Company Name', placeholder: 'EcoSteel Pvt. Ltd.', type: 'text', unit: '' },
            { key: 'industry', label: 'Industry Sector', placeholder: 'Steel Manufacturing', type: 'text', unit: '' },
            { key: 'revenue', label: 'Annual Revenue', placeholder: '5000000', type: 'number', unit: 'USD' },
        ],
    },
    {
        id: 'scope1',
        title: 'Scope 1 — Direct Emissions',
        icon: 'local_fire_department',
        color: 'text-orange-600 bg-orange-50',
        fields: [
            { key: 'diesel', label: 'Diesel Consumed', placeholder: '12000', type: 'number', unit: 'litres' },
            { key: 'petrol', label: 'Petrol Consumed', placeholder: '4500', type: 'number', unit: 'litres' },
            { key: 'coal', label: 'Coal Consumed', placeholder: '800', type: 'number', unit: 'kg' },
        ],
    },
    {
        id: 'scope2',
        title: 'Scope 2 — Electricity',
        icon: 'bolt',
        color: 'text-yellow-600 bg-yellow-50',
        fields: [
            { key: 'electricity', label: 'Grid Electricity Used', placeholder: '300000', type: 'number', unit: 'kWh' },
        ],
    },
    {
        id: 'scope3',
        title: 'Scope 3 — Value Chain',
        icon: 'local_shipping',
        color: 'text-violet-600 bg-violet-50',
        fields: [
            { key: 'transport_distance', label: 'Transport Distance', placeholder: '50000', type: 'number', unit: 'km' },
            { key: 'cargo_weight', label: 'Cargo Weight', placeholder: '2000', type: 'number', unit: 'tonnes' },
        ],
    },
    {
        id: 'waste',
        title: 'Waste Management',
        icon: 'recycling',
        color: 'text-emerald-600 bg-emerald-50',
        fields: [
            { key: 'waste_generated', label: 'Total Waste Generated', placeholder: '10000', type: 'number', unit: 'kg' },
            { key: 'waste_recycled', label: 'Waste Recycled', placeholder: '7000', type: 'number', unit: 'kg' },
        ],
    },
    {
        id: 'social',
        title: 'Social & Governance',
        icon: 'diversity_3',
        color: 'text-pink-600 bg-pink-50',
        fields: [
            { key: 'employees', label: 'Total Employees', placeholder: '500', type: 'number', unit: '' },
            { key: 'female_employees', label: 'Female Employees', placeholder: '180', type: 'number', unit: '' },
            { key: 'board_members', label: 'Board Members', placeholder: '8', type: 'number', unit: '' },
            { key: 'female_directors', label: 'Female Directors', placeholder: '3', type: 'number', unit: '' },
        ],
    },
];

export default function IndustryReports() {
    const [form, setForm] = useState<FormData>(DEFAULT_FORM);
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(-1);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const linkRef = useRef<HTMLAnchorElement>(null);

    const [pastReports, setPastReports] = useState<any[]>([]);

    const fetchPastReports = async () => {
        try {
            const res = await api.get('/reports/past');
            if (res.data.success) {
                setPastReports(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch past reports:', err);
        }
    };

    useEffect(() => {
        fetchPastReports();
    }, []);

    const handleChange = (key: keyof FormData, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const isValid = () => {
        return Object.values(form).every(v => v.trim() !== '');
    };

    const runProgressAnimation = () => {
        PROGRESS_STEPS.forEach((step, idx) => {
            setTimeout(() => setActiveStep(idx), step.delay);
        });
    };

    const handleGenerate = async () => {
        if (!isValid()) {
            toast.error('Please fill in all fields before generating.');
            return;
        }

        setLoading(true);
        setDownloadUrl(null);
        setActiveStep(0);
        runProgressAnimation();

        try {
            const payload = {
                company: form.company,
                industry: form.industry,
                revenue: parseFloat(form.revenue),
                diesel: parseFloat(form.diesel),
                petrol: parseFloat(form.petrol),
                coal: parseFloat(form.coal),
                electricity: parseFloat(form.electricity),
                transport_distance: parseFloat(form.transport_distance),
                cargo_weight: parseFloat(form.cargo_weight),
                waste_generated: parseFloat(form.waste_generated),
                waste_recycled: parseFloat(form.waste_recycled),
                employees: parseInt(form.employees, 10),
                female_employees: parseInt(form.female_employees, 10),
                board_members: parseInt(form.board_members, 10),
                female_directors: parseInt(form.female_directors, 10),
            };

            // Sync endpoint — generates DOCX in Node.js, uploads to Cloudinary, returns URL
            const res = await api.post('/reports/generate', payload, { timeout: 90000 });
            const data = res.data;

            setLoading(false);
            setActiveStep(-1);

            const url = data.cloudinaryUrl || data.downloadUrl;
            if (url) {
                setDownloadUrl(url);
                toast.success('ESG Report generated! Ready to download.');
                fetchPastReports();
            } else {
                throw new Error('No download URL returned from server');
            }

        } catch (err: any) {
            console.error('ESG Report generation error:', err);
            const msg = err?.response?.data?.message
                     || err?.response?.data?.detail
                     || err?.response?.data?.error
                     || err?.message
                     || 'Failed to generate report.';
            toast.error(msg);
            setLoading(false);
            setActiveStep(-1);
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* ─── Header ───────────────────────────────────────────────── */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">ESG Report Generator</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Fill in your emission data — AI generates a full Word (.docx) ESG &amp; Carbon Audit report
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                    <span className="material-symbols-outlined text-amber-600 text-base">psychology</span>
                    <span className="text-xs font-bold text-amber-700">AI Powered</span>
                </div>
            </div>

            {/* ─── Form ─────────────────────────────────────────────────── */}
            <form
                id="esg-report-form"
                onSubmit={e => { e.preventDefault(); handleGenerate(); }}
                className="space-y-5"
            >
                {FIELD_GROUPS.map(group => (
                    <div
                        key={group.id}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                    >
                        {/* Section header */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${group.color}`}>
                                <span className="material-symbols-outlined text-base">{group.icon}</span>
                            </div>
                            <h2 className="font-black text-gray-900">{group.title}</h2>
                        </div>

                        {/* Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {group.fields.map(field => (
                                <div key={field.key}>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">
                                        {field.label}
                                        {field.unit && (
                                            <span className="ml-1 font-normal text-gray-400">({field.unit})</span>
                                        )}
                                    </label>
                                    <input
                                        id={`field-${field.key}`}
                                        type={field.type}
                                        min={field.type === 'number' ? 0 : undefined}
                                        placeholder={field.placeholder}
                                        value={form[field.key as keyof FormData]}
                                        onChange={e => handleChange(field.key as keyof FormData, e.target.value)}
                                        required
                                        disabled={loading}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white
                                                   focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 focus:border-[#1A7A4A]
                                                   disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* ─── Generate Button ───────────────────────────────────── */}
                <div className="bg-gradient-to-br from-[#1A7A4A] to-[#0f4d2d] rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                        <div>
                            <h3 className="text-white font-black text-lg">Generate ESG Report</h3>
                            <p className="text-green-200 text-sm mt-0.5">
                                AI writes Scope 1/2/3 analysis, sustainability strategy &amp; roadmap — delivered as a .docx
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-white text-[#1A7A4A] font-black px-6 py-3 rounded-xl
                                       hover:bg-green-50 transition-colors text-sm flex-shrink-0
                                       disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4 text-[#1A7A4A]" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Generating…
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-base">auto_awesome</span>
                                    Generate Report
                                </>
                            )}
                        </button>
                    </div>

                    {downloadUrl && !loading && (
                        <div className="mt-5 p-4 bg-green-50/50 border border-green-200/50 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-green-600">check_circle</span>
                                <div>
                                    <p className="text-sm font-bold text-green-900">Your report is ready!</p>
                                    <p className="text-xs text-green-700">Click below to download your comprehensive ESG analysis.</p>
                                </div>
                            </div>
                            <a 
                                href={downloadUrl}
                                download={downloadUrl.startsWith('data:') ? 'ESG_Report.docx' : undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-[#1A7A4A] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#15613b] transition-colors text-sm"
                            >
                                <span className="material-symbols-outlined text-sm">download</span>
                                Download .docx
                            </a>
                        </div>
                    )}

                    {/* Progress steps (shown while loading) */}
                    {loading && (
                        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {PROGRESS_STEPS.map((step, idx) => {
                                const done = idx < activeStep;
                                const active = idx === activeStep;
                                return (
                                    <div
                                        key={step.label}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-500
                                            ${done ? 'bg-white/25 text-white' :
                                              active ? 'bg-white/20 text-white ring-1 ring-white/50' :
                                              'bg-white/10 text-green-300'}`}
                                    >
                                        {done ? (
                                            <span className="material-symbols-outlined text-sm text-green-300">check_circle</span>
                                        ) : active ? (
                                            <svg className="animate-spin w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                        ) : (
                                            <span className="material-symbols-outlined text-sm">{step.icon}</span>
                                        )}
                                        {step.label}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </form>

            {/* Hidden anchor used to trigger download */}
            {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
            <a ref={linkRef} className="hidden" aria-hidden="true" />

            {/* ─── Compliance Certificate ────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-violet-600 text-base">workspace_premium</span>
                    </div>
                    <h2 className="font-black text-gray-900">Compliance Certificate</h2>
                </div>
                <div className="p-5 flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <p className="font-bold text-gray-900 text-sm">Compliance Certificate 2024</p>
                        <p className="text-xs text-gray-400 mt-0.5">Issued by: Ministry of Environment · Signed on: Jan 31, 2025</p>
                        <p className="text-xs text-gray-400">Valid for: Annual reporting period 2024 · Blockchain verified</p>
                    </div>
                    <button
                        onClick={() => toast.success('Certificate downloaded!')}
                        className="flex items-center gap-2 bg-[#1A7A4A] text-white font-black px-4 py-2
                                   rounded-xl hover:bg-[#15613b] transition-colors text-sm flex-shrink-0"
                    >
                        <span className="material-symbols-outlined text-sm">download</span>
                        Download Cert
                    </button>
                </div>
            </div>

            {/* ─── Past Reports ──────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-black text-gray-900">Past Reports</h2>
                    <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full">
                        {pastReports.length} reports
                    </span>
                </div>
                <div className="divide-y divide-gray-50">
                    {pastReports.length > 0 ? (
                        pastReports.map((r, i) => (
                            <div key={r._id || i} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-red-500 text-sm">description</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-sm truncate">{r.name}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {r.size}
                                    </p>
                                </div>
                                <span className={`text-xs font-black px-2 py-0.5 rounded-full flex-shrink-0
                                    ${r.type === 'ESG' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}
                                >
                                    {r.type}
                                </span>
                                {r.url ? (
                                    <a
                                        href={r.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold text-[#1A7A4A] border border-[#1A7A4A]/30 px-3 py-1
                                                   rounded-lg hover:bg-green-50 transition-colors flex-shrink-0"
                                    >
                                        Open
                                    </a>
                                ) : (
                                    <button
                                        onClick={() => toast.error('No upload link available.')}
                                        className="text-xs font-bold text-slate-400 border border-slate-200 px-3 py-1
                                                   rounded-lg cursor-not-allowed flex-shrink-0"
                                        disabled
                                    >
                                        Unavailable
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            <span className="material-symbols-outlined text-3xl block mb-2 text-gray-300">folder_open</span>
                            No past reports generated yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
