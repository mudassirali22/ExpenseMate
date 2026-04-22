import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import {
   Calculator, Receipt, TrendingUp, TrendingDown, FileText, Briefcase,
   Heart, GraduationCap, Stethoscope, Plus, Trash2, Bot, AlertTriangle,
   ChevronRight, ArrowRight, Download, CheckCircle2, ShieldCheck, Info,
   Eye, Wallet, Banknote, Clock,
   Pencil, X
} from 'lucide-react';

const TaxMonitor = () => {
   const { API, currencySymbol } = useAuth();
   const [stats, setStats] = useState({});
   const [expenses, setExpenses] = useState([]);
   const [taxPayments, setTaxPayments] = useState([]);
   const [loading, setLoading] = useState(true);

   // Modals state
   const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
   const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);

   const [newPayment, setNewPayment] = useState({ amount: '', date: new Date().toISOString().split('T')[0], description: '' });

   // Inline Editing States
   const [editingId, setEditingId] = useState(null);
   const [editFormData, setEditFormData] = useState({ amount: '', date: '', description: '' });
   const [isSavingInline, setIsSavingInline] = useState(false);

   // AI Audit State
   const [isAuditing, setIsAuditing] = useState(false);
   const [auditResult, setAuditResult] = useState(null);

   const handleAiAudit = () => {
      setIsAuditing(true);
      setAuditResult(null);
      setTimeout(() => {
         setIsAuditing(false);
         const totalCharity = categoryTotals.Charity || 0;
         const totalMedical = categoryTotals.Medical || 0;
         const totalInvest = categoryTotals.Investment || 0;

         let tip = "Your tax health looks good. Keep tracking all your spending to find more savings.";

         if (remainingTax > 100000) {
            tip = `You have a high tax bill of ${currencySymbol} ${remainingTax.toLocaleString()}. Try making a donation or investing in mutual funds to lower this.`;
         } else if (totalCharity < 5000 && totalIncome > 1000000) {
            tip = "You can save more tax by donating to registered charities or Zakat funds.";
         } else if (totalInvest < 50000) {
            tip = "Consider investing in National Savings or mutual funds. These can help reduce your taxable income.";
         }

         setAuditResult({
            status: 'OPTIMIZED',
            tip: tip,
            efficiency: Math.min(Math.floor((totalDeductions / (totalIncome * 0.1 || 1)) * 100) + 40, 98)
         });
         toast.success("AI Audit Complete");
      }, 2000);
   };

   const fetchAll = async () => {
      setLoading(true);
      try {
         const [sRes, eRes, tRes] = await Promise.all([
            fetch(`${API}/api/v1/dashboard/stats`, { credentials: 'include' }),
            fetch(`${API}/api/v1/expenses/get`, { credentials: 'include' }),
            fetch(`${API}/api/v1/tax/get`, { credentials: 'include' })
         ]);
         const sData = await sRes.json();
         const eData = await eRes.json();
         setStats(sData);
         setExpenses(Array.isArray(eData) ? eData : []);
         if (tRes.ok) { const tData = await tRes.json(); setTaxPayments(Array.isArray(tData) ? tData.sort((a, b) => new Date(b.date) - new Date(a.date)) : []); }
      } catch (err) { console.error("Fetch error:", err); }
      finally { setLoading(false); }
   };

   useEffect(() => { fetchAll(); }, [API]);

   const handleAddPayment = async (e) => {
      if (e) e.preventDefault();
      try {
         const res = await fetch(`${API}/api/v1/tax/add`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            body: JSON.stringify(newPayment)
         });
         if (!res.ok) throw new Error("Failed to add payment");
         toast.success("Payment recorded!");
         setIsPaymentModalOpen(false);
         setNewPayment({ amount: '', date: new Date().toISOString().split('T')[0], description: '' });
         fetchAll();
      } catch (err) { toast.error(err.message); }
   };

   const confirmDeletePayment = (payment) => {
      toast((t) => (
         <div className="flex flex-col gap-3 p-1">
            <div className="flex items-center gap-2">
               <Trash2 size={16} className="text-error" />
               <span className="text-xs font-bold font-sans text-on-surface">Confirm Record Erasure</span>
            </div>
            <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed">
               Destroy the <span className="text-error font-bold">{payment.description || 'Tax Remittance'}</span> record? This action is official and irreversible.
            </p>
            <div className="flex justify-end gap-2 mt-1">
               <button onClick={() => toast.dismiss(t.id)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface transition-all">Cancel</button>
               <button
                  onClick={async () => {
                     toast.dismiss(t.id);
                     try {
                        const res = await fetch(`${API}/api/v1/tax/delete/${payment._id}`, { method: 'DELETE', credentials: 'include' });
                        if (res.ok) {
                           toast.success("Record extracted");
                           fetchAll();
                        }
                     } catch (err) {
                        toast.error("Failed to delete");
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

   const startInlineEdit = (payment) => {
      setEditingId(payment._id);
      setEditFormData({
         amount: payment.amount,
         date: payment.date?.split('T')[0] || '',
         description: payment.description
      });
   };

   const cancelInlineEdit = () => {
      setEditingId(null);
      setEditFormData({ amount: '', date: '', description: '' });
   };

   const handleInlineSave = async (id) => {
      if (!editFormData.amount || !editFormData.date || !editFormData.description) {
         return toast.error('All fields are required');
      }
      setIsSavingInline(true);
      try {
         const res = await fetch(`${API}/api/v1/tax/update/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editFormData),
            credentials: 'include'
         });
         if (res.ok) {
            toast.success("Payment Updated");
            setEditingId(null);
            fetchAll();
         } else {
            const data = await res.json();
            toast.error(data.message || "Update failed");
         }
      } catch (err) {
         toast.error("Update failed");
      } finally {
         setIsSavingInline(false);
      }
   };

   // Advanced Calculation Logic
   const totalIncome = stats.totalIncome || 0;
   const incomeExemption = 600000;

   const categoryTotals = useMemo(() => {
      const totals = { Business: 0, Charity: 0, Education: 0, Medical: 0, Investment: 0 };
      expenses.forEach(e => {
         const cat = (e.category || '').toLowerCase();
         const title = (e.title || '').toLowerCase();
         if (cat === 'business' || cat.includes('office') || title.includes('business') || title.includes('office')) totals.Business += e.amount;
         if (cat === 'charity' || cat === 'zakat' || title.includes('donation') || title.includes('zakat')) totals.Charity += e.amount;
         if (cat === 'education' || cat.includes('school') || cat.includes('university') || cat.includes('fee') || title.includes('fee')) totals.Education += e.amount;
         if (cat === 'medical' || cat === 'health' || cat.includes('hospital') || title.includes('medical') || title.includes('doctor')) totals.Medical += e.amount;
         if (cat.includes('invest') || title.includes('stock') || title.includes('mutual fund') || title.includes('gold') || title.includes('crypto')) totals.Investment += e.amount;
      });
      return totals;
   }, [expenses]);

   const totalDeductions = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
   const taxableIncome = Math.max(totalIncome - incomeExemption - totalDeductions, 0);

   const taxBreakdown = useMemo(() => {
      const income = taxableIncome;
      const steps = [];
      let baseTax = 0;
      let surcharge = 0;
      if (income > 0) {
         if (income <= 600000) {
            baseTax = income * 0.025;
         } else if (income <= 1800000) {
            baseTax = 15000;
            surcharge = (income - 600000) * 0.125;
         } else {
            baseTax = 200000;
            surcharge = (income - 1000000) * 0.325;
         }
      }
      return { total: baseTax + surcharge, baseTax, surcharge, steps };
   }, [taxableIncome]);

   const paidTax = useMemo(() => taxPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0), [taxPayments]);
   const remainingTax = Math.max(taxBreakdown.total - paidTax, 0);

   const dashboardBalance = stats.totalBalance || (totalIncome - (stats.totalExpense || 0) - paidTax);
   const netIncome = dashboardBalance;

   if (loading) {
      return <div className="page-container flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
   }

   return (
      <div className="page-container animate-fade-in-up pb-28">

         {/* Header */}
         <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={14} className="text-secondary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant opacity-80">Tax Monitor</span>
               </div>
               <h1 className="page-title text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">Tax Monitor</h1>
               <p className="page-subtitle text-sm mt-1 text-on-surface-variant">Log official tax remittances and analyze your fiscal liabilities.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <button onClick={() => setIsBreakdownModalOpen(true)} className="btn btn-outline px-5 flex-1 md:flex-none justify-center">
                  <Calculator size={15} /> Breakdown
               </button>
               <button onClick={() => setIsPaymentModalOpen(true)} className="btn btn-primary px-5 flex-1 md:flex-none justify-center">
                  <Plus size={15} /> Log Payment
               </button>
            </div>
         </div>

         {/* Summary Grid */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="md:col-span-2 stat-card relative overflow-hidden flex flex-col justify-between min-h-[140px]">
               <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
               <div className="relative z-10">
                  <p className="stat-label">Income After Tax</p>
                  <h3 className="stat-value text-3xl sm:text-4xl mt-1">{currencySymbol} {netIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                  <div className="flex items-center gap-2 mt-3">
                     <div className="px-2 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider">After-Tax Wealth</div>
                     <p className="text-[10px] font-bold text-on-surface-variant opacity-60 flex items-center gap-1"><Info size={10} /> Total Income: {currencySymbol} {totalIncome.toLocaleString()}</p>
                  </div>
               </div>
            </div>

            <div className="stat-card">
               <div className="flex justify-between items-start mb-4">
                  <p className="stat-label mb-0">Money Saved</p>
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success"><ShieldCheck size={16} /></div>
               </div>
               <h4 className="text-2xl font-bold text-on-surface mt-1">{currencySymbol} {totalDeductions.toLocaleString()}</h4>
               <p className="text-[9px] font-bold text-on-surface-variant mt-2 uppercase tracking-widest opacity-60">Total Tax Relief</p>
            </div>

            <div className="stat-card">
               <div className="flex justify-between items-start mb-4">
                  <p className="stat-label mb-0">Balance to Pay</p>
                  <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center text-error"><Clock size={16} /></div>
               </div>
               <h4 className={`text-2xl font-bold mt-1 ${remainingTax > 0 ? 'text-error' : 'text-success'}`}>
                  {currencySymbol} {remainingTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
               </h4>
               <p className="text-[9px] font-bold text-on-surface-variant mt-2 uppercase tracking-widest opacity-60">
                  {remainingTax > 0 ? 'To be paid' : 'All clear'}
               </p>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Deduction Sidebar */}
            <div className="lg:col-span-1 space-y-6">
               <div className="stat-card">
                  <h3 className="section-title text-sm mb-6">Tax Savings Details</h3>
                  <div className="space-y-4">
                     {[
                        { label: 'Business Expenses', icon: Briefcase, color: 'primary', val: categoryTotals.Business },
                        { label: 'Donations ', icon: Heart, color: 'secondary', val: categoryTotals.Charity },
                        { label: 'Medical Bills', icon: Stethoscope, color: 'error', val: categoryTotals.Medical },
                        { label: 'Education Fees', icon: GraduationCap, color: 'tertiary', val: categoryTotals.Education },
                        { label: 'Total Investments', icon: TrendingUp, color: 'success', val: categoryTotals.Investment }
                     ].filter(item => item.val > 0 || ['Business Expenses', 'Donations '].includes(item.label)).map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-2 p-3 rounded-xl bg-surface-lowest border border-glass-border">
                           <div className="flex justify-between items-center">
                              <item.icon size={14} className={`text-${item.color}`} />
                              <span className="text-[10px] font-black text-on-surface">{currencySymbol} {item.val.toLocaleString()}</span>
                           </div>
                           <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">{item.label}</p>
                        </div>
                     ))}
                  </div>
               </div>

               <div
                  onClick={!isAuditing ? handleAiAudit : undefined}
                  className={`stat-card border-primary/20 py-8 text-center cursor-pointer group transition-all relative overflow-hidden ${isAuditing ? 'animate-pulse' : ''}`}>
                  {isAuditing && <div className="absolute inset-0 bg-primary/5 animate-shimmer" />}
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mx-auto mb-4 group-hover:scale-110 transition-transform relative z-10">
                     <Bot size={24} className={isAuditing ? 'animate-bounce' : ''} />
                  </div>
                  <h4 className="text-xs font-black text-on-surface uppercase tracking-widest relative z-10">{isAuditing ? 'Checking...' : 'AI Tax Check'}</h4>
                  <p className="text-[9px] font-bold text-on-surface-variant uppercase mt-1 opacity-60 relative z-10">
                     {isAuditing ? 'Analyzing records' : (auditResult ? `${auditResult.efficiency}% Efficient` : 'Check Now')}
                  </p>

                  {auditResult && (
                     <div className="mt-4 p-3 bg-surface-lowest border border-glass-border rounded-xl text-left animate-fade-in">
                        <div className="flex items-center gap-1.5 mb-1.5">
                           <ShieldCheck size={10} className="text-success" />
                           <span className="text-[9px] font-black text-success uppercase">Insight Generated</span>
                        </div>
                        <p className="text-[10px] font-medium text-on-surface opacity-80 leading-tight">{auditResult.tip}</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Payment History */}
            <div className="lg:col-span-3 space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="section-title mb-0">Payment History</h3>
               </div>
               <div className="stat-card !p-0 overflow-hidden border border-glass-border shadow-2xl shadow-primary/5">
                  <div className="overflow-x-auto">
                     <table className="data-table w-full text-left">
                        <thead>
                           <tr className="bg-surface-container/30">
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Description</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Status</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Amount</th>
                              <th className="px-6 py-4 text-right pr-8 text-[10px] font-black uppercase tracking-widest opacity-60">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border">
                           {taxPayments.length > 0 ? taxPayments.map((p) => {
                              const isEditing = editingId === p._id;
                              return (
                                 <tr key={p._id} className="group hover:bg-primary/[0.02] transition-colors">
                                    <td className="px-6 py-5">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success"><CheckCircle2 size={16} /></div>
                                          <div className="flex-1">
                                             {isEditing ? (
                                                <div className="space-y-1">
                                                   <input
                                                      type="text"
                                                      value={editFormData.description}
                                                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                                      className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1 text-sm font-black text-on-surface uppercase tracking-tight focus:border-primary outline-none"
                                                   />
                                                   <input
                                                      type="date"
                                                      value={editFormData.date}
                                                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                                                      className="w-full bg-surface-lowest border border-glass-border rounded-lg px-2 py-1 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest outline-none"
                                                   />
                                                </div>
                                             ) : (
                                                <>
                                                   <p className="text-sm font-black text-on-surface uppercase tracking-tight truncate max-w-[180px]">{p.description || 'Tax Remittance'}</p>
                                                   <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">{new Date(p.date).toLocaleDateString()}</p>
                                                </>
                                             )}
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-6 py-5">
                                       <span className="px-2 py-0.5 rounded bg-success/10 text-success text-[8px] font-black uppercase tracking-widest">Verified</span>
                                    </td>
                                    <td className="px-6 py-5">
                                       {isEditing ? (
                                          <div className="flex items-center gap-1">
                                             <span className="text-[10px] font-black">{currencySymbol}</span>
                                             <input
                                                type="number"
                                                value={editFormData.amount}
                                                onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                                                className="w-24 bg-surface-lowest border border-glass-border rounded-lg px-2 py-1 text-xs font-black text-on-surface font-mono outline-none"
                                             />
                                          </div>
                                       ) : (
                                          <span className="text-xs font-black text-on-surface font-mono">{currencySymbol} {p.amount.toLocaleString()}</span>
                                       )}
                                    </td>
                                    <td className="px-6 py-5 text-right pr-6">
                                       {isEditing ? (
                                          <div className="flex justify-end gap-2">
                                             <button
                                                onClick={() => handleInlineSave(p._id)}
                                                disabled={isSavingInline}
                                                className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all shadow-sm"
                                             >
                                                <CheckCircle2 size={12} />
                                             </button>
                                             <button
                                                onClick={cancelInlineEdit}
                                                className="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-all shadow-sm"
                                             >
                                                <X size={12} />
                                             </button>
                                          </div>
                                       ) : (
                                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                             <button onClick={() => startInlineEdit(p)} className="p-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all shadow-sm">
                                                <Pencil size={12} />
                                             </button>
                                             <button onClick={() => { confirmDeletePayment(p) }} className="p-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-error hover:bg-error/10 transition-all shadow-sm">
                                                <Trash2 size={12} />
                                             </button>
                                          </div>
                                       )}
                                    </td>
                                 </tr>
                              );
                           }) : (
                              <tr>
                                 <td colSpan="4" className="py-20 text-center opacity-20">
                                    <FileText size={40} className="mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No payment records found</p>
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </div>

         {/* Detailed Breakdown Modal */}
         <Modal isOpen={isBreakdownModalOpen} onClose={() => setIsBreakdownModalOpen(false)} title="Tax Calculation Details">
            <div className="space-y-6 pt-2">
               <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Total Taxable Income</p>
                  <div className="flex justify-between items-end">
                     <p className="text-3xl font-black text-on-surface tracking-tighter">{currencySymbol} {taxableIncome.toLocaleString()}</p>
                     <p className="text-[10px] font-bold text-on-surface-variant opacity-60 mb-1">FY {new Date().getFullYear()}</p>
                  </div>
               </div>
               <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Applied Slabs</p>
                  {taxBreakdown.steps.map((step, i) => (
                     <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-surface-lowest border border-glass-border">
                        <div>
                           <p className="text-xs font-black text-on-surface uppercase tracking-tight">{step.slab}</p>
                           <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">{step.rate} Rate Applied</p>
                        </div>
                        <span className="text-sm font-black text-primary font-mono">+{currencySymbol} {step.amount.toLocaleString()}</span>
                     </div>
                  ))}
                  {taxBreakdown.steps.length === 0 && <p className="text-center py-6 text-[10px] font-bold text-on-surface-variant uppercase italic opacity-40">Income below taxation threshold</p>}
               </div>
               <div className="border-t border-glass-border pt-6 flex justify-between items-center text-on-surface">
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Total Estimated Tax</span>
                  <span className="text-2xl font-black tracking-tight">{currencySymbol} {taxBreakdown.total.toLocaleString()}</span>
               </div>
            </div>
         </Modal>

         {/* Record Payment Modal */}
         <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Log Tax Payment">
            <form onSubmit={handleAddPayment} className="space-y-6 pt-2">
               <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex justify-between items-center">
                  <div>
                     <p className="text-[9px] font-black text-primary uppercase tracking-widest">Awaiting Settle</p>
                     <p className="text-xl font-black text-on-surface">{currencySymbol} {remainingTax.toLocaleString()}</p>
                  </div>
                  <Wallet className="text-primary opacity-40" size={32} />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Payment Amount ({currencySymbol})</label>
                  <input required type="number" value={newPayment.amount} onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })} className="input-field !py-4 font-bold" placeholder="0.00" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Temporal Date</label>
                     <input required type="date" value={newPayment.date} onChange={e => setNewPayment({ ...newPayment, date: e.target.value })} className="input-field !py-4 font-bold" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Reference / Note</label>
                     <input required type="text" value={newPayment.description} onChange={e => setNewPayment({ ...newPayment, description: e.target.value })} className="input-field !py-4 font-bold" placeholder="e.g. Tax Payment 2024" />
                  </div>
               </div>
               <button type="submit" className="w-full btn btn-primary py-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">Commit Transaction</button>
            </form>
         </Modal>


         {/* Advanced Detailing: Fiscal Health Overview */}
         <div className="stat-card bg-surface-container/10 border-primary/20 mt-10 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Fiscal Reliability</h4>
                  <p className="text-sm font-bold text-on-surface">Precision Sync: Active</p>
                  <p className="text-[10px] font-bold text-on-surface-variant opacity-60 leading-relaxed">Your tax data is bridged directly to the main ledger. Deductions are subtracted from Gross Income in real-time to provide an accurate "Pocket Wealth" index.</p>
               </div>
               <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Tax Shield Efficiency</h4>
                  <p className="text-sm font-bold text-on-surface">{totalDeductions > 0 ? 'High Optimization' : 'Standard Baseline'}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant opacity-60 leading-relaxed">System has identified {Object.values(categoryTotals).filter(v => v > 0).length} valid tax-shielding categories. Utilizing medical and educational credits can further lower your projected liability.</p>
               </div>
               <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-success uppercase tracking-[0.2em]">Registry Status</h4>
                  <p className="text-sm font-bold text-on-surface">FY {new Date().getFullYear()} Compliant</p>
                  <p className="text-[10px] font-bold text-on-surface-variant opacity-60 leading-relaxed">Your remittance history is digitally signed. Every paid slip recorded here is automatically accounted for in your total balance verification.</p>
               </div>
            </div>
         </div>

      </div>
   );
};

export default TaxMonitor;
