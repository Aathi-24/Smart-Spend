import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatDate = (date) => {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'dd MMM yyyy');
};

export const formatDateFull = (date) => {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy, hh:mm a');
};

export const formatDateShort = (date) => {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd');
};

export const formatRelative = (date) => {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
};

export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const d = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  const diff = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
};

export const formatDueDate = (dueDate) => {
  if (!dueDate) return null;
  const days = getDaysUntilDue(dueDate);
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, color: 'coral', urgent: true };
  if (days === 0) return { text: 'Due today!', color: 'coral', urgent: true };
  if (days <= 3) return { text: `Due in ${days}d`, color: 'gold', urgent: true };
  return { text: `Due in ${days}d`, color: 'mint', urgent: false };
};

export const getCategoryIcon = (category) => {
  const icons = {
    Food: '🍔',
    Transport: '🚗',
    Shopping: '🛍️',
    Entertainment: '🎬',
    Medical: '💊',
    Utilities: '⚡',
    Education: '📚',
    Loan: '💰',
    Other: '📦',
  };
  return icons[category] || '📦';
};

export const getTypeColor = (type) => {
  switch (type) {
    case 'Normal': return { bg: 'rgba(16,185,129,0.1)', text: '#059669', border: 'rgba(16,185,129,0.3)' };
    case 'Loan Given': return { bg: 'rgba(245,158,11,0.1)', text: '#d97706', border: 'rgba(245,158,11,0.3)' };
    case 'Loan Borrowed': return { bg: 'rgba(244,63,94,0.1)', text: '#e11d48', border: 'rgba(244,63,94,0.3)' };
    default: return { bg: 'rgba(99,102,241,0.1)', text: '#4f46e5', border: 'rgba(99,102,241,0.3)' };
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Paid': return { bg: 'rgba(16,185,129,0.1)', text: '#059669' };
    case 'Pending': return { bg: 'rgba(245,158,11,0.1)', text: '#d97706' };
    case 'Overdue': return { bg: 'rgba(244,63,94,0.1)', text: '#e11d48' };
    default: return { bg: 'rgba(156,163,175,0.1)', text: '#6b7280' };
  }
};

export const generateChartColors = (count) => {
  const palette = [
    'rgba(99,102,241,0.8)', 'rgba(6,182,212,0.8)', 'rgba(16,185,129,0.8)',
    'rgba(245,158,11,0.8)', 'rgba(244,63,94,0.8)', 'rgba(139,92,246,0.8)',
    'rgba(236,72,153,0.8)', 'rgba(59,130,246,0.8)', 'rgba(20,184,166,0.8)',
  ];
  return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
};
