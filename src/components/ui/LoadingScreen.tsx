import React from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Chargement...', 
  showLogo = true 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary-dark">
      <motion.div 
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {showLogo && (
          <motion.div
            className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center"
            animate={{ 
              boxShadow: [
                '0 0 0 0 rgba(255,255,255,0.2)',
                '0 0 0 20px rgba(255,255,255,0)',
              ]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: 'easeOut'
            }}
          >
            <motion.img 
              src="/logo.png" 
              alt="N'GNA SORO!" 
              className="w-14 h-14 object-contain"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              onError={(e) => {
                // Fallback if logo doesn't exist
                e.currentTarget.style.display = 'none';
              }}
            />
          </motion.div>
        )}
        
        <div className="flex flex-col items-center gap-3">
          {/* Modern spinner */}
          <div className="relative w-10 h-10">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/20"
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-white"
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                ease: 'linear' 
              }}
            />
          </div>
          
          <motion.p 
            className="text-white/80 text-sm font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {message}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
