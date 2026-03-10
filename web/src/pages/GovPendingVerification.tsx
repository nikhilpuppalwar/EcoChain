import React from 'react';
import { useAuthStore } from '../store/authStore';

export default function GovPendingVerification() {
    const { user } = useAuthStore();

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#1a365d] z-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(41,128,185,0.3)] animate-bounce">
                <span className="material-symbols-outlined text-white text-[48px]">mail</span>
            </div>

            <h1 className="font-syne font-bold text-4xl text-white mb-3">Application Under Review</h1>

            <p className="text-xl text-white/80 mb-12 max-w-lg">
                Your registration is currently being verified by the MoEFCC administration.
                <br /><br />
                We will send an email to <span className="font-bold text-white">{user?.email || 'your registered email'}</span> within 2 business days when your account is approved.
            </p>

            <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden mb-12">
                <div className="h-full bg-[#3498DB] rounded-full animate-[pulse_2s_infinite_ease-in-out]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm text-left">
                    <div className="w-10 h-10 rounded-full bg-[#2980B9]/20 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-[#3498DB]">mark_email_read</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">Check your email</h3>
                    <p className="text-white/60 text-sm">Monitor your official email for verification links or additional requests.</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm text-left">
                    <div className="w-10 h-10 rounded-full bg-[#2980B9]/20 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-[#3498DB]">account_balance_wallet</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">Prepare your wallet</h3>
                    <p className="text-white/60 text-sm">Install MetaMask for secure administrative access and credit issuance later.</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm text-left">
                    <div className="w-10 h-10 rounded-full bg-[#2980B9]/20 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-[#3498DB]">menu_book</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">Review documentation</h3>
                    <p className="text-white/60 text-sm">
                        <a href="#" className="text-[#3498DB] hover:underline">Read the EcoChain methodology guide →</a>
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
