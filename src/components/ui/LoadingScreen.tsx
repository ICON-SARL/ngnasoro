import React from 'react';
import { motion } from 'framer-motion';
import logoNgnaSoro from '@/assets/ngna-soro-logo.png';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Chargement', 
  showLogo = true 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D6A51] via-[#0B5A44] to-[#094A3A]">
      <motion.div 
        className="flex flex-col items-center gap-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {showLogo && (
          <motion.div
            className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center"
            animate={{ 
              boxShadow: [
                '0 0 0 0 rgba(255,255,255,0.15)',
                '0 0 0 20px rgba(255,255,255,0)',
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          >
            <img 
              src={logoNgnaSoro} 
              alt="N'GNA SORO!" 
              className="w-14 h-14 object-contain rounded-xl"
            />
          </motion.div>
        )}
        
        <div className="flex flex-col items-center gap-4">
          {/* 3-dot loading animation */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-white/80"
                animate={{ 
                  scale: [1, 1.4, 1],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity, 
                  delay: i * 0.15,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
          
          <p className="text-white/70 text-xs font-medium tracking-[0.15em] uppercase">
            {message}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
