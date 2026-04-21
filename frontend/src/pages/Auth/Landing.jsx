import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/layouts/PublicNavbar';
import { useTheme } from '../../context/ThemeContext';
import {
  Wallet, TrendingUp, Shield, BarChart3, PiggyBank,
  ArrowRight, Sparkles, Lock, Zap, Users, Star, ChevronRight,
  Coins
} from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const { theme } = useTheme();
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
    <div className="min-h-screen bg-background text-on-surface transition-colors duration-300 overflow-x-hidden relative">
      {/* Blurry Orbs background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[5%] left-[5%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-tertiary/15 rounded-full blur-[140px]" />
      </div>

      <PublicNavbar />

      <main>
        {/* Hero Section */}
        <section className="relative z-10 px-6 sm:px-10 lg:px-20 pt-20 sm:pt-24 pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-6xl mx-auto text-center pt-20"
          >

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-on-surface leading-[0.9] mb-8">
              Track money, <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                the smart way.
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-12">
              Easily manage your spending, reach your goals, and master your financial future with ExpenseMate.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link to="/signup" className="w-full sm:w-auto px-12 py-4.5 btn btn-premium text-lg">
                Start for Free <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-12 py-4.5 btn btn-secondary text-lg">
                Login <ChevronRight size={20} />
              </Link>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="max-w-5xl mx-auto mt-20"
          >
            <div className="glass-card rounded-[2.5rem] p-4 sm:p-10 shadow-2xl relative overflow-hidden border-glass-border">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-surface-container/30 to-secondary/5 pointer-events-none" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="stat-card !border-none !bg-surface-lowest/50 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                      <Wallet size={22} />
                    </div>
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Live Assets</span>
                  </div>
                  <p className="text-3xl font-black tracking-tighter text-on-surface">{stats.trackedAssets}</p>
                </div>
                <div className="stat-card !border-none !bg-surface-lowest/50 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                      <TrendingUp size={22} />
                    </div>
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Efficiency</span>
                  </div>
                  <p className="text-3xl font-black tracking-tighter text-on-surface">94.2%</p>
                </div>
                <div className="stat-card !border-none !bg-surface-lowest/50 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary shadow-inner">
                      <Coins size={22} />
                    </div>
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">User Base</span>
                  </div>
                  <p className="text-3xl font-black tracking-tighter text-on-surface">{stats.activeUsers}</p>
                </div>
              </div>
              {/* Bars visual */}
              <div className="mt-10 flex items-end gap-1.5 h-32 px-4 opacity-70">
                {[40, 65, 85, 50, 75, 95, 80, 100, 90, 85, 70, 90, 60, 80].map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-primary/60 to-primary/10 rounded-t-xl" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-10 px-6 sm:px-10 lg:px-18 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4">The Command Center</p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-on-surface leading-tight">
                One app. Absolute <span className="text-primary">Mastery</span>.
              </h2>
            </div>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[
                { icon: BarChart3, color: 'primary', title: 'Smart Insights', desc: 'Auto-categorized charts that tell the real story of your money.' },
                { icon: Users, color: 'secondary', title: 'Shared Wallets', desc: 'Collaborate with partners or friends on shared household goals.' },
                { icon: Sparkles, color: 'tertiary', title: 'AI Advisor', desc: 'Get intelligent advice tailored to your unique spending habits.' },
                { icon: PiggyBank, color: 'primary', title: 'Tax Monitor', desc: 'Track tax deductions and preparation status in real-time.' },
                { icon: Zap, color: 'secondary', title: 'Lightning Sync', desc: 'Cloud synchronization across all your mobile and desktop devices.' },
                { icon: Shield, color: 'tertiary', title: 'Bank-Grade Security', desc: 'Your data is encrypted and protected with modern protocols.' },
              ].map((feature, i) => (
                <motion.div 
                  key={i} 
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="stat-card p-10 group cursor-default"
                >
                  <div className={`w-16 h-16 rounded-3xl bg-${feature.color}/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500`}>
                    <feature.icon size={28} className={`text-${feature.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-on-surface mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-on-surface-variant font-medium leading-relaxed leading-7">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="relative z-10 px-6 sm:px-10 lg:px-20 py-12">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-3xl p-8 sm:p-12 bg-surface-container/50 border-glass-border"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                {[
                  { value: stats.activeUsers, label: 'Early Adopters' },
                  { value: stats.trackedAssets, label: 'Tracked Assets' },
                  { value: stats.uptime, label: 'Reliability' },
                  { value: stats.rating, label: 'Trust Score' },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-4xl sm:text-5xl font-black text-primary tracking-tighter mb-3">{stat.value}</p>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="relative z-10 px-6 sm:px-10 lg:px-20 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <p className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4">Social Proof</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-on-surface leading-tight">
                Trusted by <span className="text-secondary">Forward Thinkers</span>.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Ahmed K.', role: 'Entrepreneur', text: 'ExpenseMate is my financial hub. The AI advisor saved me thousands in deductions.' },
                { name: 'Sara M.', role: 'Freelancer', text: 'Stunning design and robust functionality. It has improved my income management.' },
                { name: 'Ali R.', role: 'Engineer', text: 'The shared wallet feature is a game-changer for our household transparency.' },
              ].map((t, i) => (
                <div key={i} className="stat-card p-10 flex flex-col justify-between hover:border-primary/30 transition-all duration-500">
                  <p className="text-base font-medium text-on-surface leading-relaxed italic mb-8">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">{t.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-black text-on-surface uppercase tracking-wider">{t.name}</p>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 px-6 sm:px-10 lg:px-20 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card rounded-3xl p-10 sm:p-20 relative overflow-hidden border-glass-border"
            >
              <h2 className="text-5xl sm:text-6xl font-black tracking-tighter text-on-surface mb-8 leading-tight">
                Your future <span className="text-primary">unlocked</span>.
              </h2>
              <p className="text-on-surface-variant font-medium mb-12 max-w-lg mx-auto leading-relaxed text-lg">
                Join the growing community taking total control of their financial destiny.
              </p>
              <Link to="/signup" className="btn btn-premium py-5 px-14 text-xl rounded-2xl shadow-2xl">
                Create Account <ArrowRight size={22} />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-glass-border px-6 sm:px-10 lg:px-20 py-16">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Wallet size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-primary">ExpenseMate</span>
          </Link>
          <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em] text-center sm:text-right">
            Developed by <a href="https://mudassirali.vercel.app/">Mudassir ali</a> <br />
            © {new Date().getFullYear()} ExpenseMate Intelligence.
          </p>
          <div className="flex items-center gap-4 px-6 py-2 rounded-full bg-surface-lowest border border-glass-border">
            <Shield size={14} className="text-primary" />
            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface opacity-60">Verified Core</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
