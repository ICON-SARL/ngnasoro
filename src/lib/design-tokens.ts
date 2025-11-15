export const spacing = {
  sectionPy: 'py-24',
  cardPadding: 'p-6',
  largeCardPadding: 'p-8',
  containerPx: 'px-4 sm:px-6 lg:px-8',
};

export const borderRadius = {
  card: 'rounded-2xl',
  button: 'rounded-xl',
  icon: 'rounded-xl',
};

export const animations = {
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
  },
  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
  },
  smoothSpring: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 20,
  },
  smooth: {
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
};

export const shadows = {
  card: 'shadow-xl',
  cardHover: 'hover:shadow-2xl',
};

export const backgrounds = {
  glass: 'bg-white/80 backdrop-blur-xl border border-white/20',
  glassCard: 'bg-white/90 backdrop-blur-2xl',
  gradient: 'bg-gradient-to-br from-[#0D6A51] to-[#176455]',
};
