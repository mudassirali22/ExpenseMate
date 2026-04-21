import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';
import { Lock, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return toast.error('All fields are required');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <main className="w-full max-w-md z-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent">
            ExpenseMate
          </h1>
        </div>

        <div className="glass-card rounded-[24px] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

          {!success ? (
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6">
                <Lock size={28} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-on-surface mb-2">Reset Password</h2>
              <p className="text-on-surface-variant mb-8">Enter your new password below.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full px-4 py-4 bg-surface-container-lowest border-0 rounded-xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/40 outline-none"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full px-4 py-4 bg-surface-container-lowest border-0 rounded-xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/40 outline-none"
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 rounded-full btn-premium font-bold disabled:opacity-50">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </div>
          ) : (
            <div className="relative z-10 text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle size={36} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-on-surface mb-2">Password Reset!</h2>
              <p className="text-on-surface-variant mb-6">Your password has been successfully reset.</p>
              <Link to="/login" className="inline-flex px-8 py-3 rounded-full btn-premium font-bold">
                Go to Login
              </Link>
            </div>
          )}

          <footer className="mt-8 pt-6 border-t border-outline-variant/10 text-center relative z-10">
            <Link to="/login" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
              Back to Login
            </Link>
          </footer>
        </div>

        <div className="mt-8 flex justify-center opacity-40">
          <div className="flex items-center gap-2">
            <Shield size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Secure Password Reset</span>
          </div>
        </div>
      </main>
    </AuthLayout>
  );
};

export default ResetPassword;
