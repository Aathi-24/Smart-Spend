import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  fadeUp: {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
  },
  slideRight: {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 60 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.04 },
  },
  flip: {
    initial: { opacity: 0, rotateX: 15, y: 40 },
    animate: { opacity: 1, rotateX: 0, y: 0 },
    exit: { opacity: 0, rotateX: -10, y: -20 },
  },
};

const PageTransition = ({ children, variant = 'fadeUp', className = '' }) => {
  const v = pageVariants[variant] || pageVariants.fadeUp;

  return (
    <motion.div
      className={className}
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
