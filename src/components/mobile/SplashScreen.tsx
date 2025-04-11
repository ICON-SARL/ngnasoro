
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete,
  duration = 3000 
}) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);
    
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate('/mobile-flow/welcome');
      }
    }, duration);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete, navigate, duration]);
  
  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="relative h-full w-full bg-gradient-to-b from-[#0D6A51] to-[#064335] flex flex-col items-center justify-center px-6">
        {/* Logo container with animation */}
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
            <img 
              src="/lovable-uploads/2941965d-fd44-4815-bb4a-2c77549e1380.png" 
              alt="N'GNA SÔRÔ! Logo" 
              className="h-24 w-24 object-contain"
            />
          </div>
        </motion.div>
        
        {/* App name with animation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-1">NGNA SÔRÔ</h1>
          <p className="text-white/80">Votre partenaire financier</p>
        </motion.div>
        
        {/* Progress bar */}
        <motion.div
          initial={{ width: "90%", opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="w-[90%] max-w-md bg-white/20 rounded-full h-2 mb-4"
        >
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
            className="bg-amber-500 h-2 rounded-full"
          />
        </motion.div>
        
        {/* Features list */}
        <div className="mt-8 w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="flex items-center text-white mb-3"
          >
            <CheckCircle className="h-5 w-5 mr-2 text-amber-300" />
            <span className="text-sm">Accès sécurisé à vos comptes</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.9 }}
            className="flex items-center text-white mb-3"
          >
            <CheckCircle className="h-5 w-5 mr-2 text-amber-300" />
            <span className="text-sm">Transferts rapides et sécurisés</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 1.1 }}
            className="flex items-center text-white"
          >
            <CheckCircle className="h-5 w-5 mr-2 text-amber-300" />
            <span className="text-sm">Demandes de microcrédits simplifiées</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
