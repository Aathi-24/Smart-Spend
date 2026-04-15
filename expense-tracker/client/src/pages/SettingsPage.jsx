import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Database, ExternalLink, CheckCircle, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/common/GlassCard';
import ParticleBackground from '../components/particles/ParticleBackground';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { authAPI, sheetsAPI } from '../utils/api';
import toast from 'react-hot-toast';

const DEFAULT_USERS_INFO = [
  { name: 'Admin User', email: 'admin@expensetracker.com', password: 'Admin@123', role: 'admin' },
  { name: 'John Doe', email: 'john@expensetracker.com', password: 'John@123', role: 'user' },
  { name: 'Jane Smith', email: 'jane@expensetracker.com', password: 'Jane@123', role: 'user' },
];

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { sheetsConnected } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sheetData, setSheetData] = useState(null);
  const [loadingSheetData, setLoadingSheetData] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile({ name });
      if (data.success) {
        updateUser({ name });
        toast.success('Profile updated!');
      }
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const { data } = await sheetsAPI.syncAll();
      if (data.success) toast.success(data.message);
    } catch { toast.error('Sync failed — check Google Sheets credentials'); }
    finally { setSyncing(false); }
  };

  const handleViewSheetData = async () => {
    setLoadingSheetData(true);
    try {
      const { data } = await sheetsAPI.getData();
      if (data.success) setSheetData(data.data);
    } catch { toast.error('Could not fetch sheet data'); }
    finally { setLoadingSheetData(false); }
  };

  return (
    <div className="min-h-screen gradient-mesh flex">
      <ParticleBackground variant="default" />
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative z-10">
        <Navbar title="Settings" />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <PageTransition variant="scale">
            <div className="max-w-3xl mx-auto space-y-5">

              {/* Profile */}
              <GlassCard delay={0.05}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <User size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-indigo-900">Profile</h3>
                    <p className="text-xs text-indigo-400">Update your information</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-display font-bold text-2xl">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-indigo-900">{user?.name}</p>
                    <p className="text-sm text-indigo-400">{user?.email}</p>
                    <span className={`chip mt-1 ${user?.role === 'admin' ? 'bg-violet-100 text-violet-600' : 'chip-normal'}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-indigo-500 uppercase tracking-wide block mb-1.5">Display Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-glass w-full px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-indigo-500 uppercase tracking-wide block mb-1.5">Email</label>
                    <input value={user?.email} disabled className="input-glass w-full px-4 py-3 text-sm opacity-60 cursor-not-allowed" />
                  </div>
                  <motion.button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="btn-primary px-6 py-2.5 text-sm"
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </motion.button>
                </div>
              </GlassCard>

              {/* Default Users */}
              <GlassCard delay={0.1}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Shield size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-indigo-900">Default User Accounts</h3>
                    <p className="text-xs text-indigo-400">Pre-configured demo credentials</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {DEFAULT_USERS_INFO.map((u) => (
                    <div key={u.email} className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <p className="text-sm font-semibold text-indigo-800">{u.name}</p>
                          <p className="text-xs text-indigo-400">{u.email}</p>
                        </div>
                        <span className={`chip ${u.role === 'admin' ? 'bg-violet-100 text-violet-600' : 'chip-normal'}`}>
                          {u.role}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-indigo-400">Password:</span>
                        <code className="text-xs bg-white px-2 py-0.5 rounded-lg border border-indigo-100 text-indigo-600 font-mono">
                          {u.password}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-indigo-300 mt-3 flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  These credentials are stored in MongoDB & synced to Google Sheets
                </p>
              </GlassCard>

              {/* Google Sheets */}
              <GlassCard delay={0.15}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Database size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-indigo-900">Google Sheets Integration</h3>
                    <p className="text-xs text-indigo-400">Sync & view your sheet data</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`chip ${sheetsConnected ? 'chip-normal' : 'bg-amber-100 text-amber-600'}`}>
                      {sheetsConnected ? '● Connected' : '○ Not Connected'}
                    </span>
                  </div>
                </div>

                {sheetsConnected ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={15} className="text-emerald-600" />
                        <p className="text-sm font-semibold text-emerald-700">Connected to Google Sheets</p>
                      </div>
                      <p className="text-xs text-emerald-600">
                        All new transactions are automatically synced. Sheet columns: Date of Transaction, Type of Expense, Amount, Reason, Category, Due Date, Borrower Email, Borrower Name, Loan Status, User, Transaction ID.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <motion.button
                        onClick={handleSyncAll}
                        disabled={syncing}
                        whileHover={{ scale: 1.02 }}
                        className="btn-glass flex items-center gap-2 px-4 py-2.5 text-sm"
                      >
                        <motion.div animate={syncing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <RefreshCw size={14} />
                        </motion.div>
                        {syncing ? 'Syncing All…' : 'Sync All Transactions'}
                      </motion.button>

                      <motion.button
                        onClick={handleViewSheetData}
                        disabled={loadingSheetData}
                        whileHover={{ scale: 1.02 }}
                        className="btn-glass flex items-center gap-2 px-4 py-2.5 text-sm"
                      >
                        <ExternalLink size={14} />
                        {loadingSheetData ? 'Loading…' : 'View Sheet Data'}
                      </motion.button>
                    </div>

                    {/* Sheet data preview */}
                    {sheetData && sheetData.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 overflow-x-auto"
                      >
                        <p className="text-xs font-semibold text-indigo-500 mb-2 uppercase tracking-wide">
                          Sheet Preview ({sheetData.length - 1} rows)
                        </p>
                        <div className="bg-white/80 rounded-2xl border border-indigo-100 overflow-hidden">
                          <table className="text-xs w-full">
                            <thead>
                              <tr>
                                {(sheetData[0] || []).map((h, i) => (
                                  <th key={i} className="px-3 py-2 text-left font-semibold text-indigo-500 bg-indigo-50 whitespace-nowrap">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {sheetData.slice(1, 8).map((row, i) => (
                                <tr key={i} className="border-t border-indigo-50">
                                  {row.map((cell, j) => (
                                    <td key={j} className="px-3 py-2 text-indigo-700 whitespace-nowrap">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {sheetData.length > 8 && (
                            <p className="text-center text-xs text-indigo-400 py-2 border-t border-indigo-50">
                              + {sheetData.length - 8} more rows in Google Sheets
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-sm">
                    <p className="font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
                      <AlertCircle size={14} /> Setup Required
                    </p>
                    <p className="text-amber-700 text-xs leading-relaxed">
                      To enable Google Sheets sync, configure your service account credentials in the server <code className="bg-amber-100 px-1 rounded">.env</code> file:
                    </p>
                    <pre className="mt-2 text-xs bg-amber-100 rounded-xl p-3 text-amber-800 overflow-x-auto">{`GOOGLE_SHEETS_CLIENT_EMAIL=...
GOOGLE_SHEETS_PRIVATE_KEY=...
GOOGLE_SHEET_ID=...`}</pre>
                  </div>
                )}
              </GlassCard>

              {/* Danger zone */}
              <GlassCard delay={0.2} className="border border-red-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <AlertCircle size={18} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-indigo-900">Account</h3>
                    <p className="text-xs text-indigo-400">Session management</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold transition-all"
                >
                  <LogOut size={15} /> Logout
                </button>
              </GlassCard>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
