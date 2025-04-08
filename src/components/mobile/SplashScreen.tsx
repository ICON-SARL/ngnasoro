
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onFinished: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinished();
    }, 2500);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onFinished]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0D6A51] to-[#064335] z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="relative mb-10"
      >
        <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-2xl">
          <img 
            src="/lovable-uploads/2941965d-fd44-4815-bb4a-2c77549e1380.png" 
            alt="N'GNA SÔRÔ! Logo" 
            className="h-24 w-24 object-contain"
          />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1.2 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute -bottom-3 -right-3 bg-amber-500 rounded-full p-2 shadow-lg"
        >
          <div className="h-6 w-6 bg-white rounded-full flex items-center justify-center">
            <span className="text-amber-500 text-xs font-bold">GO</span>
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          <span className="text-amber-400">N'GNA</span> SÔRÔ!
        </h1>
        <p className="text-white/80 text-lg">Votre partenaire financier</p>
      </motion.div>
      
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "80%" }}
        transition={{ delay: 0.6 }}
        className="w-4/5 max-w-md relative h-1 bg-white/20 rounded-full overflow-hidden mb-6"
      >
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          className="absolute top-0 left-0 h-full bg-amber-400 rounded-full"
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.7 }}
        className="flex items-center text-white/60 text-sm"
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        <span>Chargement...</span>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
