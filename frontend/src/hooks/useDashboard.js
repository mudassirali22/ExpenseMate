import { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';

/**
 * Hook for managing dashboard data and activities.
 * Extracts fetch logic from the Home page component.
 */
export const useDashboard = () => {
  const [stats, setStats] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, expData, goalData, actData] = await Promise.all([
        apiClient.get('/api/v1/dashboard/stats'),
        apiClient.get('/api/v1/expenses/get'),
        apiClient.get('/api/v1/goals/get'),
        apiClient.get('/api/v1/dashboard/activities?limit=100'),
      ]);

      setStats(statsData);
      setExpenses(Array.isArray(expData) ? expData : []);
      setGoals(Array.isArray(goalData) ? goalData : []);
      setActivities(Array.isArray(actData?.activities) ? actData.activities : (statsData.recentActivity || []));
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return { 
    stats, 
    expenses, 
    goals, 
    activities, 
    loading, 
    error,
    refresh: fetchDashboardData 
  };
};
