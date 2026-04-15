import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Zap, ChevronRight, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '../components/particles/ParticleBackground';

const ThreeScene = React.lazy(() => import('../components/three/ThreeScene'));

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
    <div className="min-h-screen gradient-mesh flex overflow-hidden">
      {/* Particles */}
      <ParticleBackground variant="dense" />

      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Left panel — 3D scene */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12">
        <Suspense fallback={null}>
          <ThreeScene className="absolute inset-0" />
        </Suspense>

        {/* Overlay text */}
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="glass rounded-3xl p-10 max-w-sm"
          >
            <div className="text-5xl mb-4">💸</div>
            <h2 className="text-3xl font-display font-bold text-indigo-900 mb-3">
              Smart Finance <br />at Your Fingertips
            </h2>
            <p className="text-indigo-500 text-sm leading-relaxed">
              Track expenses, manage loans, sync with Google Sheets, and get automated reminders — all in one place.
            </p>

            <div className="mt-6 space-y-2">
              {[
                { icon: '📊', text: 'Google Sheets Auto-Sync' },
                { icon: '📧', text: 'Automated Email Reminders' },
                { icon: '🔔', text: 'Loan Due Date Alerts' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-indigo-600">
                  <span>{icon}</span>
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="w-full lg:w-[480px] flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow"
            >
              <span className="text-2xl">💸</span>
            </motion.div>
            <div>
              <h1 className="text-xl font-display font-bold text-indigo-900">ExpenseTracker Pro</h1>
              <p className="text-xs text-indigo-400">Real-time financial intelligence</p>
            </div>
          </div>

          {/* Card */}
          <div className="glass rounded-3xl p-8 shadow-glass">
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-indigo-900">Welcome back</h2>
              <p className="text-sm text-indigo-400 mt-1">Sign in to manage your finances</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Email</label>
                <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    className="input-glass w-full pl-11 pr-4 py-3.5 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Password</label>
                <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="input-glass w-full pl-11 pr-12 py-3.5 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-indigo-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm font-semibold mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
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

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-indigo-100" />
              <span className="text-xs text-indigo-300 font-medium">DEMO ACCOUNTS</span>
              <div className="flex-1 h-px bg-indigo-100" />
            </div>

            {/* Default users */}
            <div className="space-y-2">
              {DEFAULT_CREDENTIALS.map((cred) => (
                <motion.button
                  key={cred.email}
                  onClick={() => fillCredentials(cred)}
                  whileHover={{ scale: 1.02, x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 hover:border-indigo-200 transition-all text-left group"
                >
                  <span className="text-xl">{cred.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-indigo-800">{cred.name}</p>
                    <p className="text-xs text-indigo-400 truncate">{cred.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`chip text-[10px] ${cred.role === 'admin' ? 'bg-violet-100 text-violet-600' : 'chip-normal'}`}>
                      {cred.role}
                    </span>
                    <ChevronRight size={12} className="text-indigo-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs text-indigo-400 mt-4 flex items-center justify-center gap-1.5"
          >
            <Shield size={12} />
            Secured with JWT authentication
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
