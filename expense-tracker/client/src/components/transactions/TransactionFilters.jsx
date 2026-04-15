import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';

const TYPES = ['All', 'Normal', 'Loan Given', 'Loan Borrowed'];
const CATEGORIES = ['All', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Medical', 'Utilities', 'Education', 'Loan', 'Other'];

const TransactionFilters = ({ filters, onChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = (key, val) => onChange({ ...filters, [key]: val });
  const reset = () => onChange({ type: 'All', category: 'All', search: '', startDate: '', endDate: '' });

  const hasActive = filters.type !== 'All' || filters.category !== 'All' ||
    filters.search || filters.startDate || filters.endDate;

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      {/* Search + toggle row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Search transactions…"
            className="input-glass w-full pl-10 pr-4 py-2.5 text-sm"
          />
          {filters.search && (
            <button onClick={() => set('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-indigo-600">
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
            showAdvanced || hasActive
              ? 'bg-indigo-500 text-white border-indigo-500'
              : 'bg-white/60 text-indigo-600 border-indigo-200 hover:border-indigo-400'
          }`}
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filters</span>
          {hasActive && <span className="w-4 h-4 rounded-full bg-white/30 text-xs flex items-center justify-center font-bold">!</span>}
        </button>

        {hasActive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={reset}
            className="p-2.5 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors"
            title="Clear filters"
          >
            <X size={15} />
          </motion.button>
        )}
      </div>

      {/* Type pills */}
      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => set('type', t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filters.type === t
                ? 'bg-indigo-500 text-white border-indigo-500'
                : 'bg-white/60 text-indigo-500 border-indigo-200 hover:border-indigo-400'
            }`}
          >
            {t === 'All' ? '🔘 All' : t === 'Normal' ? '💳 Normal' : t === 'Loan Given' ? '🤝 Loan Given' : '💸 Loan Borrowed'}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-indigo-100"
        >
          {/* Category */}
          <div className="col-span-2">
            <label className="text-xs text-indigo-400 font-semibold mb-1 block">Category</label>
            <select
              value={filters.category || 'All'}
              onChange={(e) => set('category', e.target.value)}
              className="input-glass w-full px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Date range */}
          <div>
            <label className="text-xs text-indigo-400 font-semibold mb-1 block">From</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => set('startDate', e.target.value)}
              className="input-glass w-full px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-indigo-400 font-semibold mb-1 block">To</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => set('endDate', e.target.value)}
              className="input-glass w-full px-3 py-2 text-sm"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TransactionFilters;
