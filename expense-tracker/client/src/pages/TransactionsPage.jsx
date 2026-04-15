import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, RefreshCw } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import PageTransition from '../components/layout/PageTransition';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionTable from '../components/transactions/TransactionTable';
import AddTransactionModal from '../components/transactions/AddTransactionModal';
import ParticleBackground from '../components/particles/ParticleBackground';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';

const TransactionsPage = () => {
  const { transactions, loadingTx, fetchTransactions } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({ type: 'All', category: 'All', search: '', startDate: '', endDate: '' });

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filters.type !== 'All' && tx.type !== filters.type) return false;
      if (filters.category !== 'All' && tx.category !== filters.category) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!tx.reason?.toLowerCase().includes(s) &&
            !tx.category?.toLowerCase().includes(s) &&
            !tx.loanGetterName?.toLowerCase().includes(s)) return false;
      }
      if (filters.startDate && new Date(tx.date) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(tx.date) > new Date(filters.endDate)) return false;
      return true;
    });
  }, [transactions, filters]);

  const totalFiltered = filtered.reduce((acc, tx) => {
    if (tx.type === 'Normal') acc.spent += tx.amount;
    if (tx.type === 'Loan Given') acc.given += tx.amount;
    if (tx.type === 'Loan Borrowed') acc.borrowed += tx.amount;
    return acc;
  }, { spent: 0, given: 0, borrowed: 0 });

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Category', 'Reason', 'Due Date', 'Borrower Email', 'Loan Status'];
    const rows = filtered.map((tx) => [
      new Date(tx.date).toLocaleDateString('en-IN'),
      tx.type,
      tx.amount,
      tx.category,
      `"${tx.reason}"`,
      tx.dueDate ? new Date(tx.dueDate).toLocaleDateString('en-IN') : '',
      tx.loanGetterEmail || '',
      tx.loanStatus || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'transactions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen gradient-mesh flex">
      <ParticleBackground variant="default" />
      <div className="orb orb-1 opacity-20" />
      <div className="orb orb-2 opacity-15" />

      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative z-10">
        <Navbar title="Transactions" onAddTransaction={() => setModalOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <PageTransition variant="slideLeft">
            {/* Summary strip */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-3 mb-5"
            >
              {[
                { label: 'Spent', amount: totalFiltered.spent, color: '#6366f1', bg: 'bg-indigo-50 border-indigo-100' },
                { label: 'Given', amount: totalFiltered.given, color: '#f59e0b', bg: 'bg-amber-50 border-amber-100' },
                { label: 'Borrowed', amount: totalFiltered.borrowed, color: '#f43f5e', bg: 'bg-red-50 border-red-100' },
              ].map((s) => (
                <div key={s.label} className={`glass ${s.bg} rounded-2xl p-3 border text-center`}>
                  <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide">{s.label}</p>
                  <p className="text-sm lg:text-base font-display font-bold mt-0.5" style={{ color: s.color }}>
                    {formatCurrency(s.amount)}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-4 gap-3">
              <p className="text-sm text-indigo-400 font-medium">
                {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchTransactions()}
                  className="btn-glass p-2.5 rounded-xl"
                  title="Refresh"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  onClick={exportCSV}
                  className="btn-glass flex items-center gap-2 px-3 py-2.5 text-sm"
                >
                  <Download size={15} />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
                <motion.button
                  onClick={() => setModalOpen(true)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add New</span>
                </motion.button>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-4">
              <TransactionFilters filters={filters} onChange={setFilters} />
            </div>

            {/* Table */}
            {loadingTx ? (
              <div className="glass rounded-2xl p-8 space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="skeleton w-10 h-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3 w-40 rounded" />
                      <div className="skeleton h-2 w-24 rounded" />
                    </div>
                    <div className="skeleton h-4 w-20 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <TransactionTable transactions={filtered} />
            )}
          </PageTransition>
        </main>
      </div>

      <AddTransactionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default TransactionsPage;
