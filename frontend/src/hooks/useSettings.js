import { useState, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

/**
 * Hook for managing application settings, security, and data exports.
 * Encapsulates profile updates and account management logic.
 */
export const useSettings = (user, refreshUser, logout) => {
  const [loading, setLoading] = useState(false);

  const updateProfile = useCallback(async (updates) => {
    try {
      await apiClient.put('/api/v1/auth/profile', updates);
      toast.success('System preferences updated');
      refreshUser();
      return true;
    } catch (err) {
      toast.error(err.message || 'Update failed');
      return false;
    }
  }, [refreshUser]);

  const sendPasswordReset = useCallback(async () => {
    try {
      await apiClient.post('/api/v1/auth/forgot-password', { email: user?.email });
      toast.success('Security link dispatched to your email');
      return true;
    } catch (err) {
      toast.error(err.message || 'Operation failed');
      return false;
    }
  }, [user]);

  const exportData = useCallback(async () => {
    toast.loading('Compiling financial records...', { id: 'export' });
    try {
      const BASE_URL = import.meta.env.VITE_BACKEND_URL;
      const res = await fetch(`${BASE_URL}/api/v1/auth/export-data`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Export service unavailable');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ExpenseMate-ledger-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Records exported successfully', { id: 'export' });
      return true;
    } catch (err) {
      toast.error(err.message, { id: 'export' });
      return false;
    }
  }, []);

  const generateReport = useCallback(async () => {
    toast.loading('Synthesizing intelligence report...', { id: 'report' });
    try {
      await apiClient.get('/api/v1/auth/report/monthly');
      toast.success('Report dispatched to your email', { id: 'report' });
      return true;
    } catch (err) {
      toast.error(err.message, { id: 'report' });
      return false;
    }
  }, []);

  const terminateAccount = useCallback(async () => {
    setLoading(true);
    try {
      await apiClient.delete('/api/v1/auth/delete-account');
      toast.success('Registry terminated');
      logout();
      return true;
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
      return false;
    }
  }, [logout]);

  return {
    loading,
    updateProfile,
    sendPasswordReset,
    exportData,
    generateReport,
    terminateAccount
  };
};
