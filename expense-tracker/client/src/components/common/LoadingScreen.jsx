import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 gradient-mesh flex items-center justify-center z-50">
      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="relative flex flex-col items-center gap-6">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center shadow-glow overflow-hidden">
            <img src="/logo.png" alt="Smart Spend" className="w-12 h-12 object-contain" />
          </div>
          {/* Spinning ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-2xl border-2 border-transparent"
            style={{
              background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #6366f1, #06b6d4, #10b981) border-box',
            }}
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-2xl font-display font-bold text-indigo-900">Smart Spend</h1>
          <p className="text-sm text-indigo-400 mt-1 font-body">Loading your finances...</p>
        </motion.div>

        {/* Dots */}
        <motion.div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-400"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;
