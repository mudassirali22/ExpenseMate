import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Plus, CreditCard, X, Trash2, Calendar, TrendingUp, ShieldCheck,
  Clock, Layers, Filter, Edit2, AlertCircle, PlayCircle, Zap,
  Cloud, Heart, Settings
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import Modal from '../../components/common/Modal';

// Category to Icon mapping
const CATEGORY_ICONS = {
  Entertainment: <PlayCircle size={24} />,
  Software: <Zap size={24} />,
  Utility: <CreditCard size={24} />,
  Health: <Heart size={24} />,
  Cloud: <Cloud size={24} />,
  Education: <Clock size={24} />,
  Other: <Settings size={24} />
};

const Subscriptions = () => {
  const { API, currencySymbol } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSub, setCurrentSub] = useState(null);

  // Inline Editing States
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    amount: '',
    category: 'Entertainment',
    billingCycle: 'Monthly',
    nextBillingDate: ''
  });
  const [isSavingInline, setIsSavingInline] = useState(false);

  const [filterCategory, setFilterCategory] = useState('All');
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Entertainment',
    billingCycle: 'Monthly',
    nextBillingDate: new Date().toISOString().split('T')[0],
    customCategory: ''
  });

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch(`${API}/api/v1/subscription/get`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setSubscriptions(data.data);
    } catch (err) {
      toast.error("Failed to sync subscriptions");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSubscriptions(); }, [API]);

  // Extract dynamic categories
  const categories = useMemo(() => {
    const base = ['Entertainment', 'Software', 'Utility', 'Health', 'Cloud', 'Education'];
    const fromData = subscriptions.map(s => s.category);
    return Array.from(new Set([...base, ...fromData]));
  }, [subscriptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalCategory = formData.category === 'New Category' ? formData.customCategory : formData.category;

    if (!finalCategory) {
      toast.error("Please specify a category");
      return;
    }

    const payload = {
      name: formData.name,
      amount: formData.amount,
      category: finalCategory,
      billingCycle: formData.billingCycle,
      nextBillingDate: formData.nextBillingDate
    };

    try {
      const url = isEditMode ? `${API}/api/v1/subscription/update/${currentSub._id}` : `${API}/api/v1/subscription/add`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isEditMode ? "Change saved!" : "Service added!");
        closeModal();
        fetchSubscriptions();
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (err) {
      toast.error("System error");
    }
  };

  const handleEdit = (sub) => {
    setCurrentSub(sub);
    setIsEditMode(true);
    setFormData({
      name: sub.name,
      amount: sub.amount,
      category: sub.category,
      billingCycle: sub.billingCycle,
      nextBillingDate: sub.nextBillingDate?.split('T')[0] || '',
      customCategory: ''
    });
    setIsModalOpen(true);
  };

  const startInlineEdit = (sub) => {
    setEditingId(sub._id);
    setEditFormData({
      name: sub.name,
      amount: sub.amount,
      category: sub.category,
      billingCycle: sub.billingCycle,
      nextBillingDate: sub.nextBillingDate?.split('T')[0] || ''
    });
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditFormData({ name: '', amount: '', category: 'Entertainment', billingCycle: 'Monthly', nextBillingDate: '' });
  };

  const handleInlineSave = async (id) => {
    if (!editFormData.name || !editFormData.amount || !editFormData.nextBillingDate) {
      return toast.error('Required fields missing');
    }
    setIsSavingInline(true);
    try {
      const res = await fetch(`${API}/api/v1/subscription/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Service Updated");
        setEditingId(null);
        fetchSubscriptions();
      }
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsSavingInline(false);
    }
  };

  const openDeleteModal = (sub) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2">
          <Trash2 size={16} className="text-error" />
          <span className="text-xs font-bold font-sans text-on-surface">Confirm Service Removal</span>
        </div>
        <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed">
          Unsubscribe from <span className="text-error font-bold">{sub.name}</span>? This will permanently remove the record from your vault.
        </p>
        <div className="flex justify-end gap-2 mt-1">
          <button onClick={() => toast.dismiss(t.id)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface transition-all">Cancel</button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await fetch(`${API}/api/v1/subscription/delete/${sub._id}`, {
                  method: 'DELETE',
                  credentials: 'include'
                });
                const data = await res.json();
                if (data.success) {
                  toast.success("Service removed", { id: 'del-succ-sub', duration: 3000 });
                  fetchSubscriptions();
                } else {
                  toast.error(data.message || "Delete failed");
                }
              } catch (err) {
                toast.error("System error");
              }
            }}
            className="btn btn-danger !py-1.5 !px-3 !text-[10px]"
          >
            Delete Now
          </button>
        </div>
      </div>
    ), { duration: Infinity, className: '!bg-surface-container !border !border-glass-border !rounded-2xl !shadow-2xl' });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentSub(null);
    setFormData({
      name: '',
      amount: '',
      category: 'Entertainment',
      billingCycle: 'Monthly',
      nextBillingDate: new Date().toISOString().split('T')[0],
      customCategory: ''
    });
  };

  const filteredSubscriptions = useMemo(() => {
    if (filterCategory === 'All') return subscriptions;
    return subscriptions.filter(s => s.category === filterCategory);
  }, [subscriptions, filterCategory]);

  const monthlyBurn = subscriptions.reduce((acc, s) => {
    const amt = Number(s.amount) || 0;
    return acc + (s.billingCycle === 'Yearly' ? amt / 12 : amt);
  }, 0);

  const yearlyBurn = monthlyBurn * 12;

  const categoryData = useMemo(() => {
    const counts = {};
    subscriptions.forEach(s => {
      const amt = s.billingCycle === 'Yearly' ? s.amount / 12 : s.amount;
      counts[s.category] = (counts[s.category] || 0) + (Number(amt) || 0);
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [subscriptions]);

  // Sort upcoming
  const upcomingRenewals = useMemo(() => {
    return [...subscriptions]
      .sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate))
      .slice(0, 3);
  }, [subscriptions]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in-up pb-28">

      {/* Header */}
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={14} className="text-secondary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant opacity-80">Recurring Bills</span>
          </div>
          <h1 className="page-title text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">Subscriptions</h1>
          <p className="page-subtitle text-sm mt-1 text-on-surface-variant">Track your monthly and yearly bills in one place.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary px-6 flex-1 md:flex-none justify-center">
            <Plus size={16} /> Add Service
          </button>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-2 stat-card relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <p className="stat-label">Monthly Spending</p>
            <h3 className="stat-value text-3xl sm:text-4xl">{currencySymbol} {monthlyBurn.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            <div className="flex items-center gap-2 mt-3">
              <div className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Active Burn Rate</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <p className="stat-label mb-0">Yearly Total</p>
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary"><TrendingUp size={16} /></div>
          </div>
          <h4 className="text-2xl font-bold text-on-surface mt-1">{currencySymbol} {yearlyBurn.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
          <div className="progress-bar !h-1 bg-background mt-4 overflow-hidden">
            <div className="progress-fill bg-secondary" style={{ width: '100%' }} />
          </div>
          <p className="text-[9px] font-bold text-on-surface-variant mt-2 uppercase tracking-widest opacity-60">Projected Burn</p>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <p className="stat-label mb-0">Total Services</p>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Layers size={16} /></div>
          </div>
          <h4 className="text-2xl font-bold text-on-surface mt-1">{subscriptions.length} Listed</h4>
          <div className="flex -space-x-1.5 mt-4">
            {subscriptions.slice(0, 5).map((s, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[8px] font-black text-primary">
                {s.name.charAt(0)}
              </div>
            ))}
          </div>
          <p className="text-[9px] font-bold text-on-surface-variant mt-2 uppercase tracking-widest opacity-60">Verified Records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Analytics Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="stat-card">
            <h3 className="section-title text-sm mb-6">Spending Analysis</h3>
            {categoryData.length > 0 ? (
              <>
                <div className="h-[200px] w-full relative min-h-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                        animationDuration={1500}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ background: 'var(--color-surface-container)', border: '1px solid var(--color-glass-border)', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-tighter opacity-40">Diversity</span>
                    <span className="text-xl font-black text-primary leading-none">{categoryData.length}</span>
                  </div>
                </div>
                <div className="space-y-2 mt-6">
                  {categoryData.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-on-surface-variant uppercase tracking-wider">{item.name}</span>
                      </div>
                      <span className="text-on-surface">{currencySymbol} {item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-center opacity-20">
                <p className="text-[10px] font-black uppercase tracking-widest italic">Awaiting service data</p>
              </div>
            )}
          </div>

          <div className="stat-card bg-primary/5 border-primary/20">
            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Upcoming Renewals</h3>
            <div className="space-y-3">
              {upcomingRenewals.length > 0 ? upcomingRenewals.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-lowest border border-glass-border">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-on-surface truncate">{s.name}</p>
                    <p className="text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-tighter">{new Date(s.nextBillingDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-on-surface">{currencySymbol} {s.amount}</p>
                  </div>
                </div>
              )) : (
                <p className="text-[10px] text-center font-bold text-on-surface-variant opacity-30 py-4 uppercase italic">No pending renewals</p>
              )}
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="section-title mb-0">List of Services</h3>
            <div className="flex items-center gap-2 bg-surface-container/50 border border-glass-border rounded-xl px-4 py-2">
              <Filter size={12} className="text-on-surface-variant opacity-40" />
              <select
                className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none text-on-surface cursor-pointer"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSubscriptions.length > 0 ? filteredSubscriptions.map((sub) => {
              const itemToUse = editingId === sub._id ? { ...sub, ...editFormData } : sub;
              const daysLeft = Math.ceil((new Date(itemToUse.nextBillingDate) - new Date()) / (1000 * 60 * 60 * 24));
              const annualPrice = itemToUse.billingCycle === 'Yearly' ? Number(itemToUse.amount) : Number(itemToUse.amount) * 12;
              const isDueSoon = daysLeft <= 5 && daysLeft >= 0;
              const isEditing = editingId === sub._id;

              return (
                <div key={sub._id} className="stat-card flex flex-col group hover:border-primary/40 transition-all duration-300 relative overflow-hidden">
                  {!isEditing && (
                    <div className="absolute top-0 right-0 p-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex gap-2 z-20">
                      <button onClick={() => startInlineEdit(sub)} className="p-2 bg-surface-container rounded-lg text-primary hover:bg-primary hover:text-white transition-all"><Edit2 size={12} /></button>
                      <button onClick={() => openDeleteModal(sub)} className="p-2 bg-surface-container rounded-lg text-error hover:bg-error hover:text-white transition-all"><Trash2 size={12} /></button>
                    </div>
                  )}

                  <div className="flex gap-4 mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                      {CATEGORY_ICONS[isEditing ? editFormData.category : sub.category] || <Clock size={20} />}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            className="w-full bg-surface-container border border-glass-border rounded-lg px-2 py-1 text-base font-black text-on-surface focus:border-primary outline-none"
                          />
                          <div className="relative">
                            <select
                              value={editFormData.category}
                              onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                              className="w-full bg-surface-container border border-glass-border rounded-lg px-2 py-1 text-[10px] font-bold text-on-surface focus:border-primary outline-none appearance-none cursor-pointer"
                            >
                              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <Settings size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none opacity-50" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-black text-on-surface truncate tracking-tight">{sub.name}</h3>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${isDueSoon ? 'bg-error text-white' : 'bg-success/10 text-success'}`}>
                              {isDueSoon ? 'Immediate' : 'Scheduled'}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">{sub.category}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                    <div className="p-3 bg-surface-lowest rounded-xl border border-glass-border">
                      <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tighter opacity-40 mb-1">Billing Amount</p>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold">{currencySymbol}</span>
                          <input
                            type="number"
                            value={editFormData.amount}
                            onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                            className="w-full bg-transparent border-none text-base font-black text-on-surface focus:ring-0 p-0 outline-none"
                          />
                        </div>
                      ) : (
                        <p className="text-base font-black text-on-surface">{currencySymbol} {sub.amount.toLocaleString()}</p>
                      )}
                      {isEditing ? (
                        <select
                          value={editFormData.billingCycle}
                          onChange={(e) => setEditFormData({ ...editFormData, billingCycle: e.target.value })}
                          className="bg-transparent text-[8px] font-bold text-primary uppercase mt-0.5 border-none p-0 focus:ring-0 outline-none"
                        >
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Yearly</option>
                        </select>
                      ) : (
                        <p className="text-[8px] font-bold text-primary uppercase mt-0.5">{sub.billingCycle}</p>
                      )}
                    </div>
                    <div className="p-3 bg-secondary/5 rounded-xl border border-secondary/20">
                      <p className="text-[9px] font-bold text-secondary uppercase tracking-tighter opacity-40 mb-1">Yearly Cost</p>
                      <p className="text-base font-black text-secondary">{currencySymbol} {annualPrice.toLocaleString()}</p>
                      <p className="text-[8px] font-bold text-secondary uppercase mt-0.5">Annual Total</p>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4 relative z-10">
                      <div>
                        <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Next Billing</label>
                        <input
                          type="date"
                          value={editFormData.nextBillingDate}
                          onChange={(e) => setEditFormData({ ...editFormData, nextBillingDate: e.target.value })}
                          className="w-full bg-surface-container border border-glass-border rounded-lg px-2 py-1.5 text-[11px] font-bold text-on-surface focus:border-primary outline-none mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleInlineSave(sub._id)}
                          disabled={isSavingInline}
                          className="flex-1 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                        >
                          {isSavingInline ? '...' : 'SAVE'}
                        </button>
                        <button
                          onClick={cancelInlineEdit}
                          className="flex-1 py-1.5 bg-surface-container text-on-surface-variant text-[10px] font-bold rounded-lg hover:bg-surface-container-high transition-all"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto flex justify-between items-center text-[10px] font-bold border-t border-glass-border pt-4 relative z-10">
                      <span className="text-on-surface-variant flex items-center gap-1.5 opacity-60 uppercase"><Calendar size={12} /> {new Date(sub.nextBillingDate).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded ${isDueSoon ? 'text-error' : 'text-on-surface'}`}>T-{daysLeft} Days</span>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="md:col-span-2 py-24 text-center stat-card border-dashed border-2 opacity-30 flex flex-col items-center">
                <Plus size={40} className="mb-4 text-on-surface-variant" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">No services found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditMode ? "Modify Service" : "New Service"}>
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Service Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field !py-4 font-bold" placeholder="e.g. Netflix, Amazon" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Cost ({currencySymbol})</label>
              <input required type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="input-field !py-4 font-bold" placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Cycle</label>
              <select value={formData.billingCycle} onChange={e => setFormData({ ...formData, billingCycle: e.target.value })} className="input-field !py-4 font-bold cursor-pointer">
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Renewal Date</label>
              <input required type="date" value={formData.nextBillingDate} onChange={e => setFormData({ ...formData, nextBillingDate: e.target.value })} className="input-field !py-4 font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Category</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="input-field !py-4 font-bold cursor-pointer">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                <option value="New Category">+ Add New...</option>
              </select>
            </div>
          </div>

          {formData.category === 'New Category' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Category Name</label>
              <input required type="text" value={formData.customCategory} onChange={e => setFormData({ ...formData, customCategory: e.target.value })} className="input-field !py-4 font-bold border-primary/40 bg-primary/5" placeholder="e.g. Work, Gym" />
            </div>
          )}

          <button type="submit" className="w-full btn btn-primary py-4 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
            {isEditMode ? "Save Changes" : "Add Service"}
          </button>
        </form>
      </Modal>

    </div>
  );
};

export default Subscriptions;
