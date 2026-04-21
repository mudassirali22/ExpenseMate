import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';
import { Mail, ArrowLeft, ArrowRight, KeyRound, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send reset email');
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <main className="w-full max-w-sm z-10 px-4">
        {/* Brand */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent">
            ExpenseMate
          </h1>
          <p className="text-on-surface font-medium tracking-wide text-sm mt-1">Smart Expense Tracker</p>
        </div>

        {/* Forgot Password Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative Accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

          <header className="relative z-10 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6">
              <KeyRound size={28} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-on-surface">Forgot password?</h2>
            <p className="text-on-surface mt-2 leading-relaxed">
              {sent
                ? 'Check your email for the reset link. It expires in 10 minutes.'
                : "No worries, it happens. Enter the email address associated with your account and we'll send a secure link to reset your password."
              }
            </p>
          </header>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="group">
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest text-on-surface mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-premium shadow-lg disabled:opacity-50 group"
              >
                <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          ) : (
            <div className="relative z-10 text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail size={28} className="text-primary" />
              </div>
              <p className="text-on-surface font-bold mb-2">Email Sent!</p>
              <p className="text-on-surface text-sm mb-6">We've sent a password reset link to <span className="text-primary font-semibold">{email}</span></p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-primary text-sm font-bold hover:underline"
              >
                Try a different email
              </button>
            </div>
          )}

          <footer className="mt-8 pt-6 border-t border-outline-variant/10 text-center relative z-10">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-on-surface hover:text-primary transition-colors">
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </footer>
        </div>

        {/* Footer Visual Hint */}
        <div className="mt-12 flex justify-center gap-8 text-on-surface">
          <div className="flex items-center gap-2">
            <Shield size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Secure Access</span>
          </div>
        </div>
      </main>
    </AuthLayout>
  );
};

export default ForgotPassword;
