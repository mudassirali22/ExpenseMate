import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

/**
 * Hook for managing personal notes, pinning, and categorization.
 * Extracts business logic from the Notes page component.
 */
export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/v1/notes/get');
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to sync notebook");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async (payload) => {
    try {
      await apiClient.post('/api/v1/notes/add', payload);
      toast.success("Note saved!");
      fetchNotes();
      return true;
    } catch (err) {
      toast.error("Error saving note");
      return false;
    }
  };

  const updateNote = async (id, payload) => {
    try {
      await apiClient.put(`/api/v1/notes/update/${id}`, payload);
      fetchNotes();
      return true;
    } catch (err) {
      toast.error("Update failed");
      return false;
    }
  };

  const deleteNote = async (id) => {
    try {
      await apiClient.delete(`/api/v1/notes/delete/${id}`);
      toast.success("Deleted");
      fetchNotes();
      return true;
    } catch (err) {
      toast.error("Delete failed");
      return false;
    }
  };

  const togglePin = async (id, currentPin) => {
    return updateNote(id, { isPinned: !currentPin });
  };

  const stats = useMemo(() => {
    return {
      totalCount: notes.length,
      pinnedCount: notes.filter(n => n.isPinned).length,
      categories: Array.from(new Set(notes.map(n => n.category)))
    };
  }, [notes]);

  return {
    notes,
    loading,
    refresh: fetchNotes,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
    stats
  };
};
