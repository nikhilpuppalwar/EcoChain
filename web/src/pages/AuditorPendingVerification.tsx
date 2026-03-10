import React from 'react';
import { useAuthStore } from '../store/authStore';

export default function AuditorPendingVerification() {
    const { user } = useAuthStore();

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-[#1a1625] via-[#2d1b4e] to-[#4c2889] z-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(139,92,246,0.3)] animate-bounce">
                <span className="material-symbols-outlined text-white text-[48px]">fact_check</span>
            </div>

            <h1 className="font-syne font-bold text-4xl text-white mb-3">Application Under Review</h1>

            <p className="text-xl text-white/80 mb-12 max-w-lg">
                Your auditor registration is currently being verified by the platform administration.
                <br /><br />
                We will send an email to <span className="font-bold text-white">{user?.email || 'your registered email'}</span> within 2-5 business days when your account is approved.
            </p>

            <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden mb-12">
                <div className="h-full bg-violet-500 rounded-full animate-[pulse_2s_infinite_ease-in-out]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm text-left">
                    <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-violet-400">mark_email_read</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">Check your email</h3>
                    <p className="text-white/60 text-sm">Monitor your work email for verification status updates or additional requests.</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm text-left">
                    <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-violet-400">verified</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">License Verification</h3>
                    <p className="text-white/60 text-sm">Our team is manually verifying your auditing license against national registries.</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm text-left">
                    <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-violet-400">menu_book</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">Review Guidelines</h3>
                    <p className="text-white/60 text-sm">
                        <a href="#" className="text-violet-400 hover:underline">Read the Auditor Verification Guide →</a>
                    </p>
                </div>
            </div>

            <div className="mt-12">
                <a href="/" className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Return to Homepage
                </a>
            </div>
        </div>
    );
}
