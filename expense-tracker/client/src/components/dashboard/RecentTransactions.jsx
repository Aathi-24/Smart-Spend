import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, getCategoryIcon, getTypeColor } from '../../utils/formatters';
import GlassCard from '../common/GlassCard';

const TransactionRow = ({ tx, index, onDelete }) => {
  const color = getTypeColor(tx.type);
  const icon = getCategoryIcon(tx.category);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 py-3 px-1 border-b border-indigo-50 last:border-0 group hover:bg-indigo-50/30 rounded-xl transition-colors px-2"
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: color.bg }}>
        {icon}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-indigo-900 truncate">{tx.reason}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-indigo-400">{formatDate(tx.date)}</span>
          <span
            className="chip text-[10px]"
            style={{ background: color.bg, color: color.text }}
          >
            {tx.type}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className="text-sm font-bold" style={{ color: color.text }}>
          {tx.type === 'Normal' ? '-' : tx.type === 'Loan Given' ? '+' : '-'}
          {formatCurrency(tx.amount)}
        </p>
        <button
          onClick={() => onDelete(tx._id)}
          className="p-1.5 rounded-lg text-indigo-200 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
};

const RecentTransactions = () => {
  const { transactions, loadingTx, deleteTransaction } = useApp();
  const recent = transactions.slice(0, 8);

  return (
    <GlassCard delay={0.4}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-indigo-900">Recent Transactions</h3>
          <p className="text-xs text-indigo-400">Latest activity</p>
        </div>
        <Link
          to="/transactions"
          className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
        >
          View all <ArrowRight size={12} />
        </Link>
      </div>

      {loadingTx ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-32 rounded" />
                <div className="skeleton h-2 w-20 rounded" />
              </div>
              <div className="skeleton h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      ) : recent.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-sm text-indigo-300 font-medium">No transactions yet</p>
          <p className="text-xs text-indigo-200 mt-1">Add your first transaction to get started</p>
        </div>
      ) : (
        <div>
          {recent.map((tx, i) => (
            <TransactionRow key={tx._id} tx={tx} index={i} onDelete={deleteTransaction} />
          ))}
        </div>
      )}
    </GlassCard>
  );
};

export default RecentTransactions;
