import { useState, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { toast } from 'react-hot-toast';

/**
 * Hook for managing user profile identity and avatar updates.
 * Handles multipart/form-data for image uploads and JSON for profile details.
 */
export const useProfile = (refreshUser) => {
  const [saving, setSaving] = useState(false);

  const updateProfile = useCallback(async (payload, isImage = false) => {
    setSaving(true);
    try {
      let body = payload;
      let headers = {};

      if (!(payload instanceof FormData)) {
        body = JSON.stringify(payload);
        headers = { 'Content-Type': 'application/json' };
      }

      await apiClient.put('/api/v1/auth/profile', body, { headers });
      
      toast.success(isImage ? 'Avatar synchronized' : 'Identity updated');
      refreshUser();
      return true;
    } catch (err) {
      toast.error(err.message || 'Update failed');
      return false;
    } finally {
      setSaving(false);
    }
  }, [refreshUser]);

  const uploadAvatar = useCallback(async (file, fullName) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('fullName', fullName);
    return updateProfile(formData, true);
  }, [updateProfile]);

  return {
    saving,
    updateProfile,
    uploadAvatar
  };
};
