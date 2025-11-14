export const buttonTap = {
  scale: 0.95,
  transition: { duration: 0.1 },
};

export const cardHover = {
  y: -5,
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  transition: { duration: 0.2 },
};

export const iconBounce = {
  scale: [1, 1.2, 1],
  transition: {
    duration: 0.3,
    ease: [0.68, -0.55, 0.265, 1.55],
  },
};

export const shakeAnimation = {
  x: [0, -10, 10, -10, 10, 0],
  transition: { duration: 0.4 },
};

export const successPulse = {
  scale: [1, 1.1, 1],
  opacity: [1, 0.8, 1],
  transition: {
    duration: 0.5,
    repeat: 2,
  },
};

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const itemFadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
};
