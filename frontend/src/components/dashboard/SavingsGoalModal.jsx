import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, AlignLeft, Target, Coins, Calendar, CheckCircle2 } from 'lucide-react';

const SavingsGoalModal = ({ isOpen, onClose, onSave, currencySymbol, initialData = null }) => {
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
      setFormData({ name: '', targetAmount: '', currentAmount: '', deadline: '' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount || !formData.deadline) return;
    setLoading(true);
    const payload = {
      ...formData,
      targetAmount: Number(formData.targetAmount),
      currentAmount: Number(formData.currentAmount) || 0
    };
    const success = await onSave(payload);
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
            <h2 className="text-lg font-bold text-on-surface tracking-tight">{initialData ? 'Edit' : 'New'} Savings Goal</h2>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant font-black">{initialData ? 'Update Objective' : 'Financial Planning'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-all">
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
                  className="input-field !py-2.5 pl-9 pr-4" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Target ({currencySymbol})</label>
                <div className="relative">
                  <Target size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none" />
                  <input required type="number" placeholder="50000"
                    value={formData.targetAmount} onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="input-field !py-2.5 pl-9 pr-4 font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Starting ({currencySymbol})</label>
                <div className="relative">
                  <Coins size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none" />
                  <input type="number" placeholder="0"
                    value={formData.currentAmount} onChange={e => setFormData({ ...formData, currentAmount: e.target.value })}
                    className="input-field !py-2.5 pl-9 pr-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Deadline Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none" />
                <input required type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  className="input-field !py-2.5 pl-9 pr-3 text-[12px]" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn btn-primary !py-3.5 mt-2 gap-2">
              {loading ? 'Saving...' : <><CheckCircle2 size={16} /> {initialData ? 'Update Objective' : 'Save Goal'}</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SavingsGoalModal;
