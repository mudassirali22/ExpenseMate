import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import {
  Users, Wallet, Handshake, Edit3, Trash2, Plus, LineChart, History,
  CheckCircle2, Info, Home, Plane, Key, Utensils, Bolt, Film,
  Package, UserPlus, Calendar, Search, CreditCard, FileText,
  ArrowUpRight, ChevronRight, X, TrendingUp, Mail,
  AlignLeft, Filter, ChevronDown
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedWallets } from '../../hooks/useSharedWallets';

const CATEGORIES = [
  { name: 'Household', icon: Home },
  { name: 'Travel', icon: Plane },
  { name: 'Rent', icon: Key },
  { name: 'Dining', icon: Utensils },
  { name: 'Utilities', icon: Bolt },
  { name: 'Entertainment', icon: Film },
  { name: 'Other', icon: Package },
];

const SharedWallets = () => {
  const { user, currencySymbol } = useAuth();

  // 1. Base State from Hook
  const { wallets, loading, refresh: fetchWallets, addWallet, updateWallet, deleteWallet, addExpense, addMember, handleRequestAction: hookHandleRequestAction, getStatements, stats } = useSharedWallets();
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [settlementData, setSettlementData] = useState(null);

  // 2. All Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSettlementsModalOpen, setIsSettlementsModalOpen] = useState(false);

  // 3. All Form states
  const [newWalletData, setNewWalletData] = useState({ name: '', totalBalance: '', category: 'Other', description: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [expenseData, setExpenseData] = useState({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });

  // 4. Inline Editing states
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', totalBalance: '', category: 'Other', description: '' });
  const [isSavingInline, setIsSavingInline] = useState(false);

  // 5. Filtering & UI states
  const [walletSearch, setWalletSearch] = useState('');
  const [graphWalletFilter, setGraphWalletFilter] = useState('all');
  const [graphTimeFilter, setGraphTimeFilter] = useState('week');
  const [historyDateFilter, setHistoryDateFilter] = useState('all');
  const [specificDate, setSpecificDate] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  // 6. Effects
  useEffect(() => {
    if (selectedWallet && isEditModalOpen) {
      setNewWalletData({
        name: selectedWallet.name,
        totalBalance: selectedWallet.targetBudget,
        category: selectedWallet.category,
        description: selectedWallet.description || ''
      });
    }
  }, [selectedWallet, isEditModalOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdateWallet = async (e) => {
    e.preventDefault();
    const success = await updateWallet(selectedWallet._id, newWalletData);
    if (success) {
      setIsEditModalOpen(false);
    }
  };

  const startInlineEdit = (wallet) => {
    setEditingId(wallet._id);
    setEditFormData({
      name: wallet.name,
      totalBalance: wallet.targetBudget,
      category: wallet.category,
      description: wallet.description
    });
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditFormData({ name: '', totalBalance: '', category: 'Other', description: '' });
  };

  const handleInlineSave = async (id) => {
    if (!editFormData.name || !editFormData.totalBalance) {
      return toast.error('Name and Goal are required');
    }
    setIsSavingInline(true);
    const success = await updateWallet(id, editFormData);
    if (success) {
      setEditingId(null);
    }
    setIsSavingInline(false);
  };

  const handleDeleteWallet = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2">
          <Trash2 size={16} className="text-error" />
          <span className="text-xs font-bold font-sans text-on-surface">Confirm Destruction</span>
        </div>
        <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed">
          Destroy this wallet? All transaction history and member ties will be permanently cleared.
        </p>
        <div className="flex justify-end gap-2 mt-1">
          <button onClick={() => toast.dismiss(t.id)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface transition-all">Cancel</button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await deleteWallet(id);
            }}
            className="btn btn-danger !py-1.5 !px-3 !text-[10px]"
          >
            Delete Now
          </button>
        </div>
      </div>
    ), { duration: Infinity, className: '!bg-surface-container !border !border-glass-border !rounded-2xl !shadow-2xl' });
  };

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    const success = await addWallet(newWalletData);
    if (success) {
      setIsCreateModalOpen(false);
      setNewWalletData({ name: '', totalBalance: '', category: 'Other', description: '' });
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (selectedWallet) {
      const activeMembersCount = selectedWallet.members.length || 1;
      const fairShare = selectedWallet.targetBudget / activeMembersCount;
      const myMemberData = selectedWallet.members.find(m => m.user?._id === user?._id || m.email === user?.email);
      const myContribution = myMemberData?.totalPaid || 0;
      const amountToAdd = Number(expenseData.amount);

      if (myContribution + amountToAdd > fairShare) {
        toast((t) => (
          <div className="flex flex-col gap-3 p-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-sans text-on-surface">Target Reached</span>
            </div>
            <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed">
              You already paid your part ({currencySymbol} {fairShare.toLocaleString()}).
              Paying extra will make the pool bigger.
            </p>
            <div className="flex justify-end gap-2 mt-1">
              <button onClick={() => toast.dismiss(t.id)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface transition-colors">Cancel</button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  submitExpense();
                }}
                className="btn btn-primary !py-1.5 !px-3 !text-[10px]"
              >
                Pay Extra
              </button>
            </div>
          </div>
        ), { duration: 6000, className: '!bg-surface-container !border !border-glass-border !rounded-2xl !shadow-2xl' });
        return;
      }
    }
    submitExpense();
  };

  const submitExpense = async () => {
    const success = await addExpense(selectedWallet._id, {
      description: expenseData.description,
      amount: Number(expenseData.amount),
      date: expenseData.date
    });
    if (success) {
      setIsExpenseModalOpen(false);
      setExpenseData({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const success = await addMember(selectedWallet._id, memberEmail);
    if (success) {
      setIsMemberModalOpen(false);
      setMemberEmail('');
    }
  };

  const handleRequestAction = async (requestId, action) => {
    const success = await hookHandleRequestAction(selectedWallet._id, requestId, action);
    if (success) {
      fetchSettlements(selectedWallet._id);
    }
  };

  const fetchSettlements = async (walletId) => {
    const data = await getStatements(walletId);
    if (data) {
      setSettlementData(data);
      setIsSettlementsModalOpen(true);
    }
  };

  const filteredWallets = useMemo(() => {
    return wallets.filter(w =>
      w.name.toLowerCase().includes(walletSearch.toLowerCase()) ||
      w.category.toLowerCase().includes(walletSearch.toLowerCase())
    );
  }, [wallets, walletSearch]);

  const chartData = useMemo(() => {
    let targetExpenses = [];
    if (graphWalletFilter === 'all') {
      targetExpenses = wallets.flatMap(w => w.expenses);
    } else {
      const w = wallets.find(w => w._id === graphWalletFilter);
      targetExpenses = w ? w.expenses : [];
    }

    const now = new Date();
    let startDate = new Date();

    if (graphTimeFilter === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (graphTimeFilter === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (graphTimeFilter === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate = new Date(0);
    }

    const filtered = targetExpenses.filter(exp => new Date(exp.date) >= startDate);

    const grouped = filtered.reduce((acc, exp) => {
      const dateObj = new Date(exp.date);
      const label = graphTimeFilter === 'today'
        ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      acc[label] = (acc[label] || 0) + exp.amount;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [wallets, graphWalletFilter, graphTimeFilter]);

  const recentActivity = useMemo(() => {
    let allExp = wallets.flatMap(w => w.expenses.map(e => ({ ...e, walletName: w.name })));
    const now = new Date();
    if (historyDateFilter === 'specific') {
      if (specificDate) {
        allExp = allExp.filter(e => new Date(e.date).toDateString() === new Date(specificDate).toDateString());
      }
    } else if (historyDateFilter === 'range') {
      if (dateRange.start && dateRange.end) {
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999);
        allExp = allExp.filter(e => {
          const d = new Date(e.date);
          return d >= start && d <= end;
        });
      }
    } else if (historyDateFilter === 'today') {
      allExp = allExp.filter(e => new Date(e.date).toDateString() === now.toDateString());
    } else if (historyDateFilter === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      allExp = allExp.filter(e => new Date(e.date) >= weekAgo);
    } else if (historyDateFilter === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      allExp = allExp.filter(e => new Date(e.date) >= monthAgo);
    }

    return allExp.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [wallets, historyDateFilter, specificDate, dateRange]);

  const allUniqueMembers = useMemo(() => {
    const memberMap = new Map();
    wallets.forEach(w => {
      w.members.forEach(m => {
        const email = m.email || m.user?.email;
        const isCurrentMember = selectedWallet?.members.some(existing => (existing.email || existing.user?.email) === email);
        if (email && email !== user?.email && !isCurrentMember && !memberMap.has(email)) {
          memberMap.set(email, m);
        }
      });
    });
    return Array.from(memberMap.values());
  }, [wallets, selectedWallet, user]);

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
            <Users size={14} className="text-secondary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant opacity-80">Group Wallets</span>
          </div>
          <h1 className="page-title text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">Shared Wallets</h1>
          <p className="page-subtitle text-sm mt-1 text-on-surface-variant">Share money and expenses with friends and family.</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary px-6 flex items-center gap-2">
          <Plus size={16} /> New Wallet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card md:col-span-2 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-20 -mt-20 shrink-0" />
          <div className="relative z-10">
            <p className="stat-label">Group Budget</p>
            <h3 className="stat-value text-3xl sm:text-4xl mt-1">
              {currencySymbol} {stats.totalPoolValue.toLocaleString()}
            </h3>
            <p className="text-[10px] font-bold text-success uppercase tracking-widest mt-2">
              {currencySymbol} {stats.totalCollected.toLocaleString()} Saved
            </p>
          </div>
          <div className="flex items-center gap-4 mt-6 relative z-10">
            <div className="flex -space-x-2">
              {allUniqueMembers.slice(0, 5).map((m, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background overflow-hidden bg-primary/10 transition-transform hover:scale-110 cursor-pointer">
                  {m.user?.profileImageUrl ? (
                    <img src={m.user.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary">
                      {m.user?.fullName?.charAt(0) || m.email?.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{stats.totalCollaborators} Members Joined</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <p className="stat-label mb-0">Wallet Stats</p>
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <LineChart size={18} />
            </div>
          </div>
          <div className="space-y-4 relative z-10">
            <div>
              <h4 className="stat-value text-3xl font-bold">{wallets.length}</h4>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1 opacity-60">Active Wallets</p>
            </div>
            <div className="mt-8 pt-4 border-t border-glass-border">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] font-bold text-success uppercase tracking-widest leading-none">Real-time Synced</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary/5 blur-2xl rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="section-title mb-0">Your Wallets</h3>
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search wallets or categories..."
                className="w-full bg-surface-container border border-glass-border rounded-xl pl-9 pr-4 py-2.5 text-xs focus:border-primary outline-none transition-all shadow-sm"
                value={walletSearch}
                onChange={(e) => setWalletSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredWallets.length > 0 ? filteredWallets.map(wallet => {
              const isEditing = editingId === wallet._id;
              return (
                <div key={wallet._id}
                  onClick={() => setSelectedWallet(wallet)}
                  className={`stat-card flex flex-col h-full cursor-pointer group transition-all duration-300 ${selectedWallet?._id === wallet._id ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.01]' : 'border-glass-border hover:border-primary/20'}`}
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-xl shadow-inner border border-glass-border text-primary">
                        {editingId === wallet._id ? (
                          <div className="relative">
                            <select
                              value={editFormData.category}
                              onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            >
                              {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            {(() => {
                              const Icon = CATEGORIES.find(c => c.name === editFormData.category)?.icon || Package;
                              return <Icon size={20} />;
                            })()}
                          </div>
                        ) : (
                          (() => {
                            const Icon = CATEGORIES.find(c => c.name === wallet.category)?.icon || Package;
                            return <Icon size={20} />;
                          })()
                        )}
                      </div>
                      <div className="min-w-0">
                        {editingId === wallet._id ? (
                          <input
                            type="text"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            className="w-full bg-surface-container border border-glass-border rounded-lg px-2 py-1 text-sm font-extrabold text-on-surface focus:border-primary outline-none"
                          />
                        ) : (
                          <>
                            <h4 className="text-md font-extrabold text-on-surface truncate pr-2">{wallet.name}</h4>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{wallet.category}</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-10 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isEditing && user?._id === wallet.createdBy?._id && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWallet(wallet);
                              startInlineEdit(wallet);
                            }}
                            className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                            title="Inline Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteWallet(wallet._id); }} className="p-2 text-on-surface-variant hover:text-error transition-colors"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Bulky edit block removed in favor of integrated inline edit */}
                  <div className="bg-surface-container/50 p-4 rounded-xl border border-glass-border mb-6">
                    <div className="flex justify-between items-center mb-1.5 px-0.5">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Saved Progress</span>
                      {editingId === wallet._id ? (
                        <input
                          type="number"
                          value={editFormData.totalBalance}
                          onChange={(e) => setEditFormData({ ...editFormData, totalBalance: e.target.value })}
                          className="w-24 bg-surface-lowest border border-glass-border rounded-lg px-2 py-0.5 text-xs font-bold text-on-surface focus:border-primary outline-none text-right"
                          placeholder="Limit"
                        />
                      ) : (
                        <span className="text-xs font-bold text-on-surface">{currencySymbol} {(wallet.totalBalance || 0).toLocaleString()} / {currencySymbol} {(wallet.targetBudget || 0).toLocaleString()}</span>
                      )}
                    </div>
                    <div className="progress-bar !h-2 bg-background relative overflow-hidden">
                      <div className={`progress-fill ${(wallet.totalBalance || 0) >= (wallet.targetBudget || 0) ? 'bg-success' : 'bg-primary'}`} style={{ width: `${Math.min(100, ((wallet.totalBalance || 0) / (wallet.targetBudget || 1)) * 100)}%` }} />
                    </div>
                    {editingId === wallet._id ? (
                      <div className="mt-3">
                        <textarea
                          value={editFormData.description}
                          onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                          rows="2"
                          placeholder="Wallet description..."
                          className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1.5 text-[10px] font-medium text-on-surface focus:border-primary outline-none resize-none italic"
                        />
                      </div>
                    ) : (
                      wallet.description && (
                        <div className="mt-3 px-1">
                          <p className="text-[10px] font-medium text-on-surface-variant leading-relaxed line-clamp-2 opacity-80 italic">
                            "{wallet.description}"
                          </p>
                        </div>
                      )
                    )}
                    {!isEditing && Math.max(0, (wallet.totalBalance || 0) - (wallet.targetBudget || 0)) > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <p className="text-[10px] font-bold text-success uppercase tracking-wider italic">Extra Saved: {currencySymbol} {Math.max(0, (wallet.totalBalance || 0) - (wallet.targetBudget || 0)).toLocaleString()}</p>
                      </div>
                    )}
                    {isEditing ? (
                      <p className="text-[9px] font-bold text-primary mt-1.5 uppercase tracking-widest opacity-80">Editing Wallet Goal</p>
                    ) : (
                      <p className="text-[9px] font-bold text-on-surface-variant mt-1.5 uppercase tracking-widest opacity-60">Total Goal: {currencySymbol} {(wallet.targetBudget || 0).toLocaleString()}</p>
                    )}
                  </div>

                  {/* Pending Permissions Alert on Card (Denser/Compact) */}
                  {!isEditing && user?._id === wallet.createdBy?._id && wallet.requests?.some(r => r.status === 'Pending') && (
                    <div className="mb-6 px-1 animate-pulse">
                      <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary shrink-0">
                            <Handshake size={14} />
                          </div>
                          <p className="text-[10px] font-bold text-secondary uppercase tracking-wider truncate">
                            {wallet.requests.filter(r => r.status === 'Pending').length} Request Pending
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); fetchSettlements(wallet._id); }}
                          className="text-[9px] font-black text-secondary hover:underline uppercase tracking-tighter shrink-0"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 flex-1 flex flex-col min-h-0">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 ml-0.5 shrink-0">Members</p>
                    <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar max-h-[180px] flex-1 min-h-0">
                      {wallet.members.map((member, i) => {
                        const isMe = member.user?._id === user?._id || member.email === user?.email;
                        const isOwner = member.user?._id === wallet.createdBy?._id;
                        const memberPaid = member.totalPaid || 0;
                        const sharePerPerson = (wallet.targetBudget || 0) / (wallet.members.length || 1);
                        const leftToPay = Math.max(0, sharePerPerson - memberPaid);
                        const progress = (memberPaid / (sharePerPerson || 1)) * 100;

                        return (
                          <div key={i} className={`p-3 rounded-xl border ${isMe ? 'bg-primary/5 border-primary/20' : 'bg-surface-container/20 border-glass-border'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-surface-container border border-glass-border overflow-hidden shrink-0">
                                  {member.user?.profileImageUrl ? (
                                    <img src={member.user.profileImageUrl} alt="user" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black">
                                      {member.user?.fullName?.charAt(0) || member.email?.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-[11px] font-bold text-on-surface truncate pr-1">{isMe ? 'Me' : (member.user?.fullName || member.email.split('@')[0])}</p>
                                    <span className={`text-[7px] font-black px-1 rounded-sm uppercase tracking-tighter ${isOwner ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                                      {isOwner ? 'Owner' : 'Member'}
                                    </span>
                                  </div>
                                  <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">{member.status}</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                {leftToPay > 0 ? (
                                  <p className="text-[9px] font-bold text-error uppercase">Left to Pay: {currencySymbol} {leftToPay.toLocaleString()}</p>
                                ) : (
                                  <p className="text-[9px] font-bold text-success flex items-center gap-1 justify-end uppercase">
                                    <CheckCircle2 size={10} /> Settled
                                  </p>
                                )}
                                <p className="text-[10px] font-black text-on-surface mt-0.5 whitespace-nowrap">Paid: {currencySymbol} {memberPaid.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="progress-bar !h-1 bg-background overflow-hidden relative">
                              <div className={`progress-fill ${leftToPay === 0 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${Math.min(100, progress)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-auto pt-6 border-t border-glass-border border-dashed shrink-0">
                    {editingId === wallet._id ? (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleInlineSave(wallet._id); }}
                          disabled={isSavingInline}
                          className="col-span-2 btn btn-primary text-[10px] font-black py-2.5 justify-center uppercase tracking-widest"
                        >
                          {isSavingInline ? 'SAVING...' : 'SAVE CHANGES'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); cancelInlineEdit(); }}
                          className="btn btn-outline text-[10px] font-black py-2.5 justify-center uppercase tracking-widest"
                        >
                          CANCEL
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedWallet(wallet); setIsMemberModalOpen(true); }} className="btn btn-outline text-[10px] py-2.5 justify-center font-bold">INVITE</button>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedWallet(wallet); setIsExpenseModalOpen(true); }} className="btn btn-outline text-[10px] py-2.5 justify-center font-bold">ADD MONEY</button>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedWallet(wallet); fetchSettlements(wallet._id); }} className="btn btn-primary text-[10px] py-2.5 justify-center font-bold">DETAILS</button>
                      </>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="stat-card md:col-span-2 py-24 text-center opacity-40 border-dashed border-2">
                <p className="text-sm font-bold uppercase tracking-widest">No matching wallets found</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="stat-card !p-0 overflow-hidden border border-glass-border shadow-sm bg-surface-container/10 min-w-0">
            <div className="p-5 border-b border-glass-border flex flex-col gap-3 bg-background/50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="section-title mb-0 !text-sm">Spending Chart</h3>
                  <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Track contributions over time</p>
                </div>
                <select
                  className="text-[10px] font-bold bg-surface-container border border-glass-border rounded-lg px-2 py-1.5 outline-none"
                  value={graphWalletFilter}
                  onChange={(e) => setGraphWalletFilter(e.target.value)}
                >
                  <option value="all">Global Pool</option>
                  {wallets.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                {['today', 'week', 'month'].map(period => (
                  <button
                    key={period}
                    onClick={() => setGraphTimeFilter(period)}
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${graphTimeFilter === period ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-container border-glass-border text-on-surface-variant hover:border-primary/30'}`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[220px] w-full pt-8 pr-4 pb-4 bg-gradient-to-b from-primary/[0.02] to-transparent min-h-0">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-glass-border)" opacity={0.3} />
                    <XAxis dataKey="date" hide={true} />
                    <YAxis hide={true} domain={[0, 'auto']} />
                    <Tooltip
                      contentStyle={{ background: 'var(--color-surface-container)', border: '1px solid var(--color-glass-border)', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold' }}
                      itemStyle={{ color: 'var(--color-primary)' }}
                      cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="var(--color-primary)"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorWave)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-center px-12 opacity-30">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] italic">No data yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="section-title mb-0">Recent Activity</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <select
                    className="text-[10px] font-bold bg-surface-container border border-glass-border px-3 py-1.5 rounded-lg text-on-surface-variant uppercase tracking-widest outline-none cursor-pointer"
                    value={historyDateFilter}
                    onChange={(e) => setHistoryDateFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="specific">Single Date</option>
                    <option value="range">Date Range</option>
                  </select>
                  {historyDateFilter !== 'all' && (
                    <button
                      onClick={() => {
                        setHistoryDateFilter('all');
                        setSpecificDate('');
                        setDateRange({ start: '', end: '' });
                      }}
                      className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary transition-colors hover:text-white"
                      title="Reset Filter"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="animate-fade-in">
              {historyDateFilter === 'specific' && (
                <div className="flex items-center gap-2 bg-surface-container/30 p-2 rounded-xl border border-glass-border mb-4">
                  <Calendar size={12} className="ml-2 text-primary" />
                  <input
                    type="date"
                    className="bg-transparent text-[11px] font-bold outline-none flex-1 text-on-surface"
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                  />
                </div>
              )}
              {historyDateFilter === 'range' && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center gap-2 bg-surface-container/30 p-2 rounded-xl border border-glass-border">
                    <input
                      type="date"
                      placeholder="Start"
                      className="bg-transparent text-[10px] font-bold outline-none w-full text-on-surface"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-surface-container/30 p-2 rounded-xl border border-glass-border">
                    <input
                      type="date"
                      className="bg-transparent text-[10px] font-bold outline-none w-full text-on-surface"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="max-h-[460px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {recentActivity.length > 0 ? recentActivity.map((log, i) => (
                <div
                  key={log._id || i}
                  className="stat-card !p-4 flex gap-4 items-center group bg-surface-container/20 hover:bg-surface-container/40 border-glass-border transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-background border border-glass-border flex items-center justify-center text-primary shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <CreditCard size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-extrabold text-on-surface truncate pr-1 uppercase tracking-tight">{log.description}</h4>
                        <p className="text-[9px] font-medium text-on-surface-variant italic truncate">
                          Paid by {log.paidByEmail?.split('@')[0] || 'Unknown'}
                        </p>
                      </div>
                      <span className="text-xs font-black text-primary italic whitespace-nowrap shrink-0">{currencySymbol} {log.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-glass-border/30">
                      <span className="text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest truncate max-w-[100px]">In {log.walletName}</span>
                      <span className="text-[9px] font-bold text-on-surface-variant opacity-30 italic">{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="stat-card py-16 text-center border-dashed border-2 opacity-20">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] italic">No activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="New Wallet">
        <form onSubmit={handleCreateWallet} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Wallet Name</label>
              <input required type="text" placeholder="e.g. Room Rent Group" className="input-field !py-4" value={newWalletData.name} onChange={(e) => setNewWalletData({ ...newWalletData, name: e.target.value })} />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Category</label>
              <div className="relative">
                <select required className="input-field bg-surface-container !py-4 appearance-none" value={newWalletData.category} onChange={(e) => setNewWalletData({ ...newWalletData, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                  {(() => {
                    const Icon = CATEGORIES.find(c => c.name === newWalletData.category)?.icon || Package;
                    return <Icon size={16} />;
                  })()}
                </div>
              </div>
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Goal ({currencySymbol})</label>
              <input required type="number" placeholder="Enter amount" className="input-field !py-4" value={newWalletData.totalBalance} onChange={(e) => setNewWalletData({ ...newWalletData, totalBalance: e.target.value })} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Description</label>
              <textarea rows="3" placeholder="What is this for?" className="input-field resize-none !py-4" value={newWalletData.description} onChange={(e) => setNewWalletData({ ...newWalletData, description: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="w-full btn btn-primary py-4 font-bold shadow-lg shadow-primary/20">Create Wallet</button>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Wallet">
        <form onSubmit={handleUpdateWallet} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Name</label>
              <input required type="text" className="input-field !py-4" value={newWalletData.name} onChange={(e) => setNewWalletData({ ...newWalletData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Category</label>
                <select className="input-field bg-surface-container !py-4" value={newWalletData.category} onChange={(e) => setNewWalletData({ ...newWalletData, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Goal ({currencySymbol})</label>
                <input required type="number" className="input-field !py-4" value={newWalletData.totalBalance} onChange={(e) => setNewWalletData({ ...newWalletData, totalBalance: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Description</label>
              <textarea rows="3" className="input-field !py-4 resize-none" value={newWalletData.description} onChange={(e) => setNewWalletData({ ...newWalletData, description: e.target.value })} placeholder="What is this for?" />
            </div>
          </div>
          <button type="submit" className="w-full btn btn-primary py-4 font-bold">Save Changes</button>
        </form>
      </Modal>

      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Add Money">
        <form onSubmit={handleAddExpense} className="space-y-5">
          <div className="flex items-center justify-between mb-4 bg-surface-lowest p-4 rounded-2xl border border-glass-border">
            <div>
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1 opacity-60">To Wallet</p>
              <h4 className="text-base font-black text-on-surface truncate pr-4">{selectedWallet?.name}</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
              <CreditCard size={18} />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">What did you pay for?</label>
              <div className="relative">
                <AlignLeft size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                <input
                  required
                  type="text"
                  placeholder="e.g. Electricity Bill"
                  className="w-full bg-surface-container border border-glass-border rounded-xl pl-10 pr-4 py-3.5 text-sm font-bold text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all"
                  value={expenseData.description}
                  onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">Amount ({currencySymbol})</label>
                <input
                  required
                  type="number"
                  placeholder="0"
                  className="w-full bg-surface-container border border-glass-border rounded-xl px-4 py-3.5 text-sm font-black text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all"
                  value={expenseData.amount}
                  onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">Date</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none" />
                  <input
                    type="date"
                    className="w-full bg-surface-container border border-glass-border rounded-xl pl-10 pr-3 py-3 text-[11px] font-bold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all shadow-sm"
                    value={expenseData.date}
                    onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-4.5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
            <CheckCircle2 size={18} /> Add Contribution
          </button>
        </form>
      </Modal>

      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="space-y-6">
          <div className="text-center pt-2 pb-6">
            <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4 mx-auto border border-secondary/20">
              <UserPlus size={24} />
            </div>
            <h3 className="text-xl font-black text-on-surface tracking-tight mb-1">Add a Member</h3>
            <p className="text-[11px] text-on-surface-variant px-12 leading-relaxed font-medium">
              Add a new person to <strong>{selectedWallet?.name}</strong> to share expenses.
            </p>
          </div>

          <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="input-label !mb-1 ml-1 text-secondary">Email Address</label>
            <div className="relative">
              <input
                required
                type="email"
                placeholder="partner@expanse.mate"
                className="input-field !py-4 pl-12 font-bold shadow-sm"
                value={memberEmail}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setMemberEmail(e.target.value);
                  setShowSuggestions(true);
                }}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40">
                <Mail size={18} />
              </div>
            </div>

            {/* Premium Autocomplete Dropdown */}
            <AnimatePresence>
              {showSuggestions && allUniqueMembers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-[60] left-0 right-0 top-[100%] mt-2 bg-surface-lowest border border-glass-border rounded-2xl shadow-2xl overflow-hidden max-h-[220px] overflow-y-auto custom-scrollbar backdrop-blur-xl"
                >
                  <div className="p-2 border-b border-glass-border bg-surface-container/30">
                    <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-60 ml-1">Suggestions</p>
                  </div>
                  {(() => {
                    const filtered = allUniqueMembers.filter(m =>
                      (m.email || m.user?.email || '').toLowerCase().includes(memberEmail.toLowerCase())
                    );

                    if (filtered.length === 0) {
                      return <div className="p-4 text-center text-[10px] font-bold text-on-surface-variant italic">No matches found</div>;
                    }

                    return filtered.map((m, i) => {
                      const email = m.email || m.user?.email;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setMemberEmail(email);
                            setShowSuggestions(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors border-b border-glass-border/50 last:border-0 group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-surface-container border border-glass-border flex items-center justify-center text-[10px] font-black overflow-hidden group-hover:border-primary/30 shrink-0">
                            {m.user?.profileImageUrl ? <img src={m.user.profileImageUrl} alt="" className="w-full h-full object-cover" /> : email.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-[11px] font-bold text-on-surface truncate">{m.user?.fullName || email.split('@')[0]}</p>
                            <p className="text-[9px] font-medium text-on-surface-variant opacity-60 truncate">{email}</p>
                          </div>
                          <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
                        </button>
                      );
                    });
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Past Members flex list removed in favor of autocomplete dropdown */}

          <div className="pt-2">
            <button type="submit" className="w-full bg-secondary hover:bg-secondary-dark text-white py-4.5 rounded-xl text-xs font-black uppercase tracking-[0.1em] shadow-xl shadow-secondary/20 transition-all active:scale-[0.98]">
              Send Invitation
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isSettlementsModalOpen} onClose={() => setIsSettlementsModalOpen(false)} title="Wallet Intelligence">
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar p-0.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-surface-container border border-glass-border">
              <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">Total Pool</p>
              <p className="text-xl font-black text-on-surface leading-none">{currencySymbol} {settlementData?.totalSpent.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-container border border-glass-border">
              <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">Settlements</p>
              <p className="text-xl font-black text-primary leading-none italic">{settlementData?.settlements.length || 0}</p>
            </div>
          </div>

          {selectedWallet?.description && (
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Info size={10} /> Purpose
              </p>
              <p className="text-[10px] font-bold text-on-surface-variant leading-relaxed opacity-80">
                "{selectedWallet.description}"
              </p>
            </div>
          )}

          {/* Pending Requests Section — Owner Only */}
          {(selectedWallet?.createdBy?._id === user?._id || selectedWallet?.createdBy === user?._id) &&
            selectedWallet?.requests?.filter(r => r.status === 'Pending').length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[9px] font-black text-secondary uppercase tracking-[0.3em] flex items-center gap-2">
                  Pending Actions
                </h4>
                <div className="space-y-2">
                  {selectedWallet.requests.filter(r => r.status === 'Pending').map((req, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-secondary/[0.02] border border-secondary/10 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-on-surface">
                            {req.requestedByEmail.split('@')[0]} Extra Contribution
                          </p>
                          <p className="text-[9px] text-on-surface-variant opacity-60 font-medium truncate italic">"{req.description}"</p>
                        </div>
                        <p className="text-sm font-black text-secondary shrink-0">{currencySymbol} {req.amount.toLocaleString()}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequestAction(req._id, 'Accepted')}
                          className="flex-1 py-1.5 bg-secondary text-white text-[9px] font-black rounded-lg hover:bg-secondary-dark transition-all uppercase tracking-widest"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRequestAction(req._id, 'Rejected')}
                          className="flex-1 py-1.5 bg-surface-container text-on-surface-variant text-[9px] font-black rounded-lg hover:bg-surface-container-high transition-all uppercase tracking-[0.15em] border border-glass-border"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          <div className="space-y-3">
            <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">
              Settlement Flows
            </h4>
            <div className="space-y-2">
              {settlementData?.settlements.length > 0 ? settlementData.settlements.map((s, i) => (
                <div key={i} className="p-4 rounded-2xl bg-surface-container/50 border border-glass-border border-l-2 border-l-primary flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-on-surface-variant">
                      <strong className="text-on-surface">{s.from.split('@')[0]}</strong> pays <strong>{s.to.split('@')[0]}</strong>
                    </p>
                  </div>
                  <p className="text-sm font-black text-on-surface tracking-tighter shrink-0 ml-2">{currencySymbol} {s.amount.toLocaleString()}</p>
                </div>
              )) : (
                <div className="py-8 text-center opacity-40 border-dashed border border-glass-border rounded-2xl">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] italic">Pool Balanced</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">
              Balances
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(settlementData?.balances || {}).map(([email, bal], i) => (
                <div key={i} className={`p-3 rounded-2xl border ${bal >= 0 ? 'bg-success/[0.01] border-success/10' : 'bg-error/[0.01] border-error/10'}`}>
                  <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest truncate">{email.split('@')[0]}</p>
                  <p className={`text-md font-black mt-1 leading-none ${bal >= 0 ? 'text-success' : 'text-error'}`}>
                    {bal >= 0 ? '+' : '-'}{currencySymbol} {Math.abs(bal).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setIsSettlementsModalOpen(false)} className="w-full py-3.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl border border-glass-border transition-all">Close Details</button>
        </div>
      </Modal>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-glass-border);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-primary);
          opacity: 0.1;
        }
      `}</style>
    </div>
  );
};


export default SharedWallets;
