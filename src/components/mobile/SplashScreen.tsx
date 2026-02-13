import React from 'react';
import { motion } from 'framer-motion';

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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo - direct, sans médaillon */}
      <motion.img
        src="/lovable-uploads/LOGO_transprant_1763143001713.png"
        alt="N'GNA SÔRÔ!"
        className="w-[120px] h-[120px] object-contain"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Titre */}
      <motion.h1
        className="mt-5 text-3xl font-bold text-[#0D6A51] tracking-tight"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        N'GNA SÔRÔ!
      </motion.h1>

      {/* Sous-titre */}
      <motion.p
        className="mt-1.5 text-gray-400 text-sm tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        Votre partenaire financier
      </motion.p>

      {/* Barre de progression */}
      <motion.div
        className="absolute bottom-16 w-[60%] h-[2px] bg-gray-100 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="h-full bg-[#0D6A51] rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ delay: 1, duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
