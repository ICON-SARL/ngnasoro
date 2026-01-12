import React from 'react';
import { motion } from 'framer-motion';
import logo from '@/assets/ngna-soro-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-primary via-primary/90 to-primary/80"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Subtle background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Animated rings behind logo */}
      <div className="relative">
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute inset-0 rounded-full border border-white/20"
            style={{
              width: 120 + ring * 40,
              height: 120 + ring * 40,
              left: `calc(50% - ${(120 + ring * 40) / 2}px)`,
              top: `calc(50% - ${(120 + ring * 40) / 2}px)`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: [0, 0.3, 0] }}
            transition={{
              duration: 2,
              delay: 0.3 + ring * 0.2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        ))}

        {/* Logo */}
        <motion.div
          className="relative z-10"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            delay: 0.2,
          }}
        >
          <motion.div
            className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center shadow-2xl"
            animate={{
              boxShadow: [
                '0 0 20px rgba(255,255,255,0.2)',
                '0 0 40px rgba(255,255,255,0.3)',
                '0 0 20px rgba(255,255,255,0.2)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <img 
              src={logo} 
              alt="N'GNA SÔRÔ!" 
              className="w-20 h-20 object-contain"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* App name */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">
          N'GNA SÔRÔ!
        </h1>
        <motion.p
          className="mt-2 text-white/70 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Votre partenaire financier
        </motion.p>
      </motion.div>

      {/* Loading indicator */}
      <motion.div
        className="absolute bottom-20 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-white/50"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
