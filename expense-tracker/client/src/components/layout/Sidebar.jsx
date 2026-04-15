import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ArrowLeftRight, Wallet, Settings,
  LogOut, X, TrendingUp, Bell, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', variant: 'fadeUp' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions', variant: 'slideLeft' },
  { to: '/loans', icon: Wallet, label: 'Loans', variant: 'slideRight' },
  { to: '/settings', icon: Settings, label: 'Settings', variant: 'scale' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { loanAlerts, sidebarOpen, setSidebarOpen, sheetsConnected } = useApp();
  const location = useLocation();

  const hasAlerts = loanAlerts?.hasAlerts;
  const alertCount = (loanAlerts?.upcomingLoans?.length || 0) + (loanAlerts?.overdueLoans?.length || 0);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shadow-glow flex-shrink-0">
            <img src="/logo.png" alt="Smart Spend" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-indigo-900 leading-tight">Smart Spend</h1>
            <p className="text-xs text-indigo-400">Pro</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }, i) => {
          const isActive = location.pathname === to;
          const showBadge = label === 'Loans' && hasAlerts;
          return (
            <motion.div
              key={to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <NavLink
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 relative group
                  ${isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-glow'
                    : 'text-indigo-700/70 hover:bg-indigo-50 hover:text-indigo-800'
                  }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-indigo-400 group-hover:text-indigo-600'} />
                <span className="flex-1">{label}</span>
                {showBadge && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center alert-pulse">
                    {alertCount}
                  </span>
                )}
                {isActive && <ChevronRight size={14} className="text-white/70" />}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* Sheets status */}
      <div className="mx-4 mb-3">
        <div className={`px-4 py-3 rounded-2xl flex items-center gap-2 ${sheetsConnected ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className={`w-2 h-2 rounded-full ${sheetsConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          <span className={`text-xs font-semibold ${sheetsConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
            {sheetsConnected ? 'Sheets Synced' : 'Sheets Offline'}
          </span>
          <TrendingUp size={12} className={sheetsConnected ? 'text-emerald-500 ml-auto' : 'text-amber-400 ml-auto'} />
        </div>
      </div>

      {/* User profile */}
      <div className="px-4 pb-8">
        <div className="glass-dark rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-indigo-900 truncate">{user?.name}</p>
            <p className="text-xs text-indigo-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-xl text-indigo-300 hover:text-red-500 hover:bg-red-50 transition-all"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-white/80 backdrop-blur-2xl border-r border-indigo-100 fixed left-0 top-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-indigo-950/20 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-2xl border-r border-indigo-100 z-50 lg:hidden"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-indigo-50 text-indigo-400"
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
