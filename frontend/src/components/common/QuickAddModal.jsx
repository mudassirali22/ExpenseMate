import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Calendar, AlignLeft, Filter, ChevronDown, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import { motion } from 'framer-motion';

const QuickAddModal = ({ isOpen, onClose, onRefresh }) => {
  const { API, currencySymbol } = useAuth();
  const [type, setType] = useState('expense');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.title) return toast.error('Title and amount are required');
    if (!formData.category) return toast.error('Please select a category');
    
    setLoading(true);
    try {
      const endpoint = type === 'expense' ? '/api/v1/expenses/add' : '/api/v1/income/addIncome';
      const payload = type === 'expense' ? {
        title: formData.title,
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
        notes: formData.notes,
        method: 'Cash / Other'
      } : {
        title: formData.title,
        amount: Number(formData.amount),
        source: formData.category,
        date: formData.date,
        notes: formData.notes
      };

      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const data = await res.json();

      if (data.success || res.ok) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`);
        onClose();
        setFormData({
          title: '',
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        if (onRefresh) onRefresh();
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (err) {
      toast.error('Failed to save transaction');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = type === 'expense'
    ? ['Housing', 'Food', 'Transport', 'Shopping', 'Health', 'Education', 'Entertainment', 'Bills', 'Utilities', 'Other']
    : ['Salary', 'Freelancing', 'Investments', 'Gift', 'Other'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Add"
      subtitle="Fast transaction entry"
    >
      {/* Type Toggle */}
      <div className="flex bg-surface-lowest border border-glass-border p-1 rounded-2xl mb-5">
        {['expense', 'income'].map(t => (
          <button key={t} type="button" onClick={() => { setType(t); setFormData(f => ({ ...f, category: '' })); }}
            className={`flex-1 py-1.5 rounded-xl font-bold text-[11px] transition-all capitalize relative z-10 ${type === t ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {type === t && (
              <motion.div
                layoutId="quick-add-type-indicator"
                className="absolute inset-0 bg-primary/10 border border-primary/20 shadow-sm rounded-xl -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{t}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Description</label>
          <div className="relative">
            <AlignLeft size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
            <input required type="text" placeholder="Transaction title..."
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
                <option key={cat} value={cat}>{cat}</option>
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
          {loading ? 'Saving...' : <><CheckCircle2 size={16} /> Save Now</>}
        </button>
      </form>
    </Modal>
  );
};

export default QuickAddModal;
