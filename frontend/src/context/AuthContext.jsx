import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

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
      const res = await fetch(`${API}/api/v1/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Not authenticated');
      const data = await res.json();
      setUser(data.user || data);
    } catch {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const res = await fetch(`${API}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('token', data.token);
    setUser(data.user || data);
    return data;
  };

  const register = async (formData) => {
    const res = await fetch(`${API}/api/v1/auth/register`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    localStorage.setItem('token', data.token);
    setUser(data.user || data);
    return data;
  };

  const googleAuth = async (credential) => {
    const res = await fetch(`${API}/api/v1/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Google Auth failed');
    localStorage.setItem('token', data.token);
    setUser(data.user || data);
    return data;
  };

  const logout = async () => {
    try {
      await fetch(`${API}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
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
