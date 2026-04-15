import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, Tag, Mail, User, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Medical', 'Utilities', 'Education', 'Loan', 'Other'];
const TYPES = ['Normal', 'Loan Given', 'Loan Borrowed'];

const initialForm = {
  date: new Date().toISOString().split('T')[0],
  type: 'Normal',
  amount: '',
  reason: '',
  category: 'Other',
  loanGetterEmail: '',
  loanGetterName: '',
  dueDate: '',
};

const AddTransactionModal = ({ isOpen, onClose }) => {
  const { addTransaction } = useApp();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm);
      setErrors({});
    }
  }, [isOpen]);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.reason.trim()) e.reason = 'Reason is required';
    if (!form.date) e.date = 'Date is required';
    if (form.type !== 'Normal' && !form.dueDate) e.dueDate = 'Due date is required for loans';
    if (form.type === 'Loan Given') {
      if (!form.loanGetterEmail) e.loanGetterEmail = 'Borrower email is required';
      if (!form.loanGetterName) e.loanGetterName = 'Borrower name is required';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    const result = await addTransaction({ ...form, amount: parseFloat(form.amount) });
    setLoading(false);
    if (result?.success) onClose();
  };

  const isLoan = form.type !== 'Normal';

  const typeConfig = {
    Normal: { color: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-200', emoji: '💳' },
    'Loan Given': { color: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-200', emoji: '🤝' },
    'Loan Borrowed': { color: '#f43f5e', bg: 'bg-red-50', border: 'border-red-200', emoji: '💸' },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-indigo-950/25 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg glass rounded-3xl shadow-glass overflow-hidden"
              initial={{ y: 60, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 60, scale: 0.95 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-indigo-100">
                <div>
                  <h2 className="text-xl font-display font-bold text-indigo-900">Add Transaction</h2>
                  <p className="text-xs text-indigo-400 mt-0.5">Record a new expense or loan</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-indigo-100 text-indigo-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Type selector */}
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map((t) => {
                    const cfg = typeConfig[t];
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => set('type', t)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all text-xs font-semibold ${
                          form.type === t
                            ? `${cfg.bg} ${cfg.border} scale-[1.02]`
                            : 'bg-white/60 border-indigo-100 hover:bg-indigo-50'
                        }`}
                        style={{ color: form.type === t ? cfg.color : '#6b7280' }}
                      >
                        <span className="text-xl">{cfg.emoji}</span>
                        <span className="text-center leading-tight">{t}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Amount + Date row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1.5 block">Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300 text-sm font-bold">₹</span>
                      <input
                        type="number"
                        value={form.amount}
                        onChange={(e) => set('amount', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={`input-glass w-full pl-7 pr-3 py-3 text-sm ${errors.amount ? 'border-red-400' : ''}`}
                      />
                    </div>
                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1.5 block">Date</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" />
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => set('date', e.target.value)}
                        className={`input-glass w-full pl-9 pr-3 py-3 text-sm ${errors.date ? 'border-red-400' : ''}`}
                      />
                    </div>
                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1.5 block">Reason / Description</label>
                  <input
                    type="text"
                    value={form.reason}
                    onChange={(e) => set('reason', e.target.value)}
                    placeholder="e.g. Lunch at cafe, Tea, Groceries…"
                    className={`input-glass w-full px-4 py-3 text-sm ${errors.reason ? 'border-red-400' : ''}`}
                  />
                  {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1.5 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => set('category', cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          form.category === cat
                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-glow'
                            : 'bg-white/60 text-indigo-500 border-indigo-200 hover:border-indigo-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loan fields */}
                <AnimatePresence>
                  {isLoan && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      {/* Due date */}
                      <div>
                        <label className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1.5 block">Due Date *</label>
                        <div className="relative">
                          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" />
                          <input
                            type="date"
                            value={form.dueDate}
                            onChange={(e) => set('dueDate', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className={`input-glass w-full pl-9 pr-3 py-3 text-sm ${errors.dueDate ? 'border-red-400' : ''}`}
                          />
                        </div>
                        {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
                      </div>

                      {/* Loan Given: borrower details */}
                      {form.type === 'Loan Given' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3 p-4 bg-amber-50/60 rounded-2xl border border-amber-100"
                        >
                          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1.5">
                            <AlertCircle size={12} /> Borrower Details (for email reminder)
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-indigo-500 mb-1 block">Name *</label>
                              <div className="relative">
                                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" />
                                <input
                                  type="text"
                                  value={form.loanGetterName}
                                  onChange={(e) => set('loanGetterName', e.target.value)}
                                  placeholder="Borrower name"
                                  className={`input-glass w-full pl-8 pr-3 py-3 text-sm ${errors.loanGetterName ? 'border-red-400' : ''}`}
                                />
                              </div>
                              {errors.loanGetterName && <p className="text-red-500 text-xs mt-1">{errors.loanGetterName}</p>}
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-indigo-500 mb-1 block">Email *</label>
                              <div className="relative">
                                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" />
                                <input
                                  type="email"
                                  value={form.loanGetterEmail}
                                  onChange={(e) => set('loanGetterEmail', e.target.value)}
                                  placeholder="borrower@email.com"
                                  className={`input-glass w-full pl-8 pr-3 py-3 text-sm ${errors.loanGetterEmail ? 'border-red-400' : ''}`}
                                />
                              </div>
                              {errors.loanGetterEmail && <p className="text-red-500 text-xs mt-1">{errors.loanGetterEmail}</p>}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {form.type === 'Loan Borrowed' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-red-50 rounded-xl border border-red-100"
                        >
                          <p className="text-xs text-red-600 font-medium flex items-center gap-1.5">
                            <AlertCircle size={12} />
                            You will receive an email alert 3 days before the due date to remind you to repay.
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="btn-primary w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <span>Save Transaction</span>
                      <span>{typeConfig[form.type]?.emoji}</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddTransactionModal;
