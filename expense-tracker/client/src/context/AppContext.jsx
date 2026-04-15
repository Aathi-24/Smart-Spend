import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { transactionAPI, loanAPI, sheetsAPI } from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loanAlerts, setLoanAlerts] = useState({ upcomingLoans: [], overdueLoans: [], hasAlerts: false });
  const [sheetsConnected, setSheetsConnected] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingTx, setLoadingTx] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchTransactions();
      fetchLoanAlerts();
      checkSheetsConnection();
    }
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setLoadingStats(true);
    try {
      const { data } = await transactionAPI.getStats();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error('Stats error:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [user]);

  const fetchTransactions = useCallback(async (params = {}) => {
    if (!user) return;
    setLoadingTx(true);
    try {
      const { data } = await transactionAPI.getAll({ limit: 100, ...params });
      if (data.success) setTransactions(data.transactions);
    } catch (err) {
      console.error('Transactions error:', err);
    } finally {
      setLoadingTx(false);
    }
  }, [user]);

  const fetchLoanAlerts = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await loanAPI.getUpcoming();
      if (data.success) setLoanAlerts(data);
    } catch (err) {
      // Non-blocking
    }
  }, [user]);

  const checkSheetsConnection = useCallback(async () => {
    try {
      const { data } = await sheetsAPI.getStatus();
      setSheetsConnected(data.connected);
    } catch {
      setSheetsConnected(false);
    }
  }, []);

  const addTransaction = useCallback(async (txData) => {
    try {
      const { data } = await transactionAPI.create(txData);
      if (data.success) {
        setTransactions((prev) => [data.transaction, ...prev]);
        if (data.sheetSynced) {
          toast.success('Transaction saved & synced to Google Sheets! 📊');
        } else {
          toast.success('Transaction saved successfully! ✅');
        }
        fetchStats();
        fetchLoanAlerts();
        return { success: true, transaction: data.transaction };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save transaction';
      toast.error(msg);
      return { success: false };
    }
  }, [fetchStats, fetchLoanAlerts]);

  const deleteTransaction = useCallback(async (id) => {
    try {
      await transactionAPI.delete(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      fetchStats();
      toast.success('Transaction deleted');
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  }, [fetchStats]);

  const markLoanPaid = useCallback(async (id) => {
    try {
      const { data } = await loanAPI.markPaid(id);
      if (data.success) {
        setTransactions((prev) =>
          prev.map((t) => (t._id === id ? { ...t, loanStatus: 'Paid' } : t))
        );
        fetchStats();
        fetchLoanAlerts();
        toast.success('Loan marked as paid! 🎉');
      }
    } catch (err) {
      toast.error('Failed to update loan status');
    }
  }, [fetchStats, fetchLoanAlerts]);

  const sendReminder = useCallback(async (id) => {
    try {
      const { data } = await loanAPI.sendReminder(id);
      if (data.success) toast.success('Reminder email sent! ✉️');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reminder');
    }
  }, []);

  return (
    <AppContext.Provider value={{
      transactions, stats, loanAlerts, sheetsConnected,
      loadingStats, loadingTx, sidebarOpen, setSidebarOpen,
      fetchStats, fetchTransactions, fetchLoanAlerts,
      addTransaction, deleteTransaction, markLoanPaid, sendReminder,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
