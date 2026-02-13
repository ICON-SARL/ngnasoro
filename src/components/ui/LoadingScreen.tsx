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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div 
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {showLogo && (
          <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center">
            <img 
              src={logoNgnaSoro} 
              alt="N'GNA SORO!" 
              className="w-14 h-14 object-contain rounded-full"
            />
          </div>
        )}
        
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#0D6A51]"
                animate={{ 
                  scale: [1, 1.4, 1],
                  opacity: [0.3, 1, 0.3]
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
          
          <p className="text-gray-500 text-xs font-medium tracking-[0.15em] uppercase">
            {message}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
