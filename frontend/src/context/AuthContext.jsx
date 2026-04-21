import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_BACKEND_URL;

  const checkAuth = useCallback(async () => {
    try {
      const data = await apiClient.get('/api/v1/auth/me');
      setUser(data.user || data);
    } catch {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const data = await apiClient.post('/api/v1/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user || data);
    return data;
  };

  const register = async (formData) => {
    const data = await apiClient.postFormData('/api/v1/auth/register', formData);
    localStorage.setItem('token', data.token);
    setUser(data.user || data);
    return data;
  };

  const googleAuth = async (credential) => {
    const data = await apiClient.post('/api/v1/auth/google', { credential });
    localStorage.setItem('token', data.token);
    setUser(data.user || data);
    return data;
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/v1/auth/logout', {});
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const currencySymbol = useMemo(() => {
    const symbols = {
      PKR: 'Rs',
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      CAD: 'C$',
      AUD: 'A$',
      JPY: '¥',
      CNY: '¥',
      AED: 'د.إ',
      SAR: '﷼',
      SGD: 'S$',
      CHF: 'Fr',
      MYR: 'RM'
    };
    return symbols[user?.currency] || symbols.PKR;
  }, [user?.currency]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, googleAuth, logout, refreshUser, API, currencySymbol }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
