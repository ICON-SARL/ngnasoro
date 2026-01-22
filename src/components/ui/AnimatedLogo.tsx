import React from 'react';
import { motion } from 'framer-motion';
import logo from '@/assets/ngna-soro-logo.png';

interface AnimatedLogoProps {
  size?: number;
  withGlow?: boolean;
  withPulse?: boolean;
  className?: string;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  size = 80,
  withGlow = true,
  withPulse = true,
  className = '',
}) => {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* Glow effect */}
      {withGlow && (
        <motion.div
          className="absolute inset-0 rounded-full blur-xl opacity-50"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
          }}
          animate={withPulse ? {
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Logo with 3D rotation on hover */}
      <motion.img
        src={logo}
        alt="N'GNA SÔRÔ Logo"
        style={{ width: size, height: size }}
        className="relative z-10 drop-shadow-2xl"
        whileHover={{
          rotateY: 15,
          rotateX: 5,
          scale: 1.05,
        }}
        transition={{ duration: 0.3 }}
      />

    </motion.div>
  );
};
