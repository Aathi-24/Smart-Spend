import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Zap, ChevronRight, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '../components/particles/ParticleBackground';

const DEFAULT_CREDENTIALS = [
  { name: 'Admin User', email: 'admin@expensetracker.com', password: 'Admin@123', role: 'admin', emoji: '👑' },
  { name: 'John Doe', email: 'john@expensetracker.com', password: 'John@123', role: 'user', emoji: '👤' },
  { name: 'Jane Smith', email: 'jane@expensetracker.com', password: 'Jane@123', role: 'user', emoji: '👩' },
];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result?.success) navigate('/dashboard');
  };

  const fillCredentials = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_20%),#f8fafc] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <ParticleBackground variant="default" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 opacity-90 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-300/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-300/25 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="glass rounded-[32px] border border-white/70 shadow-glass p-8 md:p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-24 h-14 rounded-[28px] bg-white/10 shadow-glow flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Smart Spend" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold text-slate-900">Smart Spend</h1>
              <p className="text-sm text-slate-500 mt-1">Real-time financial intelligence</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-3">Sign in to manage your finances</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">EMAIL</label>
              <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="admin@expensetracker.com"
                  className="input-glass w-full pl-12 pr-4 py-4 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">PASSWORD</label>
              <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Admin@123"
                  className="input-glass w-full pl-12 pr-12 py-4 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Zap size={16} />
                  <span>Sign In</span>
                  <ChevronRight size={14} />
                </>
              )}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-semibold tracking-[0.2em]">DEMO ACCOUNTS</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="space-y-3">
            {DEFAULT_CREDENTIALS.map((cred) => (
              <motion.button
                key={cred.email}
                onClick={() => fillCredentials(cred)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 p-4 rounded-3xl bg-white/80 border border-slate-200 hover:border-indigo-100 transition-all text-left"
              >
                <span className="text-xl">{cred.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{cred.name}</p>
                  <p className="text-xs text-slate-500 truncate">{cred.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase tracking-[0.2em] font-semibold rounded-full px-2.5 py-1 ${cred.role === 'admin' ? 'bg-violet-100 text-violet-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {cred.role}
                  </span>
                  <ChevronRight size={12} className="text-slate-300" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-slate-400 mt-5 flex items-center justify-center gap-1.5"
        >
          <Shield size={12} />
          Secured with JWT authentication
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
