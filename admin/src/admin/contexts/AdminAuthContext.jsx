import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/adminApi';

const AdminAuthContext = createContext(null);

const TOKEN_KEY   = 'auth_token';
const ADMIN_KEY   = 'admin_user';
const SHARED_KEY  = 'auth_user';        // Written by centralised login
const CENTRAL_LOGIN = 'http://localhost:5173/login';

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    // Bootstrap from URL params when redirected cross-origin from login portal
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('_ap_token');
    const urlUser  = params.get('_ap_user');
    if (urlToken && urlUser) {
      localStorage.setItem(TOKEN_KEY,  urlToken);
      localStorage.setItem(SHARED_KEY, urlUser);
      localStorage.setItem(ADMIN_KEY,  urlUser);
      window.history.replaceState({}, '', window.location.pathname);
    }

    const token = localStorage.getItem(TOKEN_KEY);
    // Prefer admin_user, fall back to shared auth_user
    const stored = localStorage.getItem(ADMIN_KEY) || localStorage.getItem(SHARED_KEY);

    if (token && stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.role === 'admin' || parsed.role === 'administrator') {
          setUser(parsed);
        } else {
          // Token exists but role is not admin — clear and force re-login
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(ADMIN_KEY);
          localStorage.removeItem(SHARED_KEY);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ADMIN_KEY);
        localStorage.removeItem(SHARED_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await adminApi.login(email, password);
    if (!data || !data.token) throw new Error('Invalid response from server.');
    if (data.user.role !== 'admin' && data.user.role !== 'administrator') {
      throw new Error('Access denied. This portal is for administrators only.');
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(data.user));
    localStorage.setItem(SHARED_KEY, JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    localStorage.removeItem(SHARED_KEY);
    setUser(null);
    // Redirect to centralised login (not admin's own /login)
    window.location.href = CENTRAL_LOGIN;
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
