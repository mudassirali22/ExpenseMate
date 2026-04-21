import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

/**
 * Hook for managing budgets and related transaction data.
 * Extracts business logic from the Budgets page component.
 */
export const useBudgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = useCallback(async () => {
    try {
      const data = await apiClient.get('/api/v1/budgets/get');
      setBudgets(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to sync budgets");
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await apiClient.get('/api/v1/expenses/transactions?limit=5000');
      setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
    } catch (err) {
      console.error('Failed to load transactions', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchBudgets(), fetchTransactions()]);
    setLoading(false);
  }, [fetchBudgets, fetchTransactions]);

  useEffect(() => {
    refreshAll();
    const handleFocus = () => refreshAll();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshAll]);

  const deleteBudget = async (id) => {
    try {
      await apiClient.delete(`/api/v1/budgets/delete/${id}`);
      toast.success("Budget removed");
      refreshAll();
      return true;
    } catch (err) {
      toast.error("Deletion failure");
      return false;
    }
  };

  const updateBudget = async (id, payload) => {
    try {
      await apiClient.put(`/api/v1/budgets/update/${id}`, payload);
      toast.success('Budget Updated');
      refreshAll();
      return true;
    } catch (err) {
      toast.error(err.message || 'Update failed');
      return false;
    }
  };

  const addBudget = async (payload) => {
    try {
      await apiClient.post('/api/v1/budgets/add', payload);
      toast.success('Budget created!');
      refreshAll();
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to save');
      return false;
    }
  };

  const stats = useMemo(() => {
    const totalBudget = budgets.reduce((s, b) => s + (b.limit || 0), 0);
    const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
    const utilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const remainingValue = Math.max(totalBudget - totalSpent, 0);

    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = lastDay - now.getDate() + 1;
    const safeDailySpend = daysRemaining > 0 ? (remainingValue / daysRemaining) : 0;

    return {
      totalBudget,
      totalSpent,
      utilization,
      remainingValue,
      daysRemaining,
      safeDailySpend
    };
  }, [budgets]);

  return {
    budgets,
    transactions,
    loading,
    refresh: refreshAll,
    deleteBudget,
    updateBudget,
    addBudget,
    stats
  };
};
