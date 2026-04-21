import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Settings as SettingsIcon,
  BellRing,
  CreditCard,
  Database,
  Globe,
  Moon,
  Sun,
  Key,
  ShieldCheck,
  Smartphone,
  Info,
  Trash2,
  Lock,
  Download,
  ArrowRight,
  Award,
  ShieldAlert,
  AlertTriangle,
  LogOut,
  Mail
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import { AnimatePresence, motion } from 'framer-motion';

const Settings = () => {
  const { user, API, refreshUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Preferences');

  // Preferences Settings
  const [currency, setCurrency] = useState(user?.currency || 'PKR');
  const [language, setLanguage] = useState(user?.language || 'English (US)');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC+5 (Pakistan)');
  const [dateFormat, setDateFormat] = useState(user?.dateFormat || 'DD/MM/YYYY');
  const [isDarkMode, setIsDarkMode] = useState(user?.theme === 'dark');

  // Security Settings
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Currency Dropdown State
  const [showCurrDrop, setShowCurrDrop] = useState(false);
  const [currSearch, setCurrSearch] = useState('');
  const currencies = ['PKR', 'USD', 'EUR', 'GBP', 'INR', 'AED', 'SAR', 'CAD', 'AUD', 'JPY', 'CNY', 'SGD', 'CHF', 'MYR', 'NZD', 'HKD', 'SEK', 'NOK', 'DKK', 'TRY', 'BRL', 'ZAR', 'RUB', 'KRW', 'MXN', 'QAR', 'KWD', 'BHD'].sort();
  const currRef = React.useRef(null);

  // Mock Sessions state to make "Revoke" functional
  const [sessions, setSessions] = useState([
    { id: 1, unit: 'Main Computer', os: 'Windows 11', loc: 'Karachi, PK', active: true },
    { id: 2, unit: 'Mobile App', os: 'Android 14', loc: 'Lahore, PK', active: false }
  ]);

  // Notifications Settings
  const [notifBudget, setNotifBudget] = useState(user?.notifications?.budget ?? true);
  const [notifMonthly, setNotifMonthly] = useState(user?.notifications?.monthly ?? false);
  const [notifSecurity, setNotifSecurity] = useState(user?.notifications?.security ?? true);
  const [notifMarketing, setNotifMarketing] = useState(user?.notifications?.marketing ?? false);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (currRef.current && !currRef.current.contains(e.target)) setShowCurrDrop(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFlagUrl = (code) => {
    if (code === 'EUR') return 'https://flagcdn.com/w40/eu.png';
    return `https://flagcdn.com/w40/${code.substring(0, 2).toLowerCase()}.png`;
  };

  const tabs = [
    { id: 'Preferences', icon: Globe, desc: 'Regional Settings' },
    { id: 'Security', icon: ShieldCheck, desc: 'Login & Security' },
    { id: 'Notifications', icon: BellRing, desc: 'App Alerts' },
    { id: 'Billing', icon: CreditCard, desc: 'Payment Methods' },
    { id: 'Data', icon: Database, desc: 'Your Data' }
  ];

  const handleUpdateSettings = async (updates) => {
    try {
      const res = await fetch(`${API}/api/v1/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success('Settings updated!');
      refreshUser();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const sendOTP = async () => {
    try {
      const res = await fetch(`${API}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: user?.email })
      });
      if (!res.ok) throw new Error('Failed to send reset link');
      toast.success('Password reset link sent to your email!');
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API}/api/v1/auth/delete-account`, {
        method: 'DELETE', credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete account');
      toast.success('Account deleted successfully');
      logout();
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleDownloadData = async () => {
    toast.loading('Preparing your data...', { id: 'download' });
    try {
      const res = await fetch(`${API}/api/v1/auth/export-data`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to export data');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expansemate-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Data exported successfully!', { id: 'download' });
    } catch (err) {
      toast.error(err.message, { id: 'download' });
    }
  };

  const revokeSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    toast.success('Session revoked successfully');
  };

  return (
    <div className="page-container animate-fade-in-up pb-20">

      {/* Header Matrix */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SettingsIcon size={14} className="text-secondary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant opacity-80">Settings Control</span>
          </div>
          <h1 className="page-title text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">Account Settings</h1>
          <p className="page-subtitle text-sm mt-1 text-on-surface-variant font-medium">Control your currency, security, and app alerts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full group p-4 rounded-2xl flex items-center justify-between transition-all duration-300 border-2 ${activeTab === tab.id
                ? 'bg-surface-lowest border-primary shadow-xl shadow-primary/5'
                : 'bg-transparent border-transparent hover:bg-surface-container/50'
                }`}
            >
              <div className="flex items-center gap-4 text-left">
                <div className={`p-2.5 rounded-xl transition-all duration-500 ${activeTab === tab.id ? 'bg-primary text-on-primary shadow-glow-primary' : 'bg-surface-high text-on-surface-variant group-hover:text-on-surface'
                  }`}>
                  <tab.icon size={18} />
                </div>
                <div>
                  <p className={`text-xs font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-on-surface' : 'text-on-surface-variant'}`}>{tab.id}</p>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">{tab.desc}</p>
                </div>
              </div>
              <ArrowRight size={14} className={`transition-all duration-300 ${activeTab === tab.id ? 'opacity-100 translate-x-0 text-primary' : 'opacity-0 -translate-x-2'}`} />
            </button>
          ))}
        </div>

        {/* Active Panel Viewport */}
        <div className="lg:col-span-9 animate-fade-in">
          <div className="stat-card !p-8 relative overflow-hidden min-h-[600px]">

            {activeTab === 'Preferences' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><Globe size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">Regional <span className="text-primary italic">Preferences</span></h3>
                    <p className="text-xs text-on-surface-variant opacity-60 font-bold uppercase tracking-widest mt-0.5">Set your local currency and time features</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="input-label">Select Currency</label>
                  <div className="relative" ref={currRef}>
                    <button
                      onClick={() => setShowCurrDrop(!showCurrDrop)}
                      className="w-full p-2.5 bg-surface-lowest rounded-2xl border-2 border-glass-border flex items-center justify-between hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-glass-border shadow-sm bg-surface-high flex items-center justify-center p-1">
                          <img src={getFlagUrl(currency)} alt={currency} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-black text-on-surface uppercase tracking-widest">{currency}</span>
                          <span className="text-[8px] text-on-surface-variant font-bold opacity-40 uppercase tracking-tighter">Selected Asset</span>
                        </div>
                      </div>
                      <Globe size={14} className={`text-on-surface-variant transition-transform duration-500 ${showCurrDrop ? 'rotate-180 text-primary' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showCurrDrop && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full left-0 w-full mt-2 bg-surface-lowest border border-glass-border rounded-[1.5rem] shadow-2xl z-[100] overflow-hidden backdrop-blur-xl"
                        >
                          <div className="p-3 border-b border-glass-border flex items-center gap-3 bg-surface-container/30">
                            <Globe size={14} className="text-primary" />
                            <input
                              type="text"
                              autoFocus
                              value={currSearch}
                              onChange={e => setCurrSearch(e.target.value)}
                              placeholder="SEARCH ASSET..."
                              className="w-full bg-transparent text-[10px] font-black text-on-surface outline-none placeholder:text-on-surface-variant/30 uppercase tracking-widest"
                            />
                          </div>
                          <div className="max-h-60 overflow-y-auto p-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 custom-scrollbar">
                            {currencies.filter(c => c.toLowerCase().includes(currSearch.toLowerCase())).map(curr => (
                              <button
                                key={curr}
                                onClick={() => {
                                  setCurrency(curr);
                                  handleUpdateSettings({ currency: curr });
                                  setShowCurrDrop(false);
                                }}
                                className={`flex items-center gap-2.5 p-2 rounded-xl transition-all border-2 ${currency === curr
                                  ? 'bg-primary/5 border-primary text-primary'
                                  : 'bg-transparent border-transparent hover:bg-surface-high'
                                  }`}
                              >
                                <div className="w-6 h-6 rounded-lg overflow-hidden border border-glass-border bg-surface-lowest flex items-center justify-center p-0.5">
                                  <img src={getFlagUrl(curr)} alt={curr} className="w-full h-full object-contain" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">{curr}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-glass-border/30">
                  <div className="space-y-4">
                    <label className="input-label">Time Zone</label>
                    <div className="relative">
                      <select
                        value={timezone}
                        onChange={(e) => { setTimezone(e.target.value); handleUpdateSettings({ timezone: e.target.value }); }}
                        className="input-field cursor-pointer text-xs font-bold uppercase tracking-widest appearance-none bg-surface-lowest"
                      >
                        <option value="UTC+5:00 (Pakistan)">UTC+5:00 (Pakistan)</option>
                        <option value="UTC+5:30 (India)">UTC+5:30 (India)</option>
                        <option value="UTC+0:00 (London)">UTC+0:00 (London)</option>
                        <option value="UTC+1:00 (Paris/Berlin)">UTC+1:00 (Paris/Berlin)</option>
                        <option value="UTC-5:00 (New York)">UTC-5:00 (New York)</option>
                        <option value="UTC-8:00 (Pacific Time)">UTC-8:00 (Pacific Time)</option>
                        <option value="UTC+8:00 (Singapore)">UTC+8:00 (Singapore)</option>
                        <option value="UTC+9:00 (Tokyo)">UTC+9:00 (Tokyo)</option>
                        <option value="UTC+10:00 (Sydney)">UTC+10:00 (Sydney)</option>
                      </select>
                      <Globe size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="input-label">Date Format</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['DD/MM/YYYY', 'MM/DD/YYYY'].map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => { setDateFormat(fmt); handleUpdateSettings({ dateFormat: fmt }); }}
                          className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${dateFormat === fmt ? 'bg-primary/5 border-primary text-primary' : 'bg-transparent border-glass-border opacity-50'
                            }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error border border-error/20"><ShieldCheck size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">Security <span className="text-error italic">& Access</span></h3>
                    <p className="text-xs text-on-surface-variant opacity-60 font-bold uppercase tracking-widest mt-0.5">Manage your password and verified sessions</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-8 bg-surface-lowest border border-glass-border rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-surface-high border border-glass-border flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                        <Key size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-on-surface uppercase tracking-tight">Update Password</p>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold opacity-40 italic mt-0.5 tracking-widest">Send a reset link to your email</p>
                      </div>
                    </div>
                    <button onClick={sendOTP} className="btn btn-primary text-xs font-black tracking-widest px-8 transform active:scale-95">SEND LINK</button>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-4 pl-1 opacity-60">Signed-in Devices</h4>
                    <div className="space-y-4">
                      {sessions.map((node) => (
                        <div key={node.id} className="flex items-center justify-between p-5 rounded-2xl bg-surface-container/30 border border-glass-border/30 group hover:border-primary/20 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${node.active ? 'bg-success/5 border-success/20 text-success' : 'bg-surface-low border-glass-border text-on-surface-variant'}`}>
                              {node.os.includes('Windows') ? <Globe size={16} /> : <Smartphone size={16} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-black text-on-surface uppercase tracking-tight">{node.unit}</p>
                                {node.active && <span className="px-1.5 py-0.5 bg-success text-white text-[7px] font-black rounded uppercase tracking-tighter">PRIMARY</span>}
                              </div>
                              <p className="text-[9px] text-on-surface-variant font-bold opacity-60 uppercase tracking-widest">{node.os} • {node.loc}</p>
                            </div>
                          </div>
                          {!node.active && (
                            <button
                              onClick={() => revokeSession(node.id)}
                              className="p-2.5 rounded-xl bg-error/10 text-error hover:bg-error hover:text-white transition-all transform active:scale-90"
                              title="Revoke Access"
                            >
                              <LogOut size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Notifications' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20"><BellRing size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">Alerts <span className="text-secondary italic">& News</span></h3>
                    <p className="text-xs text-on-surface-variant opacity-60 font-bold uppercase tracking-widest mt-0.5">Control how you receive app notifications</p>
                  </div>
                </div>

                <div className="grid gap-6">
                  {[
                    { id: 'budget', title: 'Budget Alerts', desc: 'Notify me when I reach 90% of my monthly budget.', state: notifBudget, toggle: v => setNotifBudget(v) },
                    { id: 'monthly', title: 'Summary Reports', desc: 'Receive a financial summary in your email every month.', state: notifMonthly, toggle: v => setNotifMonthly(v) },
                    { id: 'security', title: 'Security Alerts', desc: 'Updates on login attempts and security events.', state: notifSecurity, toggle: v => setNotifSecurity(v) },
                    { id: 'marketing', title: 'New Features', desc: 'Be the first to know about new tools and updates.', state: notifMarketing, toggle: v => setNotifMarketing(v) }
                  ].map((chan, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 rounded-[2rem] bg-surface-lowest border border-glass-border group hover:bg-surface-container/40 transition-all duration-300">
                      <div className="flex-1 pr-6">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${chan.state ? 'bg-success animate-pulse' : 'bg-on-surface-variant opacity-30'}`} />
                          <h4 className="text-sm font-black text-on-surface uppercase tracking-tight">{chan.title}</h4>
                        </div>
                        <p className="text-[10px] text-on-surface-variant font-bold opacity-40 uppercase tracking-widest leading-relaxed">{chan.desc}</p>
                      </div>
                      <button
                        onClick={() => {
                          const v = !chan.state;
                          chan.toggle(v);
                          handleUpdateSettings({ notifications: { [chan.id]: v } });
                        }}
                        className={`w-14 h-8 rounded-full p-1.5 transition-all duration-300 ${chan.state ? 'bg-primary' : 'bg-surface-low border border-glass-border'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 transform ${chan.state ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-8 rounded-[2.5rem] bg-surface-lowest border border-primary/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-12 translate-x-12 blur-3xl group-hover:bg-primary/10 transition-all duration-500" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Mail size={28} />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-on-surface uppercase italic">On-Demand <span className="not-italic">Intelligence</span></h4>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40 mt-0.5">Generate a detailed summary report immediately</p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        toast.loading('Compiling your intelligence report...', { id: 'report' });
                        try {
                          const res = await fetch(`${API}/api/v1/auth/report/monthly`, { credentials: 'include' });
                          if (!res.ok) throw new Error('Failed to generate report');
                          toast.success('Report sent to your email!', { id: 'report' });
                        } catch (err) {
                          toast.error(err.message, { id: 'report' });
                        }
                      }}
                      className="btn btn-primary px-10 !py-4 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95"
                    >
                      SEND REPORT NOW
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Billing' && (
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary border border-tertiary/20"><CreditCard size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">Billing <span className="text-tertiary italic">& Usage</span></h3>
                    <p className="text-xs text-on-surface-variant opacity-60 font-bold uppercase tracking-widest mt-0.5">Manage your plans and payment methods</p>
                  </div>
                </div>

                <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-surface-lowest to-secondary/5 border border-glass-border shadow-xl relative overflow-hidden">
                  <div className="flex justify-between items-start mb-12 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award size={20} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Current Plan</span>
                      </div>
                      <h4 className="text-4xl font-black text-on-surface uppercase italic">Basic <span className="text-primary not-italic">User</span></h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-50">Monthly Cost</p>
                      <p className="text-2xl font-black text-success uppercase tracking-widest">Free</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-8 bg-surface-lowest/50 p-6 rounded-3xl border border-glass-border relative z-10">
                    <div className="w-16 h-10 bg-on-surface rounded-xl flex items-center justify-center text-primary font-black italic shadow-lg">VISA</div>
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-lg font-black tracking-[0.2em] text-on-surface">•••• •••• •••• 4242</p>
                      <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant opacity-40 mt-1 italic">Linked for primary settlements</p>
                    </div>
                    <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b-2 border-primary hover:opacity-70 transition-all">REPLACE CARD</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Data' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><Database size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">Data <span className="text-primary italic">& Privacy</span></h3>
                    <p className="text-xs text-on-surface-variant opacity-60 font-bold uppercase tracking-widest mt-0.5">Control your information and export records</p>
                  </div>
                </div>

                <div className="grid gap-8">
                  <div className="p-8 rounded-[2rem] bg-surface-lowest border border-glass-border hover:border-primary/20 transition-all group">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 transition-all">
                        <Download size={22} />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-on-surface uppercase tracking-tight">Export Records</h4>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40">Download your history as CSV</p>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed opacity-60 mb-8 italic">
                      Download a full report of your transactions, income, and spending logs.
                    </p>
                    <button
                      onClick={handleDownloadData}
                      className="btn btn-primary w-full justify-center gap-4 !py-4 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                      DOWNLOAD PAYLOAD
                    </button>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-error/5 border border-error/20 group hover:border-error/30 transition-all">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center text-error border border-error/20 group-hover:rotate-12 transition-all">
                        <Trash2 size={22} />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-error uppercase tracking-tight">Remove Account</h4>
                        <p className="text-[10px] text-error font-bold uppercase tracking-widest opacity-40 text-rose-500">Warning: Permanent Action</p>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed opacity-60 mb-8 italic">
                      Completely erase your entire profile and official financial history. This operation cannot be reversed.
                    </p>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="btn btn-danger w-full justify-center gap-4 !py-4 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-error/20"
                    >
                      TERMINATE ACCOUNT
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Registry Termination">
        <div className="space-y-6 pt-2">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-error/5 border border-error/20">
            <div className="p-3 bg-error/10 rounded-xl text-error shrink-0"><ShieldAlert size={28} /></div>
            <div>
              <h4 className="text-sm font-black text-on-surface uppercase tracking-tight">Irreversible Action</h4>
              <p className="text-[11px] font-bold text-on-surface-variant opacity-80 leading-relaxed">This will permanently destroy your user profile and all associated registry data.</p>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest text-center italic opacity-60 px-8">All financial logs and personal nodes will be cleared from the system.</p>
          <div className="flex gap-4">
            <button onClick={() => setIsDeleteModalOpen(false)} className="btn btn-outline flex-1 py-4 uppercase font-black text-[10px] tracking-widest">Abort</button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn btn-danger flex-1 py-4 uppercase font-black text-[10px] tracking-widest shadow-xl shadow-error/20"
            >
              {deleting ? 'Terminating...' : 'Destroy Now'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Settings;
