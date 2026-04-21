import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Activity, FileText, CreditCard, Users, TrendingDown, ArrowUpRight, Pencil, Trash2, CheckCircle2, X } from 'lucide-react';
import { TYPE_COLORS, TRANSACTION_TYPES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants';

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

const TransactionTable = ({ activities, currencySymbol, updateTransaction, deleteTransaction, onEditModal }) => {
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

  const handleInlineSave = async (item) => {
    setIsSavingInline(true);
    const success = await updateTransaction(item, editFormData);
    if (success) setEditingId(null);
    setIsSavingInline(false);
  };

  return (
    <div className="space-y-3 relative">
      <AnimatePresence mode="popLayout">
        {activities.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card py-20 text-center border-dashed border border-glass-border">
            <Search size={22} className="text-on-surface-variant opacity-40 mx-auto mb-4" />
            <h3 className="text-sm font-semibold text-on-surface mb-1">No Transactions Found</h3>
          </motion.div>
        ) : activities.map(item => {
          if (editingId === item._id) {
            const categories = item.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
            return (
              <motion.div key={item._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr] gap-3 items-center px-4 py-3 rounded-xl border border-primary/30 bg-primary/5 shadow-inner">
                <input type="text" value={editFormData.title} onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1.5 text-[13px] text-on-surface" placeholder="Description" />
                <select value={editFormData.category} onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1.5 text-[12px] text-on-surface">
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.id}</option>)}
                </select>
                <input type="date" value={editFormData.date} onChange={e => setEditFormData({ ...editFormData, date: e.target.value })}
                  className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1 text-[11px] text-on-surface" />
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
                  <input type="number" value={editFormData.amount} onChange={e => setEditFormData({ ...editFormData, amount: e.target.value })}
                    className="w-20 bg-surface-lowest border border-glass-border rounded-lg px-2 py-1.5 text-[13px] font-bold text-on-surface" />
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleInlineSave(item)} disabled={isSavingInline} className="p-1.5 rounded-lg bg-success/10 text-success"><CheckCircle2 size={14} /></button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-error/10 text-error"><X size={14} /></button>
                  </div>
                </div>
              </motion.div>
            );
          }

          const isPositive = item.type === 'income' || item.type === 'portfolio';
          const colorKey = getTypeColorKey(item);

          return (
            <motion.div key={item._id} layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="group flex flex-col sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center px-4 py-3.5 rounded-xl border border-transparent hover:border-glass-border hover:bg-surface-lowest transition-all cursor-pointer bg-surface-lowest/60">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLORS[colorKey]}`}>{getTypeIcon(item)}</div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-on-surface truncate leading-tight">{item.title}</p>
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-60 bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant">{item.displayType || item.type}</span>
                </div>
              </div>
              <p className="hidden sm:block text-[12px] font-medium text-on-surface-variant truncate">{item.category || item.source || 'General'}</p>
              <p className="hidden sm:block text-[11px] font-medium text-on-surface-variant opacity-70">{new Date(item.date || item.createdAt).toLocaleDateString()}</p>
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                <p className={`text-[13px] font-bold tracking-tight ${isPositive ? 'text-success' : 'text-error'}`}>
                  {isPositive ? '+' : '-'}{currencySymbol} {item.amount?.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); startInlineEdit(item); }} className="p-1 rounded bg-primary/10 text-primary"><Pencil size={12} /></button>
                  <button onClick={(e) => { e.stopPropagation(); deleteTransaction(item); }} className="p-1 rounded bg-error/10 text-error"><Trash2 size={12} /></button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default TransactionTable;
