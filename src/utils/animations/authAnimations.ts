import { Variants } from 'framer-motion';

export const buttonTap = {
  scale: 0.95,
  transition: { duration: 0.1, ease: 'easeOut' },
};

export const inputFocus = {
  scale: 1.02,
  borderColor: 'hsl(var(--primary))',
  boxShadow: '0 0 0 4px hsla(var(--primary), 0.1)',
  transition: { duration: 0.2 },
};

export const errorShake = {
  x: [0, -10, 10, -10, 10, -5, 5, 0],
  transition: { duration: 0.5 },
};

export const successPulse = {
  scale: [1, 1.05, 1],
  opacity: [1, 0.9, 1],
  transition: {
    duration: 0.4,
    repeat: 2,
  },
};

export const cardHover = {
  y: -8,
  boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
  transition: { duration: 0.3, ease: 'easeOut' },
};

export const iconBounce = {
  y: [0, -10, 0],
  transition: {
    duration: 0.5,
    ease: [0.68, -0.55, 0.265, 1.55],
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

export const slideInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 50,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const rotateIn: Variants = {
  hidden: { 
    opacity: 0, 
    rotate: -180,
    scale: 0,
  },
  visible: { 
    opacity: 1, 
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

// Confetti animation helper
export const confettiAnimation = {
  initial: { y: -20, opacity: 1, scale: 1 },
  animate: (i: number) => ({
    y: window.innerHeight + 100,
    x: (Math.random() - 0.5) * 300,
    rotate: Math.random() * 720,
    opacity: 0,
    transition: {
      duration: 2 + Math.random(),
      delay: i * 0.05,
      ease: 'easeIn',
    },
  }),
};

export const floatingAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const pulseGlow = {
  boxShadow: [
    '0 0 20px rgba(16, 185, 129, 0.3)',
    '0 0 40px rgba(16, 185, 129, 0.6)',
    '0 0 20px rgba(16, 185, 129, 0.3)',
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
  },
};
