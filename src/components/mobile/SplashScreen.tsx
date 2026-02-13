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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
      >
        <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center">
          <img 
            src={logo} 
            alt="N'GNA SÔRÔ!" 
            className="w-16 h-16 object-contain rounded-full"
          />
        </div>
      </motion.div>

      {/* App name */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h1 className="text-2xl font-bold text-[#0D6A51] tracking-tight">
          N'GNA SÔRÔ!
        </h1>
        <motion.p
          className="mt-1.5 text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Votre partenaire financier
        </motion.p>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        className="absolute bottom-20 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-[#0D6A51]"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
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
