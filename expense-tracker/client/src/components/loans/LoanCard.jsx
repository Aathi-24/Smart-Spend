import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Send, Clock, AlertTriangle, User, Mail, Calendar, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, getDaysUntilDue, formatDueDate } from '../../utils/formatters';

const LoanCard = ({ loan, index }) => {
  const { markLoanPaid, sendReminder } = useApp();
  const dueMeta = formatDueDate(loan.dueDate);
  const days = getDaysUntilDue(loan.dueDate);

  const isGiven = loan.type === 'Loan Given';
  const isPaid = loan.loanStatus === 'Paid';

  const cardConfig = {
    'Loan Given': {
      bg: 'from-amber-50 to-orange-50',
      border: 'border-amber-200',
      accent: '#f59e0b',
      icon: '🤝',
      label: 'You gave',
      glow: 'hover:shadow-[0_8px_30px_rgba(245,158,11,0.2)]',
    },
    'Loan Borrowed': {
      bg: 'from-red-50 to-rose-50',
      border: 'border-red-200',
      accent: '#f43f5e',
      icon: '💸',
      label: 'You borrowed',
      glow: 'hover:shadow-[0_8px_30px_rgba(244,63,94,0.2)]',
    },
  };

  const cfg = cardConfig[loan.type] || cardConfig['Loan Given'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
      className={`relative glass bg-gradient-to-br ${cfg.bg} rounded-2xl border ${cfg.border} p-5 transition-all ${cfg.glow} ${isPaid ? 'opacity-70' : ''}`}
    >
      {/* Paid overlay */}
      {isPaid && (
        <div className="absolute top-3 right-3">
          <span className="chip chip-paid text-[10px]">✅ Paid</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${cfg.accent}18` }}
        >
          {cfg.icon}
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: cfg.accent }}>
            {cfg.label}
          </p>
          <p className="text-xl font-display font-bold text-indigo-900">{formatCurrency(loan.amount)}</p>
          <p className="text-sm text-indigo-500 mt-0.5 line-clamp-1">{loan.reason}</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-indigo-500">
          <Calendar size={12} className="text-indigo-300 flex-shrink-0" />
          <span>Issued: {formatDate(loan.date)}</span>
        </div>

        {loan.dueDate && (
          <div className="flex items-center gap-2 text-xs">
            <Clock size={12} className={`flex-shrink-0 ${dueMeta?.urgent ? 'text-red-400' : 'text-indigo-300'}`} />
            <span className={`font-semibold ${dueMeta?.urgent ? 'text-red-500' : 'text-indigo-500'}`}>
              {dueMeta?.text} ({formatDate(loan.dueDate)})
            </span>
            {dueMeta?.urgent && <AlertTriangle size={11} className="text-red-400" />}
          </div>
        )}

        {loan.loanGetterName && (
          <div className="flex items-center gap-2 text-xs text-indigo-500">
            <User size={12} className="text-indigo-300 flex-shrink-0" />
            <span>{loan.loanGetterName}</span>
          </div>
        )}

        {loan.loanGetterEmail && (
          <div className="flex items-center gap-2 text-xs text-indigo-500">
            <Mail size={12} className="text-indigo-300 flex-shrink-0" />
            <span className="truncate">{loan.loanGetterEmail}</span>
          </div>
        )}
      </div>

      {/* Status chip */}
      {loan.loanStatus && !isPaid && (
        <div className="mb-3">
          <span className={`chip text-xs ${
            loan.loanStatus === 'Overdue' ? 'chip-overdue alert-pulse' :
            loan.loanStatus === 'Pending' ? 'chip-pending' : 'chip-paid'
          }`}>
            {loan.loanStatus === 'Overdue' ? '⚠️' : loan.loanStatus === 'Pending' ? '⏳' : '✅'} {loan.loanStatus}
          </span>
        </div>
      )}

      {/* Actions */}
      {!isPaid && (
        <div className="flex gap-2">
          <button
            onClick={() => markLoanPaid(loan._id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-xs font-semibold transition-all hover:scale-[1.02]"
          >
            <CheckCircle size={13} /> Mark Paid
          </button>
          {isGiven && loan.loanGetterEmail && (
            <button
              onClick={() => sendReminder(loan._id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <Send size={13} /> Send Reminder
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default LoanCard;
