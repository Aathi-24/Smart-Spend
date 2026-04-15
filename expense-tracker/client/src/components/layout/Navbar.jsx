import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Plus, RefreshCw, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

const Navbar = ({ title, onAddTransaction }) => {
  const { loanAlerts, sidebarOpen, setSidebarOpen, sheetsConnected } = useApp();
  const { user } = useAuth();
  const [alertsOpen, setAlertsOpen] = useState(false);

  const alerts = [
    ...(loanAlerts?.overdueLoans || []).map((l) => ({
      ...l, urgency: 'overdue', label: `OVERDUE: ${l.type === 'Loan Given' ? 'Awaiting repayment' : 'You need to repay'}`,
    })),
    ...(loanAlerts?.upcomingLoans || []).map((l) => ({
      ...l, urgency: 'upcoming', label: `DUE SOON: ${l.type === 'Loan Given' ? 'Awaiting repayment' : 'You need to repay'}`,
    })),
  ];

  const hasAlerts = alerts.length > 0;

  return (
    <header className="h-16 bg-white/70 backdrop-blur-2xl border-b border-indigo-100 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden p-2 rounded-xl hover:bg-indigo-50 text-indigo-600 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Title */}
      <h2 className="text-lg font-display font-bold text-indigo-900 flex-1">{title}</h2>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Sheets status dot */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            sheetsConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${sheetsConnected ? 'bg-emerald-500' : 'bg-amber-400'} animate-pulse`} />
          {sheetsConnected ? 'Synced' : 'Offline'}
        </div>

        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => setAlertsOpen(!alertsOpen)}
            className="relative p-2 rounded-xl hover:bg-indigo-50 text-indigo-500 transition-colors"
          >
            <Bell size={20} />
            {hasAlerts && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center alert-pulse">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Alerts dropdown */}
          <AnimatePresence>
            {alertsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setAlertsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-12 w-80 glass rounded-2xl border border-white/60 shadow-glass z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-indigo-100 flex items-center justify-between">
                    <h3 className="font-display font-bold text-indigo-900 text-sm">Loan Alerts</h3>
                    <button onClick={() => setAlertsOpen(false)}>
                      <X size={14} className="text-indigo-400" />
                    </button>
                  </div>
                  {alerts.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-3xl mb-2">🎉</p>
                      <p className="text-sm text-indigo-400 font-medium">No pending alerts</p>
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      {alerts.map((a, i) => (
                        <div
                          key={i}
                          className={`p-4 border-b border-indigo-50 last:border-0 ${
                            a.urgency === 'overdue' ? 'bg-red-50/50' : 'bg-amber-50/40'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl">{a.urgency === 'overdue' ? '⚠️' : '⏰'}</span>
                            <div className="flex-1">
                              <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${
                                a.urgency === 'overdue' ? 'text-red-600' : 'text-amber-600'
                              }`}>{a.label}</p>
                              <p className="text-sm font-semibold text-indigo-900">
                                ₹{a.amount?.toLocaleString('en-IN')}
                              </p>
                              <p className="text-xs text-indigo-400">{a.reason}</p>
                              <p className="text-xs text-indigo-400 mt-0.5">Due: {formatDate(a.dueDate)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Add transaction */}
        {onAddTransaction && (
          <motion.button
            onClick={onAddTransaction}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add</span>
          </motion.button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
