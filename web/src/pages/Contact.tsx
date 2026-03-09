import { useState } from 'react';
import { Link } from 'react-router-dom';

const faqs = [
    { q: 'How is emission data verified?', a: 'All submissions pass through our Isolation Forest AI anomaly detection before a certified human auditor reviews and digitally signs the report.' },
    { q: 'Is my data stored on the blockchain?', a: 'Only the cryptographic hash (SHA-256 fingerprint) of your verified audit report is stored on Polygon — never raw emission data. Individual data stays private on MongoDB Atlas.' },
    { q: 'How long does the audit process take?', a: 'AI pre-screening completes in under 3 seconds. Human auditor review typically takes 2–5 business days depending on submission complexity and auditor availability.' },
    { q: 'What is 1 carbon credit worth?', a: 'One EcoChain carbon credit equals 1 tonne of CO₂ equivalent (1 tCO₂e) reduced below your verified baseline. Market price is determined by supply/demand on CarbonMarketplace.sol.' },
    { q: 'How do I register my company?', a: 'Submit a registration on the Register page. A Government official will review your business documents and approve/reject within 5 business days.' },
    { q: 'Can I export my ESG reports?', a: 'Yes. All compliance reports and certificates are available as PDF (PDFKit), Excel (ExcelJS), and CSV formats from your Industry Portal.' },
];

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', role: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1A7A4A] text-2xl">eco</span>
                        <span className="text-lg font-black tracking-wide text-gray-900">ECOCHAIN</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">How It Works</Link>
                        <Link to="/login" className="bg-[#1A7A4A] text-white text-sm font-bold py-2 px-5 rounded-lg hover:bg-[#15613b] transition-colors">Login</Link>
                    </div>
                </div>
            </nav>

            <main className="pt-20">
                {/* Hero */}
                <section className="py-16 px-6 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-[#1A7A4A]/10 text-[#1A7A4A] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
                            <span className="material-symbols-outlined text-sm">support_agent</span>
                            We're here to help
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 mb-4">Contact EcoChain</h1>
                        <p className="text-xl text-gray-500 leading-relaxed">Have questions about carbon credits, onboarding, or technical integration? We respond within 24 hours.</p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="py-12 px-6">
                    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
                        {/* Form */}
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 mb-6">Send an Inquiry</h2>
                            {submitted ? (
                                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                                    <span className="material-symbols-outlined text-green-500 text-5xl">check_circle</span>
                                    <h3 className="text-xl font-black text-gray-900 mt-4">Message Received!</h3>
                                    <p className="text-gray-500 mt-2">We'll get back to you at <strong>{form.email}</strong> within 24 hours.</p>
                                    <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', role: '', message: '' }); }} className="mt-6 text-sm text-[#1A7A4A] font-bold hover:underline">
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name *</label>
                                            <input
                                                required
                                                type="text"
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                placeholder="John Smith"
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 focus:border-[#1A7A4A] transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address *</label>
                                            <input
                                                required
                                                type="email"
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                                placeholder="you@company.com"
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 focus:border-[#1A7A4A] transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Your Role *</label>
                                        <select
                                            required
                                            value={form.role}
                                            onChange={e => setForm({ ...form, role: e.target.value })}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 focus:border-[#1A7A4A] transition-all bg-white"
                                        >
                                            <option value="">Select your role...</option>
                                            <option>Industry / Business</option>
                                            <option>Environmental Auditor</option>
                                            <option>Government Official</option>
                                            <option>Researcher / Developer</option>
                                            <option>Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Message *</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={form.message}
                                            onChange={e => setForm({ ...form, message: e.target.value })}
                                            placeholder="Describe your inquiry, technical question, or partnership interest..."
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A4A]/40 focus:border-[#1A7A4A] transition-all resize-none"
                                        />
                                    </div>

                                    <button type="submit" className="w-full bg-[#1A7A4A] hover:bg-[#15613b] text-white font-black py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1A7A4A]/30">
                                        <span className="material-symbols-outlined text-sm">send</span>
                                        Send Message
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Side info */}
                        <div className="space-y-8">
                            {/* Contact cards */}
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 mb-6">Support Contacts</h2>
                                <div className="space-y-4">
                                    {[
                                        { icon: 'email', label: 'General Inquiries', value: 'hello@ecochain.dev', sub: 'Response within 24 hours' },
                                        { icon: 'bug_report', label: 'Technical Support', value: 'tech@ecochain.dev', sub: 'Response within 4 hours' },
                                        { icon: 'business', label: 'Partnership', value: 'partners@ecochain.dev', sub: 'Response within 48 hours' },
                                    ].map(c => (
                                        <div key={c.label} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                            <div className="w-12 h-12 rounded-xl bg-[#1A7A4A]/10 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-[#1A7A4A]">{c.icon}</span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{c.label}</p>
                                                <p className="font-bold text-gray-900">{c.value}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Map placeholder */}
                            <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 h-48 flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                    <span className="material-symbols-outlined text-5xl">location_on</span>
                                    <p className="text-sm font-medium mt-2">EcoChain Global HQ</p>
                                    <p className="text-xs">Mumbai, India 🇮🇳</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-16 px-6 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-black text-gray-900 mb-2 text-center">Frequently Asked Questions</h2>
                        <p className="text-center text-gray-400 mb-10">Can't find your answer? Send us a message above.</p>
                        <div className="space-y-3">
                            {faqs.map((faq, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="font-bold text-gray-900">{faq.q}</span>
                                        <span className="material-symbols-outlined text-gray-400 text-sm flex-shrink-0 ml-4">
                                            {openFaq === i ? 'expand_less' : 'expand_more'}
                                        </span>
                                    </button>
                                    {openFaq === i && (
                                        <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
