import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, Send, CheckCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, getDaysUntilDue } from '../../utils/formatters';
import GlassCard from '../common/GlassCard';

const AlertItem = ({ loan, onMarkPaid, onSendReminder }) => {
  const days = getDaysUntilDue(loan.dueDate);
  const isOverdue = days < 0;
  const isToday = days === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-4 rounded-2xl border ${
        isOverdue
          ? 'bg-red-50 border-red-200'
          : isToday
          ? 'bg-amber-50 border-amber-200'
          : 'bg-amber-50/60 border-amber-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isOverdue ? 'bg-red-100' : 'bg-amber-100'
        }`}>
          {isOverdue ? (
            <AlertTriangle size={16} className="text-red-600" />
          ) : (
            <Clock size={16} className="text-amber-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold uppercase tracking-wide ${
              isOverdue ? 'text-red-600' : 'text-amber-700'
            }`}>
              {isOverdue ? `${Math.abs(days)}d overdue` : isToday ? 'Due today!' : `Due in ${days}d`}
            </span>
            <span className="text-xs text-indigo-400">{loan.type}</span>
          </div>
          <p className="text-sm font-bold text-indigo-900 mt-0.5">{formatCurrency(loan.amount)}</p>
          <p className="text-xs text-indigo-500 truncate">{loan.reason}</p>
          <p className="text-xs text-indigo-400 mt-0.5">Due: {formatDate(loan.dueDate)}</p>
          {loan.loanGetterName && (
            <p className="text-xs text-indigo-400">Person: {loan.loanGetterName}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button
            onClick={() => onMarkPaid(loan._id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-xs font-semibold transition-colors"
          >
            <CheckCircle size={12} /> Paid
          </button>
          {loan.type === 'Loan Given' && loan.loanGetterEmail && (
            <button
              onClick={() => onSendReminder(loan._id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-xs font-semibold transition-colors"
            >
              <Send size={12} /> Remind
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const LoanAlerts = () => {
  const { loanAlerts, markLoanPaid, sendReminder } = useApp();
  const alerts = [
    ...(loanAlerts?.overdueLoans || []),
    ...(loanAlerts?.upcomingLoans || []),
  ];

  if (alerts.length === 0) {
    return (
      <GlassCard delay={0.5} className="border border-emerald-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle size={18} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="font-display font-bold text-indigo-900">Loan Alerts</h3>
            <p className="text-xs text-emerald-500">All clear! No pending alerts.</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard delay={0.5} className="border border-red-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center alert-pulse">
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-display font-bold text-indigo-900">Loan Alerts</h3>
            <p className="text-xs text-red-500">{alerts.length} item{alerts.length > 1 ? 's' : ''} need attention</p>
          </div>
        </div>
        <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {alerts.map((loan) => (
            <AlertItem
              key={loan._id}
              loan={loan}
              onMarkPaid={markLoanPaid}
              onSendReminder={sendReminder}
            />
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
};

export default LoanAlerts;
