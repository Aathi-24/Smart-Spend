import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import PageTransition from '../components/layout/PageTransition';
import LoanCard from '../components/loans/LoanCard';
import LoanAlerts from '../components/loans/LoanAlerts';
import AddTransactionModal from '../components/transactions/AddTransactionModal';
import ParticleBackground from '../components/particles/ParticleBackground';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';

const TABS = ['All', 'Loan Given', 'Loan Borrowed'];
const STATUSES = ['All', 'Pending', 'Paid', 'Overdue'];

const LoansPage = () => {
  const { transactions, fetchTransactions, loadingTx } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const loans = useMemo(() => {
    return transactions.filter((tx) => {
      if (tx.type !== 'Loan Given' && tx.type !== 'Loan Borrowed') return false;
      if (tab !== 'All' && tx.type !== tab) return false;
      if (statusFilter !== 'All' && tx.loanStatus !== statusFilter) return false;
      return true;
    });
  }, [transactions, tab, statusFilter]);

  const summary = useMemo(() => {
    const given = transactions.filter((t) => t.type === 'Loan Given' && t.loanStatus === 'Pending');
    const borrowed = transactions.filter((t) => t.type === 'Loan Borrowed' && t.loanStatus === 'Pending');
    return {
      givenPending: given.reduce((s, t) => s + t.amount, 0),
      givenCount: given.length,
      borrowedPending: borrowed.reduce((s, t) => s + t.amount, 0),
      borrowedCount: borrowed.length,
    };
  }, [transactions]);

  return (
    <div className="min-h-screen gradient-mesh flex">
      <ParticleBackground variant="default" />
      <div className="orb orb-1 opacity-20" />

      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative z-10">
        <Navbar title="Loans" onAddTransaction={() => setModalOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <PageTransition variant="slideRight">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 border border-amber-100 bg-gradient-to-br from-amber-50/60 to-orange-50/40"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-amber-500" />
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Pending Recovery</span>
                </div>
                <p className="text-2xl font-display font-bold text-amber-700">{formatCurrency(summary.givenPending)}</p>
                <p className="text-xs text-amber-500 mt-1">{summary.givenCount} loan{summary.givenCount !== 1 ? 's' : ''} pending</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.07 }}
                className="glass rounded-2xl p-5 border border-red-100 bg-gradient-to-br from-red-50/60 to-rose-50/40"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown size={16} className="text-red-500" />
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Pending Repayment</span>
                </div>
                <p className="text-2xl font-display font-bold text-red-600">{formatCurrency(summary.borrowedPending)}</p>
                <p className="text-xs text-red-400 mt-1">{summary.borrowedCount} loan{summary.borrowedCount !== 1 ? 's' : ''} to repay</p>
              </motion.div>
            </div>

            {/* Alerts */}
            <div className="mb-5">
              <LoanAlerts />
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div className="flex gap-2 bg-white/60 backdrop-blur-sm p-1 rounded-2xl border border-indigo-100">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      tab === t
                        ? 'bg-indigo-500 text-white shadow-glow'
                        : 'text-indigo-500 hover:bg-indigo-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      statusFilter === s
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'bg-white/60 text-indigo-500 border-indigo-200 hover:border-indigo-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Loans grid */}
            {loadingTx ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass rounded-2xl p-5 space-y-3 h-52">
                    <div className="skeleton h-4 w-24 rounded" />
                    <div className="skeleton h-8 w-32 rounded" />
                    <div className="skeleton h-3 w-full rounded" />
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-8 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : loans.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-16 text-center"
              >
                <p className="text-5xl mb-3">💰</p>
                <p className="text-indigo-400 font-semibold text-lg">No loans found</p>
                <p className="text-sm text-indigo-300 mt-1">Add a loan transaction to track it here</p>
                <motion.button
                  onClick={() => setModalOpen(true)}
                  whileHover={{ scale: 1.04 }}
                  className="btn-primary mt-5 px-6 py-2.5 text-sm inline-flex items-center gap-2"
                >
                  <Plus size={15} /> Add Loan
                </motion.button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {loans.map((loan, i) => (
                    <LoanCard key={loan._id} loan={loan} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </PageTransition>
        </main>
      </div>

      <AddTransactionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default LoansPage;
