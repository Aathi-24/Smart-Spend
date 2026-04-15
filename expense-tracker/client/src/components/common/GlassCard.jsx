import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({
  children,
  className = '',
  hover = false,
  glow = false,
  glowColor = 'primary',
  padding = 'p-6',
  onClick,
  delay = 0,
  animate = true,
}) => {
  const glowClass = {
    primary: 'hover:shadow-glow',
    mint: 'hover:shadow-[0_0_24px_rgba(16,185,129,0.3)]',
    coral: 'hover:shadow-[0_0_24px_rgba(244,63,94,0.3)]',
    gold: 'hover:shadow-[0_0_24px_rgba(245,158,11,0.3)]',
    cyan: 'hover:shadow-[0_0_24px_rgba(6,182,212,0.3)]',
  }[glowColor];

  const baseClass = `glass rounded-[20px] ${padding} ${hover ? 'card-hover cursor-pointer' : ''} ${glow ? glowClass : ''} ${className}`;

  if (animate) {
    return (
      <motion.div
        className={baseClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: [0.34, 1.56, 0.64, 1] }}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClass} onClick={onClick}>
      {children}
    </div>
  );
};

export default GlassCard;
