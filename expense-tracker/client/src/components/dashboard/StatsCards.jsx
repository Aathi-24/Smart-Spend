import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

const StatCard = ({ title, amount, subtitle, icon, gradient, delay, trend, trendValue }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="relative overflow-hidden glass rounded-2xl p-6 cursor-default"
    style={{ willChange: 'transform' }}
  >
    {/* Background gradient */}
    <div
      className="absolute inset-0 opacity-10 rounded-2xl"
      style={{ background: gradient }}
    />

    {/* Glow dot */}
    <div
      className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
      style={{ background: gradient }}
    >
      {icon}
    </div>

    <div className="relative">
      <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">{title}</p>
      <motion.p
        className="text-2xl font-display font-bold text-indigo-900 stat-number"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
      >
        {formatCurrency(amount)}
      </motion.p>
      {subtitle && <p className="text-xs text-indigo-400 mt-1">{subtitle}</p>}

      {/* Trend indicator */}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
          trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-indigo-400'
        }`}>
          {trend === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {trendValue}
        </div>
      )}
    </div>

    {/* Decorative corner */}
    <div
      className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10"
      style={{ background: gradient }}
    />
  </motion.div>
);

const StatsCards = () => {
  const { stats, loadingStats } = useApp();

  const cards = [
    {
      title: 'Total Spent',
      amount: stats?.totalSpent || 0,
      subtitle: `₹${(stats?.monthlySpent || 0).toLocaleString('en-IN')} this month`,
      icon: '💳',
      gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      trend: 'up',
      trendValue: 'This Month',
    },
    {
      title: 'Loans Given',
      amount: stats?.totalLoanGiven || 0,
      subtitle: `${stats?.pendingLoansCount || 0} pending repayment`,
      icon: '🤝',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      trend: stats?.pendingLoansCount > 0 ? 'up' : null,
      trendValue: `${stats?.pendingLoansCount} active`,
    },
    {
      title: 'Loans Borrowed',
      amount: stats?.totalLoanBorrowed || 0,
      subtitle: 'Total borrowed amount',
      icon: '💸',
      gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)',
    },
    {
      title: 'Pending Recovery',
      amount: stats?.pendingLoansAmount || 0,
      subtitle: 'Awaiting repayment',
      icon: '⏳',
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      trend: stats?.overdueLoans?.length > 0 ? 'down' : null,
      trendValue: `${stats?.overdueLoans?.length || 0} overdue`,
    },
  ];

  if (loadingStats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-6 h-32">
            <div className="skeleton h-3 w-20 rounded mb-3" />
            <div className="skeleton h-7 w-28 rounded mb-2" />
            <div className="skeleton h-2 w-16 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <StatCard key={card.title} {...card} delay={i * 0.07} />
      ))}
    </div>
  );
};

export default StatsCards;
