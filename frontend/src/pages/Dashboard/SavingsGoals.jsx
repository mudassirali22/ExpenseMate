import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Target, Coins, Rocket, Trash2, Calendar, TrendingUp, Info, Plus, ChevronRight, CheckCircle, Pencil, X, AlignLeft, CheckCircle2, ChevronDown } from 'lucide-react';

const SavingsGoalModal = ({ isOpen, onClose, onRefresh, API, currencySymbol, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '', targetAmount: '', currentAmount: '', deadline: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        targetAmount: initialData.targetAmount || '',
        currentAmount: initialData.currentAmount || '',
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : ''
      });
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setFormData({ name: '', targetAmount: '', currentAmount: '', deadline: '' });
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount || !formData.deadline) return toast.error('All fields except current amount are required');
    setLoading(true);
    try {
      const endpoint = initialData
        ? `${API}/api/v1/goals/${initialData._id}`
        : `${API}/api/v1/goals/add`;

      const method = initialData ? 'PUT' : 'POST';
      const payload = {
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount) || 0,
        deadline: formData.deadline
      };

      const res = await fetch(endpoint, {
        method, headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(initialData ? 'Goal updated!' : 'Goal initialized!');
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
            <h2 className="text-lg font-bold text-on-surface tracking-tight">{initialData ? 'Edit' : 'New'} Savings Goal</h2>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant font-black">{initialData ? 'Update Objective' : 'Financial Planning'}</p>
          </div>
          <button onClick={handleClose} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Goal Name</label>
              <div className="relative">
                <AlignLeft size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                <input required type="text" placeholder="e.g. New Laptop, Dream House..."
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface-lowest border border-glass-border rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Target ({currencySymbol})</label>
                <div className="relative">
                  <Target size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none" />
                  <input required type="number" placeholder="50000"
                    value={formData.targetAmount} onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="w-full bg-surface-lowest border border-glass-border rounded-xl pl-9 pr-4 py-2.5 text-[13px] font-bold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Starting ({currencySymbol})</label>
                <div className="relative">
                  <Coins size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none" />
                  <input type="number" placeholder="0"
                    value={formData.currentAmount} onChange={e => setFormData({ ...formData, currentAmount: e.target.value })}
                    className="w-full bg-surface-lowest border border-glass-border rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Deadline Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none" />
                <input required type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full bg-surface-lowest border border-glass-border rounded-xl pl-9 pr-3 py-2.5 text-[12px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2">
              {loading ? 'Saving...' : <><CheckCircle2 size={16} /> {initialData ? 'Update Objective' : 'Save Goal'}</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const SavingsGoals = () => {
  const { API, currencySymbol } = useAuth();
  const [goals, setGoals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [progressAmount, setProgressAmount] = useState('');
  const [filterState, setFilterState] = useState('All Goals');

  const [loading, setLoading] = useState(false);

  // Inline Editing States
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', targetAmount: '', currentAmount: '', deadline: '' });
  const [isSavingInline, setIsSavingInline] = useState(false);

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    try {
      const res = await fetch(`${API}/api/v1/goals/get`, { credentials: 'include' });
      const data = await res.json();
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const openEditModal = (goal) => {
    setSelectedGoal(goal);
    setShowEditModal(true);
  };

  const startInlineEdit = (goal) => {
    setEditingId(goal._id);
    setEditFormData({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : ''
    });
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditFormData({ name: '', targetAmount: '', currentAmount: '', deadline: '' });
  };

  const handleInlineSave = async (id) => {
    if (!editFormData.name || !editFormData.targetAmount || !editFormData.deadline) {
      return toast.error('All fields except current amount are required');
    }
    setIsSavingInline(true);
    try {
      const res = await fetch(`${API}/api/v1/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...editFormData,
          targetAmount: Number(editFormData.targetAmount),
          currentAmount: Number(editFormData.currentAmount) || 0
        }),
      });

      if (res.ok) {
        toast.success('Goal Updated');
        setEditingId(null);
        fetchGoals();
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

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!progressAmount || !selectedGoal) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/goals/${selectedGoal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentAmount: Number(selectedGoal.currentAmount) + Number(progressAmount) }),
        credentials: 'include'
      });
      if (res.ok) {
        toast.success("Capital deposited!");
        setShowProgressModal(false);
        setProgressAmount('');
        fetchGoals();
      }
    } catch (err) { toast.error("Transmission failed"); }
    finally { setLoading(false); }
  };

  const confirmDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2">
          <Trash2 size={16} className="text-error" />
          <span className="text-xs font-bold font-sans text-on-surface">Confirm Goal Deletion</span>
        </div>
        <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed">
          Permanent removal of this goal? Existing progress will be cleared from your registry.
        </p>
        <div className="flex justify-end gap-2 mt-1">
          <button onClick={() => toast.dismiss(t.id)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface transition-all">Cancel</button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await fetch(`${API}/api/v1/goals/${id}`, { method: 'DELETE', credentials: 'include' });
                toast.success('Goal removed', { id: 'del-succ-goal', duration: 3000 });
                fetchGoals();
              } catch (err) {
                toast.error('Deletion failed');
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

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const aggregateProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  return (
    <div className="page-container animate-fade-in-up pb-10">

      {/* Header Section */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Financial Planning</p>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Track and achieve your long-term financial objectives.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary text-xs">
          <Plus size={14} /> New Goal
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        {[
          { label: 'Total Target', value: ` ${totalTarget.toLocaleString()}`, icon: Target, color: 'primary' },
          { label: 'Total Saved', value: `${totalSaved.toLocaleString()}`, icon: TrendingUp, color: 'secondary' },
          { label: 'Active Goals', value: goals.length, icon: Rocket, color: 'tertiary' },
          { label: 'Overall Progress', value: `${aggregateProgress}%`, icon: CheckCircle, color: 'success' }
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex justify-between items-start mb-3">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}/10 flex items-center justify-center text-${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider opacity-40">{stat.label}</span>
            </div>
            <h3 className="stat-value">{stat.label === 'Active Goals' ? '' : currencySymbol + ' '}{stat.value}</h3>
            {stat.label === 'Overall Progress' && (
              <div className="mt-3">
                <div className="progress-bar">
                  <div className="progress-fill bg-success" style={{ width: `${aggregateProgress}%` }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Interface Tabs */}
      <div className="flex bg-surface-container p-1 rounded-xl border border-glass-border w-fit mb-8">
        {['All Goals', 'Active', 'Completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilterState(tab)}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${filterState === tab ? 'bg-surface-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.filter(goal => {
          if (filterState === 'Active') return goal.currentAmount < goal.targetAmount;
          if (filterState === 'Completed') return goal.currentAmount >= goal.targetAmount;
          return true; // All Goals
        }).map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const isEditing = editingId === goal._id;

          return (
            <div key={goal._id} className="stat-card flex flex-col group relative overflow-hidden">
              {!isEditing && (
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                  <Target size={80} strokeWidth={1} />
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className={`badge ${progress >= 100 ? 'badge-success' : 'badge-primary'} mb-2`}>{progress >= 100 ? 'Completed' : 'Savings Goal'}</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1 text-lg font-bold text-on-surface focus:border-primary outline-none"
                    />
                  ) : (
                    <h3 className="text-lg font-bold text-on-surface leading-tight">{goal.name}</h3>
                  )}
                </div>
                {!isEditing && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => startInlineEdit(goal)} className="p-2 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => confirmDelete(goal._id)} className="p-2 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 mb-1">Saved</p>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-primary">{currencySymbol}</span>
                        <input
                          type="number"
                          value={editFormData.currentAmount}
                          onChange={(e) => setEditFormData({ ...editFormData, currentAmount: e.target.value })}
                          className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1 text-sm font-bold text-on-surface focus:border-primary outline-none"
                        />
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-on-surface">{currencySymbol} {goal.currentAmount.toLocaleString()}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 mb-1">Target</p>
                    {isEditing ? (
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-xs font-bold text-secondary">{currencySymbol}</span>
                        <input
                          type="number"
                          value={editFormData.targetAmount}
                          onChange={(e) => setEditFormData({ ...editFormData, targetAmount: e.target.value })}
                          className="w-24 bg-surface-lowest border border-glass-border rounded-lg px-2 py-1 text-sm font-bold text-secondary text-right focus:border-primary outline-none"
                        />
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-secondary">{currencySymbol} {goal.targetAmount.toLocaleString()}</p>
                    )}
                  </div>
                </div>

                {!isEditing ? (
                  <>
                    <div className="progress-bar h-2">
                      <div className="progress-fill bg-primary" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1">
                      <span>{Math.round(progress)}% Complete</span>
                      <span>End: {new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Deadline Date</label>
                      <input
                        type="date"
                        value={editFormData.deadline}
                        onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                        className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1.5 text-[12px] text-on-surface focus:border-primary outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleInlineSave(goal._id)}
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
                  </div>
                )}
              </div>

              {!isEditing && (
                <button
                  onClick={() => { setSelectedGoal(goal); setShowProgressModal(true); }}
                  className="btn btn-outline w-full mt-6 text-xs justify-center gap-2"
                >
                  <Plus size={14} /> Contribute
                </button>
              )}
            </div>
          );
        })}

        {/* Add New Goal Static Card */}
        <div
          onClick={() => setShowAddModal(true)}
          className="rounded-2xl border-2 border-dashed border-glass-border flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-surface-lowest transition-all group min-h-[300px] bg-surface-lowest/40"
        >
          <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Rocket size={24} className="text-primary" />
          </div>
          <h3 className="font-bold text-on-surface">Add New Goal</h3>
          <p className="text-xs text-on-surface-variant mt-2 max-w-[200px]">Create a new target to start saving towards.</p>
        </div>
      </div>

      {/* Unified Savings Goal Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <SavingsGoalModal
            isOpen={showAddModal || showEditModal}
            onClose={() => { setShowAddModal(false); setShowEditModal(false); setSelectedGoal(null); }}
            onRefresh={fetchGoals}
            API={API}
            currencySymbol={currencySymbol}
            initialData={selectedGoal}
          />
        )}
      </AnimatePresence>

      {/* Progress Update Modal */}
      <AnimatePresence>
        {showProgressModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4 animate-fade-in text-on-surface">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-surface-bright rounded-3xl shadow-2xl overflow-hidden border border-glass-border">

              <div className="bg-surface-lowest px-6 py-4 border-b border-glass-border flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-on-surface mb-0">Add Deposit</h3>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant font-black">Quick Contribution</p>
                </div>
                <button onClick={() => setShowProgressModal(false)} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-all">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-xs text-on-surface-variant mb-4">Adding money to: <span className="text-on-surface font-bold">{selectedGoal?.name}</span></p>
                <form onSubmit={handleUpdateProgress} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Amount ({currencySymbol})</label>
                    <div className="relative">
                      <Coins size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none" />
                      <input required type="number" autoFocus value={progressAmount} onChange={e => setProgressAmount(e.target.value)}
                        placeholder="e.g. 5000" className="w-full bg-surface-lowest border border-glass-border rounded-xl pl-9 pr-4 py-4 text-center text-xl font-bold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2">
                    {loading ? 'Saving...' : <><CheckCircle2 size={16} /> Confirm Deposit</>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}

    </div>
  );
};

export default SavingsGoals;
