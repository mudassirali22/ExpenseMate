import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

/**
 * Hook for managing shared group wallets and financial collaboration.
 * Extracts business logic from the SharedWallets page component.
 */
export const useSharedWallets = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/v1/shared-wallet/get');
      if (data.success) {
        setWallets(data.data);
      }
    } catch (err) {
      toast.error("Failed to sync shared wallets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const addWallet = async (payload) => {
    try {
      const data = await apiClient.post('/api/v1/shared-wallet/add', payload);
      if (data.success) {
        toast.success("New wallet created");
        fetchWallets();
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Creation failed");
      return false;
    }
  };

  const updateWallet = async (id, payload) => {
    try {
      const data = await apiClient.put(`/api/v1/shared-wallet/update/${id}`, payload);
      if (data.success) {
        toast.success("Wallet settings updated");
        fetchWallets();
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Update failed");
      return false;
    }
  };

  const deleteWallet = async (id) => {
    try {
      await apiClient.delete(`/api/v1/shared-wallet/delete/${id}`);
      toast.success("Wallet and registry cleared");
      fetchWallets();
      return true;
    } catch (err) {
      toast.error("Process failed");
      return false;
    }
  };

  const addExpense = async (walletId, expenseData) => {
    try {
      const data = await apiClient.post('/api/v1/shared-wallet/add-expense', {
        ...expenseData,
        walletId
      });
      if (data.success) {
        toast.success("Expense logged to wallet");
        fetchWallets();
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Logging failed");
      return false;
    }
  };

  const addMember = async (walletId, email) => {
    try {
      const data = await apiClient.post('/api/v1/shared-wallet/add-member', {
        walletId,
        email
      });
      if (data.success) {
        toast.success(data.message);
        fetchWallets();
        return true;
      }
      toast.error(data.message);
      return false;
    } catch (err) {
      toast.error("Handshake failed");
      return false;
    }
  };

  const handleRequestAction = async (walletId, requestId, action) => {
    try {
      const data = await apiClient.post('/api/v1/shared-wallet/handle-request', {
        walletId,
        requestId,
        action
      });
      if (data.success) {
        toast.success(data.message);
        fetchWallets();
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Process failed");
      return false;
    }
  };

  const getStatements = async (walletId) => {
    try {
      const data = await apiClient.get(`/api/v1/shared-wallet/statements/${walletId}`);
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (err) {
      toast.error("Settlement data unreachable");
      return null;
    }
  };

  const stats = useMemo(() => {
    const totalPoolValue = wallets.reduce((acc, w) => acc + (w.targetBudget || 0), 0);
    const totalCollected = wallets.reduce((acc, w) => acc + (w.totalBalance || 0), 0);
    
    // Unique collaborators across all wallets
    const memberEmails = new Set();
    wallets.forEach(w => {
      w.members.forEach(m => {
        const email = m.email || m.user?.email;
        if (email) memberEmails.add(email);
      });
    });

    return {
      totalPoolValue,
      totalCollected,
      totalCollaborators: memberEmails.size,
      count: wallets.length
    };
  }, [wallets]);

  return {
    wallets,
    loading,
    refresh: fetchWallets,
    addWallet,
    updateWallet,
    deleteWallet,
    addExpense,
    addMember,
    handleRequestAction,
    getStatements,
    stats
  };
};
