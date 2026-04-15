import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronDown, ChevronUp, ExternalLink, CheckCircle, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency, formatDate, formatDateFull,
  getCategoryIcon, getTypeColor, getStatusColor,
} from '../../utils/formatters';

const TransactionTable = ({ transactions }) => {
  const { deleteTransaction, markLoanPaid, sendReminder } = useApp();
  const [expanded, setExpanded] = useState(null);
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = [...transactions].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey];
    if (sortKey === 'date') { av = new Date(av); bv = new Date(bv); }
    if (sortKey === 'amount') { av = parseFloat(av); bv = parseFloat(bv); }
    return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  const SortBtn = ({ k, label }) => (
    <button
      onClick={() => handleSort(k)}
      className="flex items-center gap-1 font-semibold hover:text-indigo-700 transition-colors"
    >
      {label}
      {sortKey === k ? (
        sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      ) : (
        <div className="w-3 h-3" />
      )}
    </button>
  );

  if (transactions.length === 0) {
    return (
      <div className="glass rounded-2xl p-16 text-center">
        <p className="text-5xl mb-3">🔍</p>
        <p className="text-indigo-400 font-semibold">No transactions found</p>
        <p className="text-sm text-indigo-300 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th className="text-left"><SortBtn k="date" label="Date" /></th>
              <th className="text-left">Type</th>
              <th className="text-left">Reason</th>
              <th className="text-left">Category</th>
              <th className="text-right"><SortBtn k="amount" label="Amount" /></th>
              <th className="text-left">Status</th>
              <th className="text-left">Sheet</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {sorted.map((tx, i) => {
                const typeColor = getTypeColor(tx.type);
                const statusColor = getStatusColor(tx.loanStatus);
                const icon = getCategoryIcon(tx.category);

                return (
                  <React.Fragment key={tx._id}>
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setExpanded(expanded === tx._id ? null : tx._id)}
                      className="cursor-pointer"
                    >
                      <td>
                        <span className="text-sm text-indigo-600 font-medium">{formatDate(tx.date)}</span>
                      </td>
                      <td>
                        <span
                          className="chip text-xs"
                          style={{ background: typeColor.bg, color: typeColor.text }}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-indigo-800 font-medium">{tx.reason}</span>
                      </td>
                      <td>
                        <span className="text-sm text-indigo-500">{icon} {tx.category}</span>
                      </td>
                      <td className="text-right">
                        <span className="font-bold text-sm" style={{ color: typeColor.text }}>
                          {tx.type === 'Normal' ? '-' : tx.type === 'Loan Given' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td>
                        {tx.loanStatus ? (
                          <span className="chip text-xs" style={{ background: statusColor.bg, color: statusColor.text }}>
                            {tx.loanStatus}
                          </span>
                        ) : <span className="text-indigo-300 text-xs">—</span>}
                      </td>
                      <td>
                        {tx.syncedToSheet ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                            <CheckCircle size={12} /> Synced
                          </span>
                        ) : (
                          <span className="text-xs text-amber-500">Pending</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          {tx.type === 'Loan Given' && tx.loanStatus === 'Pending' && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); markLoanPaid(tx._id); }}
                                className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors"
                                title="Mark paid"
                              >
                                <CheckCircle size={14} />
                              </button>
                              {tx.loanGetterEmail && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); sendReminder(tx._id); }}
                                  className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-50 transition-colors"
                                  title="Send reminder"
                                >
                                  <Send size={14} />
                                </button>
                              )}
                            </>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteTransaction(tx._id); }}
                            className="p-1.5 rounded-lg text-indigo-300 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>

                    {/* Expanded row */}
                    <AnimatePresence>
                      {expanded === tx._id && (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td colSpan={8} className="bg-indigo-50/40 px-6 py-3">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              <div>
                                <p className="text-indigo-400 font-semibold uppercase tracking-wide mb-0.5">Full Date</p>
                                <p className="text-indigo-700">{formatDateFull(tx.date)}</p>
                              </div>
                              {tx.dueDate && (
                                <div>
                                  <p className="text-indigo-400 font-semibold uppercase tracking-wide mb-0.5">Due Date</p>
                                  <p className="text-indigo-700">{formatDate(tx.dueDate)}</p>
                                </div>
                              )}
                              {tx.loanGetterName && (
                                <div>
                                  <p className="text-indigo-400 font-semibold uppercase tracking-wide mb-0.5">Borrower</p>
                                  <p className="text-indigo-700">{tx.loanGetterName}</p>
                                </div>
                              )}
                              {tx.loanGetterEmail && (
                                <div>
                                  <p className="text-indigo-400 font-semibold uppercase tracking-wide mb-0.5">Borrower Email</p>
                                  <p className="text-indigo-700">{tx.loanGetterEmail}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-indigo-400 font-semibold uppercase tracking-wide mb-0.5">Transaction ID</p>
                                <p className="text-indigo-400 font-mono truncate">{tx._id}</p>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-indigo-50">
        {sorted.map((tx, i) => {
          const typeColor = getTypeColor(tx.type);
          const icon = getCategoryIcon(tx.category);
          return (
            <motion.div
              key={tx._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-4 hover:bg-indigo-50/30"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: typeColor.bg }}
                >
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-indigo-900 truncate">{tx.reason}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-indigo-400">{formatDate(tx.date)}</span>
                    <span className="chip text-[10px]" style={{ background: typeColor.bg, color: typeColor.text }}>
                      {tx.type}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-bold text-sm" style={{ color: typeColor.text }}>
                    {formatCurrency(tx.amount)}
                  </span>
                  <button
                    onClick={() => deleteTransaction(tx._id)}
                    className="p-1 rounded-lg text-indigo-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionTable;
