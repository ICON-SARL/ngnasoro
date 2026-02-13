import React from 'react';
import { motion } from 'framer-motion';

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
          <img 
            src="/lovable-uploads/LOGO_transprant_1763143001713.png" 
            alt="N'GNA SORO!" 
            className="w-[100px] h-[100px] object-contain"
          />
        )}
        
        <div className="flex flex-col items-center gap-3">
          <div className="w-[120px] h-[2px] bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full w-[40%] bg-[#0D6A51] rounded-full"
              animate={{ x: ['-100%', '300%'] }}
              transition={{ 
                duration: 1.2, 
                repeat: Infinity, 
                ease: 'easeInOut'
              }}
            />
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
