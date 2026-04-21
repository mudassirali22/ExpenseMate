import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../utils/apiClient';

/**
 * Hook for managing calendar-based financial activity visualization.
 * Aggregates expenses, incomes, and reminders into a centralized temporal registry.
 */
export const useCalendar = (currentDate) => {
  const [activities, setActivities] = useState({ expenses: [], incomes: [], reminders: [] });
  const [loading, setLoading] = useState(true);

  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const [actData, remData] = await Promise.all([
        apiClient.get('/api/v1/dashboard/activities?limit=1000'),
        apiClient.get('/api/v1/reminders/get')
      ]);

      const acts = Array.isArray(actData.activities) ? actData.activities : [];
      setActivities({
        incomes: acts.filter(a => a.type === 'income'),
        expenses: acts.filter(a => a.type === 'expense' || a.type === 'tax' || a.type === 'portfolio' || a.type === 'subscription' || a.type === 'shared'),
        reminders: Array.isArray(remData) ? remData : []
      });
    } catch (err) {
      console.error("Failed to sync calendar registry");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarsRegistry = useMemo(() => {
    const map = {};
    const addToMap = (dateStr, item, type) => {
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const key = d.getDate();
        if (!map[key]) map[key] = { expenses: [], incomes: [], reminders: [] };
        map[key][type].push(item);
      }
    };

    activities.expenses.forEach(exp => addToMap(exp.date, exp, 'expenses'));
    activities.incomes.forEach(inc => addToMap(inc.date, inc, 'incomes'));
    activities.reminders.forEach(rem => addToMap(rem.dueDate, rem, 'reminders'));

    return map;
  }, [activities, month, year]);

  const monthlyStats = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    let pending = 0;

    Object.values(calendarsRegistry).forEach(day => {
      inflow += day.incomes.reduce((s, i) => s + i.amount, 0);
      outflow += day.expenses.reduce((s, e) => s + e.amount, 0);
      pending += day.reminders.filter(r => !r.isCompleted).length;
    });

    return { inflow, outflow, pending, net: inflow - outflow };
  }, [calendarsRegistry]);

  return {
    loading,
    registry: calendarsRegistry,
    stats: monthlyStats,
    refresh: fetchCalendarData
  };
};
