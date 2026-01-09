import { Variants } from 'framer-motion';

// Premium transition presets
export const premiumTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 15,
  mass: 1,
};

export const smoothTransition = {
  type: 'spring' as const,
  stiffness: 150,
  damping: 20,
  mass: 0.8,
};

export const softTransition = {
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

export const premiumEase = [0.16, 1, 0.3, 1] as [number, number, number, number];

// Fade animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4, ease: premiumEase }
  }
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: premiumEase }
  }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: premiumEase }
  }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: premiumEase }
  }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: premiumEase }
  }
};

// Scale animations
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: premiumEase }
  }
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
    }
  }
};

// Stagger containers
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  }
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    }
  }
};

// Hover animations - Soft and subtle
export const cardHover = {
  y: -4,
  transition: premiumTransition,
};

export const cardHoverSubtle = {
  y: -2,
  transition: smoothTransition,
};

export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

export const buttonHover = {
  scale: 1.02,
  transition: smoothTransition,
};

// Float animation for decorative elements
export const floatAnimation: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  }
};

export const floatAnimationSlow: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-12, 12, -12],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  }
};

// Pulse animations
export const pulseSubtle: Variants = {
  initial: { opacity: 0.5, scale: 1 },
  animate: {
    opacity: [0.5, 0.7, 0.5],
    scale: [1, 1.02, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  }
};

// Slide animations
export const slideInFromBottom: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: premiumEase }
  }
};

export const slideInFromTop: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: premiumEase }
  }
};

// Page transition
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: premiumEase }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3, ease: premiumEase }
  }
};

// List item animation
export const listItem: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: premiumEase }
  }
};

// Icon animations
export const iconPop: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15,
    }
  }
};

// Glow pulse for CTAs
export const glowPulse = {
  boxShadow: [
    '0 0 20px rgba(13, 106, 81, 0.2)',
    '0 0 40px rgba(13, 106, 81, 0.3)',
    '0 0 20px rgba(13, 106, 81, 0.2)',
  ],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  }
};
