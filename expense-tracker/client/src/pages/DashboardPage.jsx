import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ExternalLink, Sparkles } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import PageTransition from '../components/layout/PageTransition';
import StatsCards from '../components/dashboard/StatsCards';
import Charts from '../components/dashboard/Charts';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import LoanAlerts from '../components/loans/LoanAlerts';
import AddTransactionModal from '../components/transactions/AddTransactionModal';
import ParticleBackground from '../components/particles/ParticleBackground';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { sheetsAPI } from '../utils/api';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { fetchStats, fetchTransactions, fetchLoanAlerts, sheetsConnected } = useApp();
  const { user } = useAuth();

  const handleRefresh = async () => {
    await Promise.all([fetchStats(), fetchTransactions(), fetchLoanAlerts()]);
    toast.success('Data refreshed!');
  };

  const handleSyncSheets = async () => {
    setSyncing(true);
    try {
      const { data } = await sheetsAPI.syncAll();
      if (data.success) toast.success(data.message);
    } catch {
      toast.error('Sync failed — check Google Sheets credentials');
    } finally {
      setSyncing(false);
    }
  };

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen gradient-mesh flex">
      <ParticleBackground variant="default" />
      <div className="orb orb-1 opacity-30" />
      <div className="orb orb-2 opacity-25" />

      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative z-10">
        <Navbar
          title="Dashboard"
          onAddTransaction={() => setModalOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <PageTransition variant="fadeUp">
            {/* Hero greeting */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h1 className="text-2xl lg:text-3xl font-display font-bold text-indigo-900">
                  {greeting}, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-sm text-indigo-400 mt-1 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Here's your financial snapshot
                </p>
              </div>

              <div className="flex items-center gap-2">
                {sheetsConnected && (
                  <motion.button
                    onClick={handleSyncSheets}
                    disabled={syncing}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-glass flex items-center gap-2 px-4 py-2.5 text-sm"
                  >
                    <motion.div
                      animate={syncing ? { rotate: 360 } : {}}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <ExternalLink size={15} />
                    </motion.div>
                    {syncing ? 'Syncing…' : 'Sync Sheets'}
                  </motion.button>
                )}

                <motion.button
                  onClick={handleRefresh}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-glass flex items-center gap-2 px-4 py-2.5 text-sm"
                >
                  <RefreshCw size={15} />
                  <span className="hidden sm:inline">Refresh</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="mb-6">
              <StatsCards />
            </div>

            {/* Loan alerts (if any) */}
            <div className="mb-6">
              <LoanAlerts />
            </div>

            {/* Charts */}
            <div className="mb-6">
              <Charts />
            </div>

            {/* Recent transactions */}
            <RecentTransactions />
          </PageTransition>
        </main>
      </div>

      <AddTransactionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default DashboardPage;
