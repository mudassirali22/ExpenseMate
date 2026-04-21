import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

/**
 * Hook for managing savings goals and aggregate statistics.
 * Extracts business logic from the SavingsGoals page component.
 */
export const useSavingsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/v1/goals/get');
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to sync goals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (payload) => {
    try {
      await apiClient.post('/api/v1/goals/add', payload);
      toast.success('Goal initialized!');
      fetchGoals();
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to save');
      return false;
    }
  };

  const updateGoal = async (id, payload) => {
    try {
      await apiClient.put(`/api/v1/goals/${id}`, payload);
      toast.success('Goal updated!');
      fetchGoals();
      return true;
    } catch (err) {
      toast.error(err.message || 'Update failed');
      return false;
    }
  };

  const deleteGoal = async (id) => {
    try {
      await apiClient.delete(`/api/v1/goals/${id}`);
      toast.success('Goal removed');
      fetchGoals();
      return true;
    } catch (err) {
      toast.error('Deletion failed');
      return false;
    }
  };

  const depositFunds = async (goal, amount) => {
    try {
      await apiClient.put(`/api/v1/goals/${goal._id}`, {
        currentAmount: Number(goal.currentAmount) + Number(amount)
      });
      toast.success("Capital deposited!");
      fetchGoals();
      return true;
    } catch (err) {
      toast.error("Transmission failed");
      return false;
    }
  };

  const stats = useMemo(() => {
    const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
    const aggregateProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
    
    return {
      totalTarget,
      totalSaved,
      aggregateProgress,
      count: goals.length
    };
  }, [goals]);

  return {
    goals,
    loading,
    refresh: fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    depositFunds,
    stats
  };
};
