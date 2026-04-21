import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Trash2, Plus, Download, Search, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, Target, FileText, Activity, CreditCard,
  Users, X, Calendar, Filter, SlidersHorizontal, ChevronDown,
  CheckCircle2, Wallet, Paperclip, ArrowUpRight, AlignLeft, Database, Pencil
} from 'lucide-react';

const EXPENSE_CATEGORIES = [
  { id: 'Housing' },
  { id: 'Food' },
  { id: 'Transport' },
  { id: 'Shopping' },
  { id: 'Health' },
  { id: 'Education' },
  { id: 'Entertainment' },
  { id: 'Bills' },
  { id: 'Utilities' },
  { id: 'Other' },
];
const INCOME_CATEGORIES = [
  { id: 'Salary' },
  { id: 'Freelancing' },
  { id: 'Investments' },
  { id: 'Gift' },
  { id: 'Other' },
];

const TYPE_COLORS = {
  income: 'bg-success/10 text-success',
  portfolio: 'bg-secondary/10 text-secondary',
  Tax: 'bg-warning/10 text-warning',
  Subscription: 'bg-primary/10 text-primary',
  Shared: 'bg-tertiary/10 text-tertiary',
  expense: 'bg-error/10 text-error',
};

const getTypeIcon = (item) => {
  if (item.type === 'income') return <TrendingUp size={15} />;
  if (item.type === 'portfolio') return <Activity size={15} />;
  if (item.displayType === 'Tax') return <FileText size={15} />;
  if (item.displayType === 'Subscription') return <CreditCard size={15} />;
  if (item.displayType === 'Shared') return <Users size={15} />;
  return <TrendingDown size={15} />;
};

const getTypeColorKey = (item) => {
  if (item.type === 'income') return 'income';
  if (item.type === 'portfolio') return 'portfolio';
  if (item.displayType === 'Tax') return 'Tax';
  if (item.displayType === 'Subscription') return 'Subscription';
  if (item.displayType === 'Shared') return 'Shared';
  return 'expense';
};

