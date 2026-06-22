import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import ecochainIconWhite from '../assets/ecochain_icon_white.png';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!token) {
            setError('Reset link is missing or invalid.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await api.post('/auth/reset-password', { token, password });
            toast.success(response.data?.message || 'Password has been reset. You can now log in.');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                            <img src={ecochainIconWhite} alt="EcoChain Logo" className="w-full h-full rounded-xl object-contain" />
                        </div>
                        <span className="text-lg font-black tracking-wide text-gray-900">ECOCHAIN</span>
                    </div>
                    <Link to="/login" className="text-xs text-gray-400 hover:text-gray-600">
                        Back to login
                    </Link>
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset your password</h1>
                    <p className="text-sm text-gray-500">
                        Enter a new password for your account. After resetting, you can use it to sign in.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {!token && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-3 rounded-lg">
                        This reset link is missing a token. Please start the reset process again from the login page.
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="password">
                            New password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                            placeholder="Enter new password"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="confirmPassword">
                            Confirm password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                            placeholder="Re-enter new password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !token}
                        className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Resetting...' : 'Reset password'}
                    </button>
                </form>
            </div>
        </div>
    );
}

