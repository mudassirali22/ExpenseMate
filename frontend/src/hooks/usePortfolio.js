import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

/**
 * Hook for managing investment portfolio assets, valuation, and risk metrics.
 * Extracts business logic from the Portfolio page component.
 */
export const usePortfolio = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/v1/portfolio/get');
      if (data.success) {
        setAssets(data.data);
      }
    } catch (err) {
      toast.error("Failed to sync investment records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const addAsset = async (payload) => {
    try {
      const data = await apiClient.post('/api/v1/portfolio/add', payload);
      if (data.success) {
        toast.success("Investment added!");
        fetchAssets();
        return true;
      }
      toast.error(data.message || "Action failed");
      return false;
    } catch (err) {
      toast.error("System connection error");
      return false;
    }
  };

  const updateAsset = async (id, payload) => {
    try {
      const data = await apiClient.put(`/api/v1/portfolio/update/${id}`, payload);
      if (data.success) {
        toast.success("Investment updated!");
        fetchAssets();
        return true;
      }
      toast.error(data.message || "Action failed");
      return false;
    } catch (err) {
      toast.error("System connection error");
      return false;
    }
  };

  const deleteAsset = async (id) => {
    try {
      const data = await apiClient.delete(`/api/v1/portfolio/delete/${id}`);
      if (data.success) {
        toast.success("Investment deleted");
        fetchAssets();
        return true;
      }
      toast.error(data.message || "Action failed");
      return false;
    } catch (err) {
      toast.error("System connection error");
      return false;
    }
  };

  const stats = useMemo(() => {
    const totalInvested = assets.reduce((acc, a) => acc + (a.buyPrice * a.amount), 0);
    const totalValue = assets.reduce((acc, a) => acc + (a.currentValue || a.buyPrice * a.amount), 0);
    const totalProfit = totalValue - totalInvested;
    const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    const categorizedData = (() => {
      const data = {};
      assets.forEach(asset => {
        data[asset.assetType] = (data[asset.assetType] || 0) + (asset.currentValue || asset.buyPrice * asset.amount);
      });
      return Object.entries(data).map(([name, value]) => ({ name, value }));
    })();

    const riskScore = assets.length === 0 ? 0 : Math.min((new Set(assets.map(a => a.assetType)).size / 6) * 100, 100);

    return {
      totalInvested,
      totalValue,
      totalProfit,
      profitPercentage,
      categorizedData,
      riskScore,
      count: assets.length
    };
  }, [assets]);

  return {
    assets,
    loading,
    refresh: fetchAssets,
    addAsset,
    updateAsset,
    deleteAsset,
    stats
  };
};
