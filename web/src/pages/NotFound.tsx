import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-dmsans text-center">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl">warning</span>
            </div>

            <h1 className="text-6xl font-bold font-syne text-slate-800 mb-4 tracking-tight">404</h1>
            <h2 className="text-2xl font-bold text-slate-700 mb-6">Page Not Found</h2>

            <p className="text-slate-500 max-w-md mb-8">
                The page you're looking for doesn't exist or has been moved. Please check the URL or navigate back to safety.
            </p>

            <Link
                to="/"
                className="bg-[#1A7A4A] text-white px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-[#135c37] transition-all flex items-center justify-center gap-2"
            >
                <span className="material-symbols-outlined">home</span>
                Return to Homepage
            </Link>
        </div>
    );
}
