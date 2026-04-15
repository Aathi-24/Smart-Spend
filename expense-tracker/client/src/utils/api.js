import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ── Transactions ──────────────────────────────────
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getStats: () => api.get('/transactions/stats/summary'),
};

// ── Loans ─────────────────────────────────────────
export const loanAPI = {
  getAll: (params) => api.get('/loans', { params }),
  markPaid: (id) => api.put(`/loans/${id}/mark-paid`),
  sendReminder: (id) => api.post(`/loans/${id}/send-reminder`),
  getUpcoming: () => api.get('/loans/alerts/upcoming'),
};

// ── Sheets ────────────────────────────────────────
export const sheetsAPI = {
  getStatus: () => api.get('/sheets/status'),
  syncAll: () => api.post('/sheets/sync-all'),
  getData: () => api.get('/sheets/data'),
};

export default api;
