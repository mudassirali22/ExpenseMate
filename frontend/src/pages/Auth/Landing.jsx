import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Github, 
  CheckCircle2,
  PieChart,
  Calculator,
  RefreshCcw,
  Bell
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">ExpanseMate</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#security" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Security</a>
            <Link to="/login" className="text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors">Sign In</Link>
            <Link to="/signup" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">New: Financial Utilities 2.0</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
              Master Your Money with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">ExpanseMate</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-xl font-medium">
              A premium, all-in-one financial dashboard designed for modern professionals. Track expenses, set goals, and gain insights with beautiful, dynamic visuals.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl text-lg font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group active:scale-95">
                Start Tracking Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-100 text-slate-800 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95">
                Watch Demo
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-6 grayscale opacity-60">
              <div className="flex items-center gap-2 font-bold text-slate-400">
                <CheckCircle2 size={24} />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-400">
                <ShieldCheck size={24} />
                <span>Bank-level Security</span>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in-right">
            <div className="relative z-10 bg-white rounded-[2.5rem] p-4 shadow-2xl border border-slate-100 overflow-hidden">
               {/* Dashboard Preview Mockup */}
               <div className="bg-slate-50 rounded-[1.8rem] border border-slate-200 overflow-hidden aspect-[4/3] flex items-center justify-center">
                  <div className="text-center">
                    <PieChart size={64} className="text-indigo-400 mx-auto mb-4" />
                    <p className="font-bold text-slate-400">Dashboard Preview</p>
                  </div>
               </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-20 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <h4 className="text-4xl font-black text-slate-900 mb-2">10k+</h4>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Users</p>
          </div>
          <div>
            <h4 className="text-4xl font-black text-indigo-600 mb-2">$5M+</h4>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Expenses Tracked</p>
          </div>
          <div>
            <h4 className="text-4xl font-black text-slate-900 mb-2">99.9%</h4>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Uptime</p>
          </div>
          <div>
            <h4 className="text-4xl font-black text-indigo-600 mb-2">4.9/5</h4>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">User Rating</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 bg-slate-900 text-white rounded-[4rem] mx-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-xs mb-4">The Workflow</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Financial Mastery in 3 Steps</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="relative">
              <div className="text-8xl font-black text-white/5 absolute -top-10 -left-6">01</div>
              <h4 className="text-2xl font-black mb-4 relative z-10">Capture Data</h4>
              <p className="text-slate-400 font-medium leading-relaxed">Instantly log expenses via manual entry or smart Excel imports. ExpanseMate categorizes everything automatically.</p>
            </div>
            <div className="relative">
              <div className="text-8xl font-black text-white/5 absolute -top-10 -left-6">02</div>
              <h4 className="text-2xl font-black mb-4 relative z-10">Monitor Health</h4>
              <p className="text-slate-400 font-medium leading-relaxed">Watch your Financial Health Score react in real-time. Our intelligence engine spots leaks before they sink you.</p>
            </div>
            <div className="relative">
              <div className="text-8xl font-black text-white/5 absolute -top-10 -left-6">03</div>
              <h4 className="text-2xl font-black mb-4 relative z-10">Optimize Future</h4>
              <p className="text-slate-400 font-medium leading-relaxed">Use built-in forecasting and wealth-building tips to transform your spending into long-term investment power.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tighter">Engineered for Results</h2>
            <p className="text-lg text-slate-600 font-medium">Stop guessing where your money goes. ExpanseMate provides the clarity needed for total financial dominance.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-10 rounded-[3rem] bg-white border border-slate-100 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] hover:-translate-y-2 transition-all duration-500 group">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Active Analytics</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Dynamic Recharts visualization showing daily, weekly, and monthly trends with unprecedented precision.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-10 rounded-[3rem] bg-white border border-slate-100 hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] hover:-translate-y-2 transition-all duration-500 group">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                <Calculator size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Integrated Tools</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Professional-grade financial calculator and real-time global currency converter built directly into the UI.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-10 rounded-[3rem] bg-white border border-slate-100 hover:shadow-[0_20px_50px_rgba(147,51,234,0.1)] hover:-translate-y-2 transition-all duration-500 group">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Encrypted Storage</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Your data is secured with AES-256 protocols and multi-factor authentication for absolute peace of mind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-32 bg-slate-900 text-white rounded-[4rem] mx-6 mb-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-10 relative z-10 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Your Data Security is Our Top Priority</h2>
            <div className="space-y-6">
              <div className="flex gap-4 p-6 rounded-3xl bg-white/5 border border-white/10">
                <ShieldCheck size={32} className="text-indigo-400 shrink-0" />
                <div>
                  <h4 className="text-xl font-bold mb-1">AES-256 Encryption</h4>
                  <p className="text-slate-400">All your financial data is encrypted at rest and in transit using industry-standard protocols.</p>
                </div>
              </div>
              <div className="flex gap-4 p-6 rounded-3xl bg-white/5 border border-white/10">
                <Zap size={32} className="text-purple-400 shrink-0" />
                <div>
                  <h4 className="text-xl font-bold mb-1">Two-Factor (OTP) Auth</h4>
                  <p className="text-slate-400">Secure your account changes with mandatory OTP verification sent directly to your email.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
             <div className="bg-white/10 p-1 rounded-3xl backdrop-blur-sm border border-white/20 inline-block rotate-3 animate-fade-in">
                <div className="bg-slate-800 p-8 rounded-[1.4rem]">
                   <ShieldCheck size={120} className="text-indigo-500 drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-8">Ready to take control of your future?</h2>
          <p className="text-xl text-slate-600 font-medium mb-12">Join thousands of users who have optimized their spending and saved millions with ExpanseMate.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-10 py-5 bg-indigo-600 text-white rounded-2xl text-xl font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 hover:scale-105 active:scale-95">
            Get Started for Free
            <ArrowRight size={24} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-indigo-600" size={24} />
            <span className="text-xl font-black text-slate-800 tracking-tight">ExpanseMate</span>
          </div>
          <p className="text-slate-400 font-medium">© 2026 ExpanseMate Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"><Github size={20} /></a>
            <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"><Zap size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