const TransactionModal = ({ isOpen, onClose, onRefresh, API, currencySymbol, initialData = null }) => {
  const [type, setType] = useState('expense');
  const [formData, setFormData] = useState({
    title: '', amount: '', category: '', date: new Date().toISOString().split('T')[0], notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount || '',
        category: initialData.category || initialData.source || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: initialData.notes || ''
      });
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const resetForm = () => {
    setType('expense');
    setFormData({ title: '', amount: '', category: '', date: new Date().toISOString().split('T')[0], notes: '' });
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.title) return toast.error('Title and amount are required');
    if (!formData.category) return toast.error('Please select a category');
    setLoading(true);
    try {
      let endpoint;
      let method = initialData ? 'PUT' : 'POST';

      if (initialData) {
        endpoint = type === 'expense'
          ? `${API}/api/v1/expenses/update/${initialData._id}`
          : `${API}/api/v1/income/update/${initialData._id}`;
      } else {
        endpoint = type === 'expense'
          ? `${API}/api/v1/expenses/add`
          : `${API}/api/v1/income/addIncome`;
      }

      const payload = type === 'expense'
        ? { title: formData.title, amount: Number(formData.amount), category: formData.category, date: formData.date, notes: formData.notes, method: 'Cash / Other' }
        : { title: formData.title, amount: Number(formData.amount), source: formData.category, date: formData.date, notes: formData.notes };

      const res = await fetch(endpoint, {
        method, headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(initialData ? 'Transaction updated!' : (type === 'expense' ? 'Expense added!' : 'Income recorded!'));
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
      <div className="relative w-full max-w-md bg-surface-bright rounded-3xl shadow-2xl overflow-hidden border border-glass-border">
        <div className="bg-surface-lowest px-6 py-4 border-b border-glass-border flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold text-on-surface tracking-tight">{initialData ? 'Edit' : 'Add'} Transaction</h2>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant font-black">{initialData ? 'Update Record' : 'New Entry'}</p>
          </div>
          <button onClick={handleClose} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {!initialData && (
            <div className="flex bg-surface-lowest border border-glass-border p-1 rounded-2xl mb-5">
              {['expense', 'income'].map(t => (
                <button key={t} type="button" onClick={() => { setType(t); setFormData(f => ({ ...f, category: '' })); }}
                  className={`flex-1 py-1.5 rounded-xl font-bold text-[11px] transition-all capitalize relative z-10 ${type === t ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
                  {type === t && (
                    <motion.div
                      layoutId="add-entry-type-indicator"
                      className="absolute inset-0 bg-primary/10 border border-primary/20 shadow-sm rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{t}</span>
                </button>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Description</label>
              <div className="relative">
                <AlignLeft size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                <input required type="text" placeholder="What was this for?"
                  value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-surface-lowest border border-glass-border rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all" />
              </div>
            </div>

            {/* Amount + Date row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Amount ({currencySymbol})</label>
                <input required type="number" placeholder="0"
                  value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-surface-lowest border border-glass-border rounded-xl px-4 py-2.5 text-[13px] font-bold text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Date</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none" />
                  <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-surface-lowest border border-glass-border rounded-xl pl-9 pr-3 py-2 text-[12px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all" />
                </div>
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Category</label>
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none" />
                <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-surface-lowest border border-glass-border rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all appearance-none cursor-pointer">
                  <option value="" disabled>Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.id}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none" />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Notes <span className="opacity-50">(optional)</span></label>
              <textarea rows={2} placeholder="Add a quick note..."
                value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-surface-lowest border border-glass-border rounded-xl px-4 py-2.5 text-[12px] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all resize-none" />
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2">
              {loading ? 'Saving...' : <><CheckCircle2 size={16} /> Save {type === 'expense' ? 'Expense' : 'Income'}</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Transactions = () => {
  const { API, currencySymbol } = useAuth();
  const navigate = useNavigate();

  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Filters
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 15;

  // Inline Edit State
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', amount: '', category: '', date: '', notes: '' });
  const [isSavingInline, setIsSavingInline] = useState(false);

  const startInlineEdit = (item) => {
    setEditingId(item._id);
    setEditFormData({
      title: item.title,
      amount: item.amount,
      category: item.category || item.source || '',
      date: new Date(item.date || item.createdAt).toISOString().split('T')[0],
      notes: item.notes || ''
    });
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditFormData({ title: '', amount: '', category: '', date: '', notes: '' });
  };

  const handleInlineSave = async (item) => {
    if (!editFormData.title || !editFormData.amount || !editFormData.category) {
      return toast.error('Check all fields');
    }
    setIsSavingInline(true);
    try {
      const endpoint = item.type === 'expense'
        ? `${API}/api/v1/expenses/update/${item._id}`
        : `${API}/api/v1/income/update/${item._id}`;

      const payload = item.type === 'expense'
        ? { title: editFormData.title, amount: Number(editFormData.amount), category: editFormData.category, date: editFormData.date, notes: editFormData.notes, method: 'Cash / Other' }
        : { title: editFormData.title, amount: Number(editFormData.amount), source: editFormData.category, date: editFormData.date, notes: editFormData.notes };

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Update successful');
        setEditingId(null);
        fetchAll();
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
  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/dashboard/activities?limit=2000`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setAllActivities(data.activities || []);
    } catch { toast.error('Failed to load transactions', { id: 'trans_err' }); }
    finally { setLoading(false); }
  };

  const confirmDelete = (item) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2">
          <Trash2 size={16} className="text-error" />
          <span className="text-xs font-bold font-sans text-on-surface">Confirm Destruction</span>
        </div>
        <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed">
          Remove this record? This will permanently erase the <span className="text-error font-bold">{item.title}</span> entry from your vault.
        </p>
        <div className="flex justify-end gap-2 mt-1">
          <button onClick={() => toast.dismiss(t.id)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface transition-all">Cancel</button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const endpoint = item.type === 'expense'
                  ? `${API}/api/v1/expenses/delete/${item._id}`
                  : `${API}/api/v1/income/delete/${item._id}`;

                const res = await fetch(endpoint, { method: 'DELETE', credentials: 'include' });
                if (res.ok) {
                  toast.success('Transaction removed');
                  fetchAll();
                } else {
                  toast.error('Deletion failed');
                }
              } catch {
                toast.error('Connection error');
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



  useEffect(() => { fetchAll(); }, [API]);

  const filteredActivities = useMemo(() => {
    return allActivities.filter(item => {
      if (activeTab === 'Income') return item.type === 'income';
      if (activeTab === 'Expense') return item.type === 'expense' && item.displayType !== 'Tax' && item.displayType !== 'Subscription' && item.displayType !== 'Shared';
      if (activeTab === 'Tax') return item.displayType === 'Tax';
      if (activeTab === 'Investment') return item.type === 'portfolio';

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const t = item.title?.toLowerCase() || '';
        const c = (item.category || item.source || '').toLowerCase();
        const a = item.amount?.toString() || '';
        if (!t.includes(q) && !c.includes(q) && !a.includes(q)) return false;
      }

      if (dateFrom) {
        const d = new Date(item.date || item.createdAt);
        if (d < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const d = new Date(item.date || item.createdAt);
        const to = new Date(dateTo); to.setHours(23, 59, 59);
        if (d > to) return false;
      }

      return true;
    });
  }, [allActivities, activeTab, searchQuery, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredActivities.length / limit) || 1;
  const paginatedActivities = filteredActivities.slice((currentPage - 1) * limit, currentPage * limit);

  const handleExport = () => {
    const headers = ['Date', 'Type', 'Title', 'Category', 'Amount'].join(',');
    const csvRows = filteredActivities.map(a => [
      new Date(a.date || a.createdAt).toLocaleDateString(),
      a.displayType || a.type,
      `"${a.title.replace(/"/g, '""')}"`,
      a.category || a.source || 'General',
      a.amount,
    ].join(','));
    const blob = new Blob([[headers, ...csvRows].join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    toast.success('Transactions exported');
  };

  const resetFilters = () => { setSearchQuery(''); setDateFrom(''); setDateTo(''); setActiveTab('All'); setCurrentPage(1); };
  const hasFilters = searchQuery || dateFrom || dateTo || activeTab !== 'All';

  // Summary counts for filter sidebar
  const counts = useMemo(() => ({
    All: allActivities.length,
    Income: allActivities.filter(i => i.type === 'income').length,
    Expense: allActivities.filter(i => i.type === 'expense' && i.displayType !== 'Tax' && i.displayType !== 'Subscription' && i.displayType !== 'Shared').length,
    Tax: allActivities.filter(i => i.displayType === 'Tax').length,
    Investment: allActivities.filter(i => i.type === 'portfolio').length,
  }), [allActivities]);

  if (loading && allActivities.length === 0) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in-up pb-10">
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-secondary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant opacity-80">Full History</span>
          </div>
          <h1 className="page-title text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">Transactions</h1>
          <p className="page-subtitle text-sm mt-1 text-on-surface-variant">Track all your money movements in one place.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary px-5 gap-2 justify-center flex-1 md:flex-none">
            <Plus size={15} /> Add Transaction
          </button>
          <Link to="/data" className="btn btn-outline px-5 gap-2 justify-center bg-surface-lowest border-glass-border flex-1 md:flex-none">
            <Database size={15} /> Data Management
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row-reverse gap-6 items-start">
        <div className="w-full lg:w-56 xl:w-60 shrink-0 space-y-4 lg:sticky lg:top-6">

          {/* Search */}
          <div className="stat-card !p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 mb-3 flex items-center gap-2">
              <Search size={11} /> Search
            </p>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" />
              <input type="text" placeholder="Title, category, amount…"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-surface-lowest border border-glass-border rounded-xl pl-8 pr-3 py-2 text-[12px] text-on-surface focus:outline-none focus:border-primary/40 transition-colors placeholder:text-on-surface-variant/40" />
            </div>
          </div>

          {/* Type Filter tabs */}
          <div className="stat-card !p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 mb-3 flex items-center gap-2">
              <Filter size={11} /> Type
            </p>
            <div className="space-y-1">
              {['All', 'Income', 'Expense', 'Tax', 'Investment'].map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                  className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-semibold transition-all z-10 ${activeTab === tab
                    ? 'text-primary'
                    : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}`}>

                  {/* Smooth Background Transition */}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="transactions-type-filter"
                      className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  <span className="relative z-10">{tab}</span>
                  <span className={`relative z-10 text-[10px] font-black px-1.5 py-0.5 rounded-md ${activeTab === tab ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant opacity-70'}`}>
                    {counts[tab]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="stat-card !p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 mb-3 flex items-center gap-2">
              <Calendar size={11} /> Date Range
            </p>
            <div className="space-y-2">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant opacity-50 mb-1 block">From</label>
                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-surface-lowest border border-glass-border rounded-xl px-3 py-2 text-[11px] text-on-surface focus:outline-none focus:border-primary/40 transition-colors" />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant opacity-50 mb-1 block">To</label>
                <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-surface-lowest border border-glass-border rounded-xl px-3 py-2 text-[11px] text-on-surface focus:outline-none focus:border-primary/40 transition-colors" />
              </div>
            </div>
          </div>

          {/* Reset Filters */}
          {hasFilters && (
            <button onClick={resetFilters}
              className="w-full text-[11px] font-bold uppercase tracking-wider text-error hover:underline flex items-center justify-center gap-1.5 py-2 opacity-70 hover:opacity-100 transition-all">
              <X size={12} /> Reset Filters
            </button>
          )}

          {/* Results count */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-center">
            <p className="text-xl font-black text-primary">{filteredActivities.length}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 mt-0.5">Results Found</p>
          </div>
        </div>

        {/* LEFT CONTENT (on Desktop) */}
        <div className="flex-1 min-w-0 space-y-2">

          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-4 py-2">
            {['Description', 'Category', 'Date', 'Amount'].map(h => (
              <p key={h} className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-50">{h}</p>
            ))}
          </div>

          {/* Transaction rows  (ANIMATED) */}
          <div className="space-y-3 relative">
            <AnimatePresence mode="popLayout">
              {paginatedActivities.length === 0 ? (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="stat-card py-20 text-center border-dashed border border-glass-border"
                >
                  <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4">
                    <Search size={22} className="text-on-surface-variant opacity-40" />
                  </div>
                  <h3 className="text-sm font-semibold text-on-surface mb-1">No Transactions Found</h3>
                  <p className="text-xs text-on-surface-variant opacity-60">Try adjusting your search or filters.</p>
                </motion.div>
              ) : paginatedActivities.map(item => {
                const isPositive = item.type === 'income' || item.type === 'portfolio';
                const colorKey = getTypeColorKey(item);

                const handleRowClick = () => {
                  if (item.displayType === 'Shared') return navigate('/shared-wallets');
                  if (item.displayType === 'Subscription') return navigate('/subscriptions');
                  if (item.displayType === 'Tax') return navigate('/tax-monitor');
                  if (item.type === 'portfolio') return navigate('/portfolio');
                };

                if (editingId === item._id) {
                  const categories = item.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
                  return (
                    <motion.div key={item._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex flex-col sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr] gap-3 items-center px-4 py-3 rounded-xl border border-primary/30 bg-primary/5 shadow-inner">
                      
                      <div className="w-full sm:w-auto">
                        <input type="text" value={editFormData.title} onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                          className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1.5 text-[13px] text-on-surface focus:outline-none focus:border-primary/50" placeholder="Description" />
                      </div>

                      <div className="w-full sm:w-auto">
                        <select value={editFormData.category} onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}
                          className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1.5 text-[12px] text-on-surface focus:outline-none focus:border-primary/50 appearance-none">
                          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.id}</option>)}
                        </select>
                      </div>

                      <div className="w-full sm:w-auto">
                         <input type="date" value={editFormData.date} onChange={e => setEditFormData({ ...editFormData, date: e.target.value })}
                          className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1 text-[11px] text-on-surface focus:outline-none focus:border-primary/50" />
                      </div>

                      <div className="flex flex-col gap-2 w-full sm:col-span-1">
                        <textarea rows={1} value={editFormData.notes} onChange={e => setEditFormData({ ...editFormData, notes: e.target.value })}
                          className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1.5 text-[11px] text-on-surface focus:outline-none focus:border-primary/50 resize-none" placeholder="Notes (optional)" />
                      </div>

                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
                        <div className="relative">
                          <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] opacity-50 font-bold">{currencySymbol}</span>
                          <input type="number" value={editFormData.amount} onChange={e => setEditFormData({ ...editFormData, amount: e.target.value })}
                            className="w-20 bg-surface-lowest border border-glass-border rounded-lg pl-5 pr-2 py-1.5 text-[13px] font-bold text-on-surface focus:outline-none focus:border-primary/50" />
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleInlineSave(item)} disabled={isSavingInline} title="Save Changes"
                            className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors border border-success/20">
                            {isSavingInline ? <div className="w-4 h-4 border-2 border-success border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 size={14} />}
                          </button>
                          <button onClick={cancelInlineEdit} title="Cancel"
                            className="p-1.5 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors border border-error/20">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div key={item._id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.25 }}
                    onClick={handleRowClick}
                    className="group flex flex-col sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center px-4 py-3.5 rounded-xl border border-transparent hover:border-glass-border hover:bg-surface-lowest transition-all cursor-pointer bg-surface-lowest/60">

                    {/* Name + type */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLORS[colorKey]}`}>
                        {getTypeIcon(item)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-on-surface truncate leading-tight">{item.title}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-widest opacity-60 bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant">
                            {item.displayType || item.type}
                          </span>
                          {item.notes && (
                            <span className="text-[9px] font-medium text-on-surface-variant opacity-50 truncate max-w-[100px]">
                              • {item.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <p className="hidden sm:block text-[12px] font-medium text-on-surface-variant truncate">
                      {item.category || item.source || 'General'}
                    </p>

                    {/* Date */}
                    <p className="hidden sm:block text-[11px] font-medium text-on-surface-variant opacity-70">
                      {new Date(item.date || item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>

                    {/* Amount */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                      <div className="text-right">
                        <p className={`text-[13px] font-bold tracking-tight ${isPositive ? 'text-success' : 'text-error'}`}>
                          {isPositive ? '+' : '-'}{currencySymbol} {item.amount?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                      </div>

                      {/* Standard Actions */}
                      {((!item.displayType || item.displayType === 'manual' || item.displayType === 'Income' || item.displayType === 'Expense')) && (item.type === 'income' || item.type === 'expense') ? (
                        <div className="flex items-center gap-1 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); startInlineEdit(item); }}
                            className="p-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary transition-colors border border-primary/20"
                            title="Edit Transaction"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); confirmDelete(item); }}
                            className="p-1.5 rounded-lg bg-error/5 hover:bg-error/10 text-error transition-colors border border-error/20"
                            title="Delete Transaction"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : (
                        <ArrowUpRight size={13} className="text-on-surface-variant opacity-40 group-hover:opacity-70 transition-opacity" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {filteredActivities.length > limit && (
            <div className="flex flex-col sm:flex-row justify-between items-center bg-surface-lowest p-3 px-5 rounded-xl border border-glass-border mt-4 gap-4">
              <p className="text-[11px] font-semibold text-on-surface-variant">
                Showing {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, filteredActivities.length)} of {filteredActivities.length}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-high disabled:opacity-30 border border-glass-border transition-all">
                  <ChevronLeft size={15} />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                    let pageNum = currentPage <= 3 ? idx + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + idx : currentPage - 2 + idx;
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    return (
                      <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-[11px] font-semibold transition-all ${currentPage === pageNum ? 'bg-primary text-white shadow-md' : 'bg-surface-container hover:bg-surface-high text-on-surface'}`}>
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-high disabled:opacity-30 border border-glass-border transition-all">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Entry Modal */}
      <TransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onRefresh={fetchAll} API={API} currencySymbol={currencySymbol} />

      {/* Edit Entry Modal */}
      <TransactionModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedTransaction(null); }}
        onRefresh={fetchAll} API={API} currencySymbol={currencySymbol}
        initialData={selectedTransaction}
      />

    </div>
  );
};

export default Transactions;
