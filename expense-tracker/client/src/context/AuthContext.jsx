import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [defaultUsers, setDefaultUsers] = useState([]);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
    loadDefaultUsers();
  }, []);

  const loadDefaultUsers = async () => {
    try {
      const { data } = await authAPI.getUsers();
      if (data.success) setDefaultUsers(data.users);
    } catch (err) {
      // Use hardcoded fallback if server unreachable
      setDefaultUsers([
        { name: 'Admin User', email: 'admin@expensetracker.com', role: 'admin' },
        { name: 'John Doe', email: 'john@expensetracker.com', role: 'user' },
        { name: 'Jane Smith', email: 'jane@expensetracker.com', role: 'user' },
      ]);
    }
  };

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password });
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}! 👋`);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, defaultUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
