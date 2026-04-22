import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Wallet, PieChart, TrendingUp, Trash2, Plus, AlertCircle, CheckCircle2,
  ArrowUpRight, ArrowDownRight, Info, Home, Utensils, Car, ShoppingBag,
  Activity, GraduationCap, Receipt, Bolt, HelpCircle, CalendarClock,
  TrendingDown, Briefcase, Heart, Stethoscope, Pencil, X, AlignLeft, ChevronDown, Filter
} from 'lucide-react';

const categoryConfig = {
  Housing: { icon: Home, color: 'primary' },
  Food: { icon: Utensils, color: 'error' },
  Entertainment: { icon: Activity, color: 'secondary' },
  Transport: { icon: Car, color: 'primary' },
  Shopping: { icon: ShoppingBag, color: 'tertiary' },
  Health: { icon: Stethoscope, color: 'primary' },
  Education: { icon: GraduationCap, color: 'secondary' },
  Bills: { icon: Receipt, color: 'tertiary' },
  Utilities: { icon: Bolt, color: 'primary' },
  Other: { icon: HelpCircle, color: 'primary' },
};

const BudgetModal = ({ isOpen, onClose, onRefresh, API, currencySymbol, initialData = null, categoryConfig }) => {
  const [formData, setFormData] = useState({
    name: '', category: '', limit: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        limit: initialData.limit || ''
      });
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setFormData({ name: '', category: '', limit: '' });
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.limit) return toast.error('All fields are required');
    setLoading(true);
    try {
      const endpoint = initialData
        ? `${API}/api/v1/budgets/update/${initialData._id}`
        : `${API}/api/v1/budgets/add`;

      const method = initialData ? 'PUT' : 'POST';
      const payload = {
        name: formData.name,
        category: formData.category,
        limit: Number(formData.limit)
      };

      const res = await fetch(endpoint, {
        method, headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(initialData ? 'Budget updated!' : 'Budget created!');
        resetForm(); onClose(); onRefresh();
      } else {
        const d = await res.json();
        toast.error(d.message || 'Failed to save');
      }
    } catch { toast.error('Connection error'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4 animate-fade-in text-on-surface">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-surface-bright rounded-3xl shadow-2xl overflow-hidden border border-glass-border">
        <div className="bg-surface-lowest px-6 py-4 border-b border-glass-border flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold text-on-surface tracking-tight">{initialData ? 'Edit' : 'New'} Budget Quota</h2>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant font-black">{initialData ? 'Update Protocol' : 'Spending Controls'}</p>
          </div>
          <button onClick={handleClose} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Budget Name</label>
              <div className="relative">
                <AlignLeft size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                <input required type="text" placeholder="e.g. Daily Groceries, Rent, Fuel..."
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface-lowest border border-glass-border rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Category</label>
                <div className="relative">
                  <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none" />
                  <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-surface-lowest border border-glass-border rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all appearance-none cursor-pointer">
                    <option value="" disabled>Select Category</option>
                    {Object.keys(categoryConfig).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Limit Amount ({currencySymbol})</label>
                <div className="relative">
                  <Wallet size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none" />
                  <input required type="number" placeholder="5000"
                    value={formData.limit} onChange={e => setFormData({ ...formData, limit: e.target.value })}
                    className="w-full bg-surface-lowest border border-glass-border rounded-xl pl-9 pr-4 py-2.5 text-[13px] font-bold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2">
              {loading ? 'Saving...' : <><CheckCircle2 size={16} /> {initialData ? 'Update Protocol' : 'Deploy Budget'}</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const Budgets = () => {
  const { API, currencySymbol } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  // Inline Editing States
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', limit: '', category: '' });
  const [isSavingInline, setIsSavingInline] = useState(false);


  const refreshAll = async () => {
    try {
      await Promise.all([fetchData(), fetchTransactions()]);
    } catch (err) {
      console.error('Unified Sync Failed', err);
    }
  };

  useEffect(() => {
    refreshAll();

    // Global visibility sync for absolute real-time feel
    const handleFocus = () => refreshAll();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/budgets/get`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBudgets(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error("Failed to sync budgets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API}/api/v1/expenses/transactions?limit=5000`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
      }
    } catch (err) {
      console.error('Failed to load transactions', err);
    }
  };

  const openEditModal = (budget) => {
    setSelectedBudget(budget);
    setShowEditModal(true);
  };

  const startInlineEdit = (budget) => {
    setEditingId(budget._id);
    setEditFormData({
      name: budget.name,
      limit: budget.limit,
      category: budget.category
    });
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditFormData({ name: '', limit: '', category: '' });
  };

  const handleInlineSave = async (id) => {
    if (!editFormData.name || !editFormData.limit || !editFormData.category) {
      return toast.error('All fields are required');
    }
    setIsSavingInline(true);
    try {
      const res = await fetch(`${API}/api/v1/budgets/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...editFormData,
          limit: Number(editFormData.limit)
        }),
      });

      if (res.ok) {
        toast.success('Budget Updated');
        setEditingId(null);
        refreshAll();
      } else {
        const d = await res.json();
        toast.error(d.message || 'Update failed');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setIsSavingInline(false);
    }
  };

  const confirmDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2">
          <Trash2 size={16} className="text-error" />
          <span className="text-xs font-bold font-sans text-on-surface">Confirm Budget Removal</span>
        </div>
        <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed">
          Remove this budget protocol? This action is permanent and will clear all associated limits.
        </p>
        <div className="flex justify-end gap-2 mt-1" onPointerDownCapture={(e) => e.stopPropagation()}>
          <button onClick={() => toast.dismiss(t.id)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface transition-all">Cancel</button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await fetch(`${API}/api/v1/budgets/delete/${id}`, { method: 'DELETE', credentials: 'include' });
                if (res.ok) {
                  toast.success("Budget removed", { id: 'del-succ-budg', duration: 3000 });
                  refreshAll();
                } else {
                  toast.error("Deletion failure");
                }
              } catch (err) {
                toast.error("Error during deletion");
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

  const totalBudget = budgets.reduce((s, b) => s + (b.limit || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const utilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const remainingValue = Math.max(totalBudget - totalSpent, 0);

  // Detailing logic
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = lastDay - now.getDate() + 1;
  const safeDailySpend = daysRemaining > 0 ? (remainingValue / daysRemaining) : 0;

  if (loading) return (
    <div className="page-container flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="page-container animate-fade-in-up pb-10">

      {/* Header */}
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={14} className="text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant opacity-80">Spending Protocols</span>
          </div>
          <h1 className="page-title text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">Budgets</h1>
          <p className="page-subtitle text-sm mt-1 text-on-surface-variant">Define and monitor your spending limits by category.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary px-5 gap-2 justify-center flex-1 md:flex-none">
          <Plus size={15} /> New Budget
        </button>
      </div>

      {/* Global consumption cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10">
        <div className="md:col-span-2 stat-card flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <PieChart size={100} className="text-primary" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div className="flex-1 w-full sm:w-auto">
              <p className="stat-label">Total Monthly Usage</p>
              <div className="flex items-end gap-3 mb-6">
                <h3 className="stat-value text-3xl sm:text-4xl">{utilization}%</h3>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 mb-2">Used</p>
              </div>
              <div className="progress-bar h-2.5">
                <div
                  className={`progress-fill ${utilization > 90 ? 'bg-error shadow-[0_0_12px_rgba(244,63,94,0.3)]' : 'bg-primary shadow-[0_0_12px_rgba(59,130,246,0.3)]'}`}
                  style={{ width: `${Math.min(utilization, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-surface-lowest/50 border border-glass-border rounded-2xl p-4 min-w-[180px]">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingDown size={12} className="text-success" />
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Recommended Daily Spend</span>
              </div>
              <p className="text-xl font-black text-on-surface tracking-tighter">{currencySymbol} {Math.max(0, Math.floor(safeDailySpend)).toLocaleString()}</p>
              <p className="text-[9px] font-bold text-success/80 uppercase tracking-widest mt-1 italic">Stay under this limit</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="stat-card py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Wallet size={16} />
              </div>
              <p className="stat-label mb-0">Monthly Quota</p>
            </div>
            <h3 className="stat-value">{currencySymbol} {totalBudget.toLocaleString()}</h3>
          </div>
          <div className="stat-card py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                <TrendingUp size={16} />
              </div>
              <p className="stat-label mb-0">Remaining Budget</p>
            </div>
            <h3 className="stat-value">{currencySymbol} {remainingValue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Budget Allocation Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {budgets.map(budget => {
          const progress = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
          const isOver = progress > 100;
          const isEditing = editingId === budget._id;
          const cfg = categoryConfig[budget.category] || categoryConfig['Other'];

          return (
            <div key={budget._id} className="stat-card group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-${cfg.color}/10 border border-${cfg.color}/20 flex items-center justify-center text-${cfg.color}`}>
                    {isEditing ? (
                      <div className="relative">
                        <select
                          value={editFormData.category}
                          onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        >
                          {Object.keys(categoryConfig).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <cfg.icon size={20} />
                      </div>
                    ) : (
                      <cfg.icon size={20} />
                    )}
                  </div>
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1 text-sm font-black text-on-surface uppercase tracking-tight focus:border-primary outline-none"
                      />
                    ) : (
                      <>
                        <h3 className="text-sm font-black text-on-surface uppercase tracking-tight">{budget.name || budget.category}</h3>
                        <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">{budget.category}</p>
                      </>
                    )}
                  </div>
                </div>
                {!isEditing && (
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${isOver ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                      {isOver ? 'Breach' : 'Secure'}
                    </span>
                    <button onClick={() => startInlineEdit(budget)} className="p-2 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => confirmDelete(budget._id)} className="p-2 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 mb-1">Spent</p>
                    <p className="text-lg font-bold text-on-surface">{currencySymbol} {budget.spent.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 mb-1">Limit</p>
                    {isEditing ? (
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-xs font-bold text-primary">{currencySymbol}</span>
                        <input
                          type="number"
                          value={editFormData.limit}
                          onChange={(e) => setEditFormData({ ...editFormData, limit: e.target.value })}
                          className="w-24 bg-surface-lowest border border-glass-border rounded-lg px-2 py-1 text-sm font-bold text-primary text-right focus:border-primary outline-none"
                        />
                      </div>
                    ) : (
                      <p className="text-lg font-bold text-primary">{currencySymbol} {budget.limit.toLocaleString()}</p>
                    )}
                  </div>
                </div>

                {!isEditing ? (
                  <>
                    <div className="progress-bar h-2">
                      <div
                        className={`progress-fill ${isOver ? 'bg-error' : progress > 80 ? 'bg-secondary' : 'bg-primary'}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
                      <div className="flex items-center gap-1.5">
                        <CalendarClock size={10} className="text-secondary opacity-60" />
                        <span>{daysRemaining} Days Left</span>
                      </div>
                      <span className={isOver ? 'text-error' : 'opacity-40'}>
                        {isOver ? `Over by ${currencySymbol} ${(budget.spent - budget.limit).toLocaleString()}` : `Remaining: ${currencySymbol} ${(budget.limit - budget.spent).toLocaleString()}`}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleInlineSave(budget._id)}
                      disabled={isSavingInline}
                      className="flex-1 py-2 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                      {isSavingInline ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                    <button
                      onClick={cancelInlineEdit}
                      className="flex-1 py-2 bg-surface-container text-on-surface-variant text-[10px] font-bold rounded-lg hover:bg-surface-container-high transition-all"
                    >
                      CANCEL
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Budget Entry */}
        <div
          onClick={() => setShowAddModal(true)}
          className="rounded-2xl border-2 border-dashed border-glass-border flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-surface-lowest transition-all group min-h-[220px] bg-surface-lowest/40"
        >
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus size={24} className="text-primary" />
          </div>
          <h4 className="font-bold text-on-surface">Create Budget</h4>
          <p className="text-xs text-on-surface-variant mt-2">Set a new spending limit for a category.</p>
        </div>
      </div>

      {/* Unified Budget Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <BudgetModal
            isOpen={showAddModal || showEditModal}
            onClose={() => { setShowAddModal(false); setShowEditModal(false); setSelectedBudget(null); }}
            onRefresh={refreshAll}
            API={API}
            currencySymbol={currencySymbol}
            initialData={selectedBudget}
            categoryConfig={categoryConfig}
          />
        )}
      </AnimatePresence>

      {/* History Matrix */}
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title mb-0">Monthly Budget History</h2>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-50 mt-1">Track your spending month by month</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-lowest border border-glass-border rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Live Sync</span>
          </div>
        </div>

        <div className="stat-card !p-0 overflow-hidden border border-glass-border shadow-2xl shadow-primary/5">
          <div className="overflow-x-auto">
            <table className="data-table w-full text-left">
              <thead>
                <tr className="bg-surface-container/30">
                  <th className="px-6 py-4 !text-[10px] font-black uppercase tracking-widest opacity-60">Month</th>
                  <th className="px-6 py-4 !text-[10px] font-black uppercase tracking-widest opacity-60">Main Category</th>
                  <th className="px-6 py-4 !text-[10px] font-black uppercase tracking-widest opacity-60">Total Spent</th>
                  <th className="px-6 py-4 !text-[10px] font-black uppercase tracking-widest opacity-60">Budget Used</th>
                  <th className="px-6 py-4 !text-[10px] font-black uppercase tracking-widest opacity-60">Balance Left</th>
                  <th className="px-6 py-4 text-right pr-8 !text-[10px] font-black uppercase tracking-widest opacity-60">Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - i);
                  const isCurrent = i === 0;

                  // Precise monthly filtering (Expenses Only)
                  const mExpenses = transactions.filter(t => {
                    const td = new Date(t.date || t.createdAt);
                    return td.getUTCMonth() === d.getUTCMonth() &&
                      td.getUTCFullYear() === d.getUTCFullYear() &&
                      t.type === 'expense';
                  });

                  const mSpent = mExpenses.reduce((sum, t) => sum + (t.amount || 0), 0);
                  const burnRate = totalBudget > 0 ? Math.round((mSpent / totalBudget) * 100) : 0;
                  const mRemaining = totalBudget - mSpent;
                  const isHealthy = mRemaining >= 0;

                  // Detect Top Category for the month
                  const catMap = mExpenses.reduce((acc, t) => {
                    acc[t.category] = (acc[t.category] || 0) + t.amount;
                    return acc;
                  }, {});
                  const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

                  // Only show if there was any historical activity (actual spending or current month)
                  if (mSpent === 0 && !isCurrent) return null;

                  return (
                    <tr key={i} className="hover:bg-primary/[0.02] transition-colors border-b border-glass-border/30 last:border-0 group">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-[11px] font-black shrink-0 transition-all group-hover:scale-110 ${isCurrent ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' : 'bg-surface-lowest text-primary border-glass-border'}`}>
                            {d.toLocaleString('en-US', { month: 'short' }).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-sm text-on-surface uppercase tracking-tight">
                              {d.toLocaleString('en-US', { month: 'long' })}
                            </p>
                            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-50">{d.getFullYear()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary/40"></div>
                          <span className="text-[10px] font-black text-on-surface uppercase tracking-widest opacity-80">{topCat}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-mono text-xs text-on-surface font-bold">{currencySymbol} {mSpent.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3 min-w-[120px]">
                          <div className="flex-1 progress-bar h-1.5">
                            <div
                              className={`progress-fill ${burnRate > 100 ? 'bg-error' : burnRate > 80 ? 'bg-secondary' : 'bg-primary'}`}
                              style={{ width: `${Math.min(burnRate, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-black text-on-surface-variant w-8">{burnRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`font-mono text-xs font-bold ${isHealthy ? 'text-success' : 'text-error'}`}>
                          {currencySymbol} {Math.abs(mRemaining).toLocaleString()}
                        </span>
                      </td>
                      <td className="text-right px-6 pr-10">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isHealthy ? 'text-success bg-success/10 border border-success/20' : 'text-error bg-error/10 border border-error/20'}`}>
                          {isHealthy ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {isHealthy ? 'On Track' : 'Over Budget'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>



    </div>
  );
};

export default Budgets;
