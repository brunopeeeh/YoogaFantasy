// Variants compartilhados de animação para uso com framer-motion.
// Mantém consistência de timing/cubic-bezier em todo o app.

export const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
};

export const popIn = {
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.6, opacity: 0 },
  transition: { type: 'spring', stiffness: 420, damping: 24 },
};

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.92, opacity: 0 },
  transition: { duration: 0.18, ease: 'easeOut' },
};

export const slideInRight = {
  initial: { x: 40, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 40, opacity: 0 },
  transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
};

export const slideInUp = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: { type: 'spring', stiffness: 320, damping: 32 },
};

export const slotPulse = {
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(255,215,0,0.5)',
      '0 0 0 14px rgba(255,215,0,0)',
    ],
  },
  transition: { duration: 1.5, repeat: Infinity, ease: 'easeOut' },
};

export const captainGlow = {
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(255,215,0,0)',
      '0 0 0 6px rgba(255,215,0,0.35)',
      '0 0 0 0 rgba(255,215,0,0)',
    ],
  },
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
};

export const dropZoneValid = {
  initial: { scale: 1 },
  animate: { scale: 1.08, boxShadow: '0 0 0 4px rgba(16,185,129,0.5)' },
};

export const dropZoneInvalid = {
  initial: { scale: 1 },
  animate: { scale: 1.04, boxShadow: '0 0 0 3px rgba(239,68,68,0.4)' },
};

export const shimmer = {
  initial: { backgroundPosition: '-200% 0' },
  animate: { backgroundPosition: '200% 0' },
  transition: { duration: 1.4, repeat: Infinity, ease: 'linear' },
};
