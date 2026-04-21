import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, AlignLeft, Wallet, Filter, CheckCircle2, ChevronDown } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../../constants';

const BudgetModal = ({ isOpen, onClose, onSave, currencySymbol, initialData = null }) => {
  const [formData, setFormData] = useState({ name: '', category: '', limit: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        limit: initialData.limit || ''
      });
    } else {
      setFormData({ name: '', category: '', limit: '' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.limit) return;
    setLoading(true);
    const success = await onSave(formData);
    if (success) onClose();
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4 animate-fade-in text-on-surface">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-surface-bright rounded-3xl shadow-2xl overflow-hidden border border-glass-border">
        <div className="bg-surface-lowest px-6 py-4 border-b border-glass-border flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold text-on-surface tracking-tight">{initialData ? 'Edit' : 'New'} Budget Quota</h2>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant font-black">{initialData ? 'Update Protocol' : 'Spending Controls'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Budget Name</label>
              <div className="relative">
                <AlignLeft size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                <input required type="text" placeholder="e.g. Daily Groceries, Rent..."
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-field !py-2.5 pl-9 pr-4" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Category</label>
                <div className="relative">
                  <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none" />
                  <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="input-field !py-2.5 pl-9 pr-4 appearance-none">
                    <option value="" disabled>Select Category</option>
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.id}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Limit ({currencySymbol})</label>
                <div className="relative">
                  <Wallet size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none" />
                  <input required type="number" placeholder="5000"
                    value={formData.limit} onChange={e => setFormData({ ...formData, limit: e.target.value })}
                    className="input-field !py-2.5 pl-9 pr-4 font-bold" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn btn-primary !py-3.5 mt-2 gap-2">
              {loading ? 'Saving...' : <><CheckCircle2 size={16} /> {initialData ? 'Update Protocol' : 'Deploy Budget'}</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default BudgetModal;
