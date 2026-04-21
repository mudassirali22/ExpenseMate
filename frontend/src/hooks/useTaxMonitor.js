import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

/**
 * Hook for managing tax records, deductions, and AI audit logic.
 * Extracts business logic from the TaxMonitor page component.
 */
export const useTaxMonitor = () => {
  const [stats, setStats] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [taxPayments, setTaxPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sData, eData, tData] = await Promise.all([
        apiClient.get('/api/v1/dashboard/stats'),
        apiClient.get('/api/v1/expenses/get'),
        apiClient.get('/api/v1/tax/get')
      ]);
      setStats(sData);
      setExpenses(Array.isArray(eData) ? eData : []);
      setTaxPayments(Array.isArray(tData) ? tData.sort((a, b) => new Date(b.date) - new Date(a.date)) : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addPayment = async (payload) => {
    try {
      await apiClient.post('/api/v1/tax/add', payload);
      toast.success("Payment recorded!");
      fetchData();
      return true;
    } catch (err) {
      toast.error(err.message || "Failed to add payment");
      return false;
    }
  };

  const updatePayment = async (id, payload) => {
    try {
      await apiClient.put(`/api/v1/tax/update/${id}`, payload);
      toast.success("Payment Updated");
      fetchData();
      return true;
    } catch (err) {
      toast.error(err.message || "Update failed");
      return false;
    }
  };

  const deletePayment = async (id) => {
    try {
      await apiClient.delete(`/api/v1/tax/delete/${id}`);
      toast.success("Record extracted");
      fetchData();
      return true;
    } catch (err) {
      toast.error("Failed to delete");
      return false;
    }
  };

  const calculations = useMemo(() => {
    const totalIncome = stats.totalIncome || 0;
    const incomeExemption = 600000;

    const categoryTotals = { Business: 0, Charity: 0, Education: 0, Medical: 0, Investment: 0 };
    expenses.forEach(e => {
      const cat = (e.category || '').toLowerCase();
      const title = (e.title || '').toLowerCase();
      if (cat === 'business' || cat.includes('office') || title.includes('business') || title.includes('office')) categoryTotals.Business += e.amount;
      if (cat === 'charity' || cat === 'zakat' || title.includes('donation') || title.includes('zakat')) categoryTotals.Charity += e.amount;
      if (cat === 'education' || cat.includes('school') || cat.includes('university') || cat.includes('fee') || title.includes('fee')) categoryTotals.Education += e.amount;
      if (cat === 'medical' || cat === 'health' || cat.includes('hospital') || title.includes('medical') || title.includes('doctor')) categoryTotals.Medical += e.amount;
      if (cat.includes('invest') || title.includes('stock') || title.includes('mutual fund') || title.includes('gold') || title.includes('crypto')) categoryTotals.Investment += e.amount;
    });

    const totalDeductions = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const taxableIncome = Math.max(totalIncome - incomeExemption - totalDeductions, 0);

    let baseTax = 0;
    let surcharge = 0;
    if (taxableIncome > 0) {
      if (taxableIncome <= 600000) baseTax = taxableIncome * 0.025;
      else if (taxableIncome <= 1800000) { baseTax = 15000; surcharge = (taxableIncome - 600000) * 0.125; }
      else { baseTax = 200000; surcharge = (taxableIncome - 1000000) * 0.325; }
    }
    const totalTax = baseTax + surcharge;
    const paidTax = taxPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const remainingTax = Math.max(totalTax - paidTax, 0);
    const netIncome = (stats.totalBalance || (totalIncome - (stats.totalExpense || 0) - paidTax));

    return {
      totalIncome,
      totalDeductions,
      taxableIncome,
      totalTax,
      paidTax,
      remainingTax,
      netIncome,
      categoryTotals
    };
  }, [stats, expenses, taxPayments]);

  const runAiAudit = useCallback(() => {
    setIsAuditing(true);
    setAuditResult(null);
    
    // Simulate complex AI processing
    setTimeout(() => {
      const { remainingTax, totalDeductions, totalIncome, categoryTotals } = calculations;
      let tip = "Your tax health looks good. Keep tracking all your spending to find more savings.";
      
      if (remainingTax > 100000) tip = `High tax bill detected. Consider strategic investments or charitable contributions to lower liabilities.`;
      else if (categoryTotals.Charity < 5000 && totalIncome > 1000000) tip = "You can save more tax by donating to registered charities or Zakat funds.";
      else if (categoryTotals.Investment < 50000) tip = "Consider investing in National Savings or mutual funds to reduce taxable income.";
      
      setAuditResult({
        status: 'OPTIMIZED',
        tip: tip,
        efficiency: Math.min(Math.floor((totalDeductions / (totalIncome * 0.1 || 1)) * 100) + 40, 98)
      });
      setIsAuditing(false);
      toast.success("AI Audit Complete");
    }, 1500);
  }, [calculations]);

  return {
    taxPayments,
    loading,
    refresh: fetchData,
    addPayment,
    updatePayment,
    deletePayment,
    runAiAudit,
    isAuditing,
    auditResult,
    calculations
  };
};
