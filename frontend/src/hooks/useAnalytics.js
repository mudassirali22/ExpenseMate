import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';

/**
 * Hook for managing analytics data, filtering, and reporting.
 * Extracts complex logic from the Analytics page component.
 */
export const useAnalytics = (filterType) => {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [actData, gData] = await Promise.all([
        apiClient.get('/api/v1/dashboard/activities?limit=2000'),
        apiClient.get('/api/v1/goals/get')
      ]);

      const acts = Array.isArray(actData.activities) ? actData.activities : [];
      setIncomes(acts.filter(a => a.type === 'income'));
      setExpenses(acts.filter(a => a.type === 'expense' || a.type === 'tax' || a.type === 'portfolio'));
      setGoals(Array.isArray(gData) ? gData : []);
    } catch (err) {
      console.error('Analytics Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    
    if (filterType === 'This Week') {
      const day = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
    } else if (filterType === 'Last 30 Days') {
      startDate.setDate(now.getDate() - 30);
    } else if (filterType === 'This Quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
    } else if (filterType === 'This Year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const filterFn = (item) => {
      const d = new Date(item.date || item.createdAt);
      return d >= startDate && d <= now;
    };

    return { 
      expenses: expenses.filter(filterFn), 
      incomes: incomes.filter(filterFn) 
    };
  }, [expenses, incomes, filterType]);

  const stats = useMemo(() => {
    const fExpenses = filteredData.expenses;
    const fIncomes  = filteredData.incomes;

    const totalIncome  = fIncomes.reduce((acc, i) => acc + i.amount, 0);
    const totalExpense = fExpenses.reduce((acc, e) => acc + e.amount, 0);
    const netSavings   = totalIncome - totalExpense;
    const activeSavings  = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
    
    const investmentVal  = fExpenses
      .filter(e => e.category?.toLowerCase() === 'investment')
      .reduce((acc, e) => acc + e.amount, 0);

    const portfolioGrowth = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

    const catTotals = {};
    fExpenses.forEach(e => {
      const cat = e.category || 'Other';
      catTotals[cat] = (catTotals[cat] || 0) + e.amount;
    });

    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const pieData = sortedCats.map(([name, value]) => ({ name, value }));
    const topCats = sortedCats.slice(0, 4);
    const totalSpending = Object.values(catTotals).reduce((a, b) => a + b, 0) || 1;
    const mainCatPct = topCats.length > 0 ? Math.round((topCats[0][1] / totalSpending) * 100) : 0;

    return {
      totalIncome,
      totalExpense,
      netSavings,
      activeSavings,
      investmentVal,
      portfolioGrowth,
      pieData,
      topCats,
      totalSpending,
      mainCatPct,
      fExpenses,
      fIncomes
    };
  }, [filteredData, goals]);

  return {
    loading,
    stats,
    goals,
    refresh: fetchData
  };
};
