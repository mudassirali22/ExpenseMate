import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

/**
 * Hook for managing task reminders, status toggling, and priority filtering.
 * Extracts business logic from the Reminders page component.
 */
export const useReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/v1/reminders/get');
      setReminders(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to sync reminders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const addReminder = async (payload) => {
    try {
      await apiClient.post('/api/v1/reminders/add', payload);
      toast.success("Reminder added!");
      fetchReminders();
      return true;
    } catch (err) {
      toast.error("Error adding reminder");
      return false;
    }
  };

  const updateReminder = async (id, payload) => {
    try {
      await apiClient.put(`/api/v1/reminders/update/${id}`, payload);
      fetchReminders();
      return true;
    } catch (err) {
      toast.error("Update failed");
      return false;
    }
  };

  const deleteReminder = async (id) => {
    try {
      await apiClient.delete(`/api/v1/reminders/delete/${id}`);
      toast.success("Deleted");
      fetchReminders();
      return true;
    } catch (err) {
      toast.error("Failed to remove");
      return false;
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    return updateReminder(id, { isCompleted: !currentStatus });
  };

  const fetchDueReminders = useCallback(async () => {
    try {
      return await apiClient.get('/api/v1/reminders/due');
    } catch {
      return [];
    }
  }, []);

  const markAsNotified = async (id) => {
    try {
      await apiClient.put(`/api/v1/reminders/notified/${id}`);
      return true;
    } catch {
      return false;
    }
  };

  const stats = useMemo(() => {
    const activeReminders = reminders.filter(r => !r.isCompleted);
    const completedReminders = reminders.filter(r => r.isCompleted);
    
    return {
      activeCount: activeReminders.length,
      completedCount: completedReminders.length,
      totalCount: reminders.length
    };
  }, [reminders]);

  return {
    reminders,
    loading,
    refresh: fetchReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleComplete,
    fetchDueReminders,
    markAsNotified,
    stats
  };
};
