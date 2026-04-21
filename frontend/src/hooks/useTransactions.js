import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

/**
 * Hook for managing transactions, filtering, and CRUD operations.
 * Extracts complex logic from the Transactions page component.
 */
export const useTransactions = () => {
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 15;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/v1/dashboard/activities?limit=2000');
      setAllActivities(data.activities || []);
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredActivities = useMemo(() => {
    return allActivities.filter(item => {
      // Type Filter
      if (activeTab === 'Income' && item.type !== 'income') return false;
      if (activeTab === 'Expense' && (item.type !== 'expense' || ['Tax', 'Subscription', 'Shared'].includes(item.displayType))) return false;
      if (activeTab === 'Tax' && item.displayType !== 'Tax') return false;
      if (activeTab === 'Investment' && item.type !== 'portfolio') return false;

      // Search Filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const t = item.title?.toLowerCase() || '';
        const c = (item.category || item.source || '').toLowerCase();
        const a = item.amount?.toString() || '';
        if (!t.includes(q) && !c.includes(q) && !a.includes(q)) return false;
      }

      // Date Filters
      if (dateFrom) {
        const d = new Date(item.date || item.createdAt);
        if (d < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const d = new Date(item.date || item.createdAt);
        const to = new Date(dateTo); 
        to.setHours(23, 59, 59);
        if (d > to) return false;
      }

      return true;
    });
  }, [allActivities, activeTab, searchQuery, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredActivities.length / limit) || 1;
  const paginatedActivities = filteredActivities.slice((currentPage - 1) * limit, currentPage * limit);

  const deleteTransaction = async (item) => {
    try {
      const endpoint = item.type === 'expense'
        ? `/api/v1/expenses/delete/${item._id}`
        : `/api/v1/income/delete/${item._id}`;

      await apiClient.delete(endpoint);
      toast.success('Transaction removed');
      fetchAll();
      return true;
    } catch (err) {
      toast.error('Deletion failed');
      return false;
    }
  };

  const updateTransaction = async (item, editFormData) => {
    try {
      const endpoint = item.type === 'expense'
        ? `/api/v1/expenses/update/${item._id}`
        : `/api/v1/income/update/${item._id}`;

      const payload = item.type === 'expense'
        ? { ...editFormData, method: 'Cash / Other' }
        : { ...editFormData, source: editFormData.category };

      await apiClient.put(endpoint, payload);
      toast.success('Update successful');
      fetchAll();
      return true;
    } catch (err) {
      toast.error(err.message || 'Update failed');
      return false;
    }
  };

  const counts = useMemo(() => ({
    All: allActivities.length,
    Income: allActivities.filter(i => i.type === 'income').length,
    Expense: allActivities.filter(i => i.type === 'expense' && !['Tax', 'Subscription', 'Shared'].includes(i.displayType)).length,
    Tax: allActivities.filter(i => i.displayType === 'Tax').length,
    Investment: allActivities.filter(i => i.type === 'portfolio').length,
  }), [allActivities]);

  return {
    allActivities,
    filteredActivities,
    paginatedActivities,
    loading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    currentPage,
    setCurrentPage,
    totalPages,
    counts,
    refresh: fetchAll,
    deleteTransaction,
    updateTransaction
  };
};
