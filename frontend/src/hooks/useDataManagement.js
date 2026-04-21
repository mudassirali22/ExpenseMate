import { useState, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Hook for managing bulk data operations including imports, exports, and templates.
 * Handles CSV parsing and binary file downloads.
 */
export const useDataManagement = () => {
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const importCSV = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      toast.error('Registry requires CSV payloads');
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

      const data = lines.slice(1).map(line => {
        const values = line.match(/(\".*?\"|[^\",]+)/g)?.map(v => v.replace(/"/g, '').trim()) || [];
        const row = {};
        headers.forEach((h, i) => { row[h] = values[i] || ''; });
        return row;
      }).filter(row => row.Title || row.title || row.Amount || row.amount);

      if (data.length === 0) {
        toast.error('No valid packets found in payload');
        return;
      }

      const result = await apiClient.post('/api/v1/data/import', { data });

      if (result.success) {
        setImportResult({ success: true, message: result.message, count: result.count });
        toast.success(`Synchronized ${result.count} records`);
      } else {
        throw new Error(result.message || 'Injection failed');
      }
    } catch (err) {
      toast.error(err.message);
      setImportResult({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  const exportData = useCallback(async (type, format) => {
    setLoading(true);
    try {
      if (format === 'pdf') {
        // apiClient returns raw Response object for non-JSON content-types.
        // Must call .text() to get the actual HTML string, not "[object Response]"
        const response = await apiClient.get('/api/v1/data/export/pdf');
        const htmlText = response instanceof Response
          ? await response.text()
          : typeof response === 'string'
            ? response
            : JSON.stringify(response);

        const blob = new Blob([htmlText], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const newWin = window.open(url, '_blank');
        if (newWin) {
          setTimeout(() => {
            newWin.print();
            URL.revokeObjectURL(url);
          }, 1200);
          toast.success('Report buffer opened');
        } else {
          toast.error('Pop-up blocked — allow pop-ups and try again');
          URL.revokeObjectURL(url);
        }
      } else {
        // CSV export — use BASE_URL directly; apiClient has no .defaults.baseURL (not axios)
        const endpoint = type === 'expenses' ? 'expenses'
          : type === 'income' ? 'income'
          : 'all';

        const res = await fetch(`${BASE_URL}/api/v1/data/export/${endpoint}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Server error ${res.status}`);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${endpoint}_registry_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Payload exported successfully');
      }
      return true;
    } catch (err) {
      console.error('Export error:', err);
      toast.error(err.message || 'Export failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadTemplate = useCallback(async (type) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/data/template/${type}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_schema_template.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Schema template downloaded');
    } catch (err) {
      toast.error(err.message || 'Failed to retrieve schema');
    }
  }, []);

  return {
    loading,
    importResult,
    setImportResult,
    importCSV,
    exportData,
    downloadTemplate,
  };
};
