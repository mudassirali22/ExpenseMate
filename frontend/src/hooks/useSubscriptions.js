import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

/**
 * Hook for managing recurring subscriptions and analysis data.
 * Extracts business logic from the Subscriptions page component.
 */
export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/v1/subscription/get');
      if (data.success) {
        setSubscriptions(data.data);
      }
    } catch (err) {
      toast.error("Failed to sync subscriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const addSubscription = async (payload) => {
    try {
      const data = await apiClient.post('/api/v1/subscription/add', payload);
      if (data.success) {
        toast.success("Service added!");
        fetchSubscriptions();
        return true;
      }
      toast.error(data.message || "Failed to add service");
      return false;
    } catch (err) {
      toast.error("Error adding service");
      return false;
    }
  };

  const updateSubscription = async (id, payload) => {
    try {
      const data = await apiClient.put(`/api/v1/subscription/update/${id}`, payload);
      if (data.success) {
        toast.success("Service updated!");
        fetchSubscriptions();
        return true;
      }
      toast.error(data.message || "Update failed");
      return false;
    } catch (err) {
      toast.error("Error updating service");
      return false;
    }
  };

  const deleteSubscription = async (id) => {
    try {
      const data = await apiClient.delete(`/api/v1/subscription/delete/${id}`);
      if (data.success) {
        toast.success("Service removed");
        fetchSubscriptions();
        return true;
      }
      toast.error(data.message || "Delete failed");
      return false;
    } catch (err) {
      toast.error("Error removing service");
      return false;
    }
  };

  const stats = useMemo(() => {
    const monthlyBurn = subscriptions.reduce((acc, s) => {
      const amt = Number(s.amount) || 0;
      return acc + (s.billingCycle === 'Yearly' ? amt / 12 : amt);
    }, 0);

    const yearlyBurn = monthlyBurn * 12;

    const categoryData = (() => {
      const counts = {};
      subscriptions.forEach(s => {
        const amt = s.billingCycle === 'Yearly' ? s.amount / 12 : s.amount;
        counts[s.category] = (counts[s.category] || 0) + (Number(amt) || 0);
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    })();

    const upcomingRenewals = [...subscriptions]
      .sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate))
      .slice(0, 3);

    return {
      monthlyBurn,
      yearlyBurn,
      categoryData,
      upcomingRenewals,
      count: subscriptions.length
    };
  }, [subscriptions]);

  return {
    subscriptions,
    loading,
    refresh: fetchSubscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    stats
  };
};
