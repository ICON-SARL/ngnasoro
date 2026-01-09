// Premium Design Tokens - Soft & Modern
export const spacing = {
  sectionPy: 'py-24 md:py-32',
  cardPadding: 'p-6 md:p-8',
  largeCardPadding: 'p-8 md:p-10',
  containerPx: 'px-4 sm:px-6 lg:px-8',
};

export const borderRadius = {
  card: 'rounded-3xl',
  button: 'rounded-2xl',
  icon: 'rounded-xl',
  input: 'rounded-xl',
};

export const animations = {
  duration: {
    fast: 0.2,
    normal: 0.4,
    slow: 0.6,
    premium: 0.8,
  },
  spring: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 15,
    mass: 1,
  },
  smoothSpring: {
    type: 'spring' as const,
    stiffness: 150,
    damping: 20,
    mass: 0.8,
  },
  premiumSpring: {
    type: 'spring' as const,
    stiffness: 80,
    damping: 12,
    mass: 1.2,
  },
  smooth: {
    ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  },
  premium: {
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
};

export const shadows = {
  soft: {
    xs: '0 2px 8px -2px rgba(0, 0, 0, 0.04)',
    sm: '0 4px 16px -4px rgba(0, 0, 0, 0.06)',
    md: '0 8px 32px -8px rgba(0, 0, 0, 0.08)',
    lg: '0 16px 48px -12px rgba(0, 0, 0, 0.1)',
    xl: '0 24px 64px -16px rgba(0, 0, 0, 0.12)',
  },
  glow: {
    primary: '0 0 40px -10px hsl(var(--primary) / 0.3)',
    accent: '0 0 40px -10px hsl(var(--accent) / 0.4)',
    white: '0 0 60px -15px rgba(255, 255, 255, 0.4)',
  },
  card: 'shadow-soft-md',
  cardHover: 'hover:shadow-soft-lg',
};

export const backgrounds = {
  glass: 'bg-white/60 backdrop-blur-2xl border border-white/30',
  glassCard: 'bg-white/70 backdrop-blur-3xl border border-white/40',
  glassDark: 'bg-black/20 backdrop-blur-2xl border border-white/10',
  gradient: 'bg-gradient-to-b from-[#0D6A51] via-[#0D6A51]/80 via-50% to-slate-50',
  gradientSubtle: 'bg-gradient-to-br from-slate-50 via-white to-emerald-50/30',
  gradientPremium: 'bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30',
};

export const typography = {
  hero: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
  title: 'text-2xl md:text-3xl font-semibold tracking-tight',
  subtitle: 'text-lg md:text-xl text-muted-foreground',
  body: 'text-base text-foreground/80',
  small: 'text-sm text-muted-foreground',
};

// Premium transition presets
export const transitions = {
  default: 'transition-all duration-400 ease-out',
  fast: 'transition-all duration-200 ease-out',
  slow: 'transition-all duration-600 ease-out',
  premium: 'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
};
