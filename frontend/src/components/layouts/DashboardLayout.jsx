import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import { toast } from 'react-hot-toast';
import { ShieldAlert, Lock } from 'lucide-react';

// Pages that should show the search bar
const SEARCH_PAGES = [
  '/transactions',
  '/budgets',
  '/savings',
  '/portfolio',
  '/shared-wallets',
  '/subscriptions',
  '/notes',
  '/settings',
];

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, API, refreshUser, logout } = useAuth();

  // State for forced password change
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const showSearch = SEARCH_PAGES.includes(location.pathname);
  const isForcedPasswordChange = user?.mustChangePassword === true;

  const handleForcePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/auth/force-change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');

      toast.success("Password updated successfully!");
      setNewPassword('');
      await refreshUser(); // This will pull the updated user struct without mustChangePassword
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:ml-56 min-h-screen flex flex-col transition-all duration-300 relative">
        <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} showSearch={showSearch} />

        <AnimatePresence mode="wait">
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`flex-1 w-full overflow-x-hidden relative px-0 ${isForcedPasswordChange ? 'blur-md pointer-events-none' : ''}`}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Force Password Change Modal (Uncloseable) */}
      {isForcedPasswordChange && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl">
          <div className="bg-surface-lowest border border-error/30 w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-scale-in">
            <div className="absolute top-0 left-0 w-full h-1 bg-error"></div>

            <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mb-6 mx-auto">
              <ShieldAlert size={32} />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-on-surface mb-2 tracking-tight">Security Alert</h2>
              <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                Your account was generated via a shared invitation. For your security, please set a new password for your account to get started.
              </p>
            </div>

            <form onSubmit={handleForcePasswordChange} className="space-y-6">
              <div>
                <label className="input-label">New Primary Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-12 h-14"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn btn-primary justify-center shadow-lg h-14 tracking-widest uppercase text-xs">
                  {loading ? 'Encrypting...' : 'Secure Account'}
                </button>
                <button type="button" onClick={logout} disabled={loading} className="btn btn-outline justify-center border-error/20 text-error hover:bg-error hover:text-on-error h-12 uppercase tracking-widest text-[10px]">
                  Abort & Logout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardLayout;
