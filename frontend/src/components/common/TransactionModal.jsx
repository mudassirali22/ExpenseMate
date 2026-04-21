import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, AlignLeft, Calendar, Filter, ChevronDown, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../utils/apiClient';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TRANSACTION_TYPES } from '../../constants';

const TransactionModal = ({ isOpen, onClose, onRefresh, currencySymbol, initialData = null }) => {
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
      const isEdit = !!initialData;
      const endpoint = isEdit
        ? (type === 'expense' ? `/api/v1/expenses/update/${initialData._id}` : `/api/v1/income/update/${initialData._id}`)
        : (type === 'expense' ? `/api/v1/expenses/add` : `/api/v1/income/addIncome`);

      const payload = type === 'expense'
        ? { title: formData.title, amount: Number(formData.amount), category: formData.category, date: formData.date, notes: formData.notes, method: 'Cash / Other' }
        : { title: formData.title, amount: Number(formData.amount), source: formData.category, date: formData.date, notes: formData.notes };

      if (isEdit) {
        await apiClient.put(endpoint, payload);
      } else {
        await apiClient.post(endpoint, payload);
      }

      toast.success(isEdit ? 'Transaction updated!' : 'Transaction recorded!');
      handleClose();
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Amount</label>
                <input required type="number" placeholder="0"
                  value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-surface-lowest border border-glass-border rounded-xl px-4 py-2.5 text-[13px] font-bold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all" />
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

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Notes</label>
              <textarea rows={2} placeholder="Add a quick note..."
                value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-surface-lowest border border-glass-border rounded-xl px-4 py-2.5 text-[12px] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all resize-none" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2">
              {loading ? 'Saving...' : <><CheckCircle2 size={16} /> Save {type === 'expense' ? 'Expense' : 'Income'}</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
