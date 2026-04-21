import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Lock, Eye, EyeOff, ShieldCheck, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';

const ForceChangePassword = () => {
    const { API, refreshUser, user, isAuthenticated } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    // Redirect if already active
    useEffect(() => {
        if (isAuthenticated && user && !user.mustChangePassword) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }
        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }

        setLoading(true);
        try {
            const res = await fetch(`${API}/api/v1/auth/force-change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword: password }),
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setIsSuccess(true);
                toast.success("Security synchronised!");
                
                setTimeout(async () => {
                    await refreshUser();
                    navigate('/dashboard', { replace: true });
                }, 2000);
            } else {
                toast.error(data.message || "Failed to change password");
            }
        } catch (err) {
            toast.error("Internal Server Error");
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <AuthLayout>
                <main className="w-full max-w-sm z-10 px-4">
                    <div className="glass-card p-10 rounded-2xl text-center">
                        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center text-success mx-auto mb-6">
                            <ShieldCheck size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-on-surface tracking-tight mb-2 italic">Identity Verified</h2>
                        <p className="text-on-surface text-sm leading-relaxed mb-8">Your security key has been synchronised. Accelerating to your dashboard...</p>
                        <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-success animate-timer-progress transition-all duration-2000 ease-in-out" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </main>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <main className="w-full max-w-sm z-10 px-4">
                {/* Brand Identity */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-primary via-primary-fixed to-primary-container bg-clip-text text-transparent inline-block mb-3 italic">
                        ExpenseMate
                    </h1>
                    <div className="flex items-center justify-center gap-2">
                        <span className="h-[1px] w-8 bg-primary/40" />
                        <p className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase">
                            Security Protocol
                        </p>
                        <span className="h-[1px] w-8 bg-primary/40" />
                    </div>
                </div>

                {/* Glassmorphism Card */}
                <div className="glass-card p-6 sm:p-8 rounded-2xl">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-on-surface tracking-tight mb-2 italic underline underline-offset-8 decoration-primary/30">Activate Wallet</h2>
                        <p className="text-on-surface text-sm leading-relaxed mt-4">You are currently using a temporary key. Set a permanent password to secure your personal finance galaxy.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* New Password */}
                        <div className="space-y-2.5">
                            <label className="block text-[11px] font-bold text-primary uppercase tracking-[0.15em] ml-1">
                                New Security Key
                            </label>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" />
                                <input
                                    required
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field pl-11 pr-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2.5">
                            <label className="block text-[11px] font-bold text-primary uppercase tracking-[0.15em] ml-1">
                                Confirm Key
                            </label>
                            <div className="relative group">
                                <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" />
                                <input
                                    required
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field pl-11 pr-11"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-premium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-[11px] font-black py-4"
                        >
                            {loading ? 'Synchronising...' : 'Set Security Key'}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-glass-border" />
                        </div>
                        <div className="relative flex justify-center text-[8px] uppercase font-black tracking-widest">
                            <span className="bg-glass-surface px-4 text-on-surface-variant/40">
                                End-to-End Encrypted
                            </span>
                        </div>
                    </div>
                </div>

                {/* Aesthetic Card Preview */}
                <div className="mt-12 flex justify-center gap-4 overflow-hidden mask-fade opacity-20">
                    <div className="w-24 h-14 rounded-xl bg-surface-container-highest/20 border border-outline-variant/10 shrink-0" />
                    <div className="w-24 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/10 shrink-0" />
                    <div className="w-24 h-14 rounded-xl bg-surface-container-highest/20 border border-outline-variant/10 shrink-0" />
                </div>
            </main>

            {/* Security Footer */}
            <footer className="mt-auto py-8 z-10 w-full flex justify-center">
                <div className="flex items-center gap-4 px-5 py-3 glass-panel rounded-2xl max-w-xs mx-auto">
                    <div className="w-9 h-9 rounded-full bg-primary-container/20 border border-primary/20 flex items-center justify-center">
                        <Shield size={18} className="text-primary" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-on-surface tracking-tight">Active Protection</p>
                        <p className="text-[9px] text-on-surface uppercase tracking-[0.1em] font-semibold">One-time security handshake</p>
                    </div>
                </div>
            </footer>
        </AuthLayout>
    );
};

export default ForceChangePassword;
