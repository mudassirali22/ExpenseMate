import React, { useState, useEffect } from 'react';
import PublicNavbar from './PublicNavbar';
import { Shield, Users, TrendingUp, Landmark, Activity, Sparkles, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthLayout = ({ children }) => {
  const [stats, setStats] = useState({
    activeUsers: '1K+',
    trackedAssets: '$1.5M',
    uptime: '99.9%',
    rating: '4.9★'
  });

  const API = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/api/v1/auth/public-stats`);
        if (res.ok) {
          const data = await res.json();
          setStats({
            activeUsers: `${data.activeUsers > 100 ? Math.floor(data.activeUsers / 100) * 100 : data.activeUsers}+`,
            trackedAssets: `$${(data.trackedAssets / 1000000).toFixed(1)}M`,
            uptime: data.uptime,
            rating: `${data.rating}★`
          });
        }
      } catch (err) {
        console.error("Failed to fetch public stats:", err);
      }
    };
    fetchStats();
  }, [API]);

  return (
    <div className="min-h-screen bg-background text-on-surface transition-colors duration-300 relative overflow-x-hidden flex flex-col font-['Inter']">
      <PublicNavbar />

      <main className="flex-1 flex flex-col lg:flex-row relative z-10 pt-16">
        {/* Left Column: Focused Form Area */}
        <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 pt-6 sm:pt-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-sm"
          >
            {children}
          </motion.div>
        </div>

        {/* Right Column: Intelligence Panel (Desktop Only) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-surface-lowest relative border-l border-glass-border overflow-hidden"
        >
          {/* Subtle Mesh Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-full h-full bg-primary/5 blur-[120px] rounded-full animate-pulse-glow" />
          </div>

          <div className="relative z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-10">
              <Sparkles size={14} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">AI Powered</span>
            </div>

            <h2 className="text-5xl xl:text-6xl font-black tracking-tightest leading-[0.9] mb-8">
              Smart Money <br />
              <span className="text-primary italic">Tracking.</span>
            </h2>

            <p className="text-lg text-on-surface-variant font-medium max-w-md leading-relaxed">
              Join thousands of people tracking their money with ExpenseMate.
              Simple, fast, and easy to use.
            </p>
          </div>

          {/* Real-time Stats Grid */}
          <div className="relative z-20 grid grid-cols-2 gap-6 w-full pt-6 pb-6 max-w-lg">
            {[
              { value: stats.activeUsers, label: 'Active Masters', icon: Users, color: 'primary' },
              { value: stats.trackedAssets, label: 'Total Assets', icon: Landmark, color: 'secondary' },
              { value: stats.uptime, label: 'System Uptime', icon: Activity, color: 'tertiary' },
              { value: stats.rating, label: 'Global Trust', icon: Star, color: 'primary' },
            ].map((stat, i) => (
              <div key={i} className="stat-card !p-6 flex flex-col justify-between h-32 bg-background/40 backdrop-blur-xl border-glass-border">
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}/10 flex items-center justify-center text-${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tightest leading-none mb-1">{stat.value}</p>
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Security Verification */}
           <div className="relative z-20 flex items-center gap-4 p-2 2  px-6 rounded-2xl bg-surface-container/30 border border-glass-border backdrop-blur-md w-fit">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
              <Shield size={20} />
            </div>
              <div>
              <p className="text-xs font-black uppercase tracking-widest text-on-surface">Secure & Encrypted</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em] opacity-60">Your data is safe with us</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Mobile background decorative */}
      <div className="lg:hidden fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] right-[-10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};

export default AuthLayout;