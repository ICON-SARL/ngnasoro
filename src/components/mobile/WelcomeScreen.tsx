import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Shield, Sparkles, ChevronRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const handleStart = () => {
    // Haptic feedback si supporté
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    onStart();
  };

  return (
    <div className="relative h-screen flex flex-col overflow-hidden bg-gradient-to-br from-[#0D6A51] via-[#0a5744] to-[#064335]">
      {/* Background animated layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(252,176,65,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(252,176,65,0.1),transparent_50%)]" />
      
      {/* Animated particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/10 rounded-full blur-sm"
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center text-white p-6 text-center z-10">
        {/* Logo with glassmorphism and rings */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative w-32 h-32 mb-8"
        >
          {/* Animated rings */}
          <motion.div
            className="absolute inset-0 border-2 border-white/20 rounded-full"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 border-2 border-white/10 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
          />
          
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
            animate={{ x: [-150, 150] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          
          {/* Logo container */}
          <div className="relative w-full h-full bg-white/20 backdrop-blur-xl rounded-full border-2 border-white/30 shadow-2xl flex items-center justify-center">
            <img 
              src="/lovable-uploads/2941965d-fd44-4815-bb4a-2c77549e1380.png" 
              alt="N'GNA SÔRÔ! Logo" 
              className="w-24 h-24 object-contain"
            />
          </div>
        </motion.div>
        
        {/* Title with animated gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10 space-y-2"
        >
          <h1 className="text-5xl font-black bg-gradient-to-r from-white via-amber-100 to-white bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x">
            NGNA SÔRÔ
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg font-light text-white/90 tracking-wide"
          >
            Votre partenaire financier de confiance
          </motion.p>
        </motion.div>
        
        {/* Features card with premium glassmorphism */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative w-full max-w-md mb-10"
        >
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-pink-500/20 rounded-3xl blur-2xl" />
          
          {/* Card content */}
          <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2 text-white">
              Bienvenue sur votre application
            </h2>
            <p className="text-white/80 mb-6 text-sm">
              Accédez à vos comptes, effectuez des transactions et gérez vos prêts en toute simplicité.
            </p>
            
            {/* Features list */}
            <div className="space-y-4">
              {[
                { icon: Building2, text: 'Gérez plusieurs comptes SFD', gradient: 'from-blue-400 to-cyan-400' },
                { icon: Shield, text: 'Effectuez des transferts sécurisés', gradient: 'from-emerald-400 to-teal-400' },
                { icon: Sparkles, text: 'Accédez à des microcrédits instantanés', gradient: 'from-amber-400 to-orange-400' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  {/* Icon with gradient */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Text */}
                  <span className="text-white font-medium text-base flex-1">
                    {feature.text}
                  </span>
                  
                  {/* Arrow indicator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-5 h-5 text-white/50" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Premium CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative px-6 pb-8 z-10"
      >
        <motion.button
          onClick={handleStart}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
          whileTap={{ scale: 0.98 }}
          className="relative w-full py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_auto] rounded-2xl text-white font-bold text-lg shadow-2xl overflow-hidden group"
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: [-200, 200] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
          
          {/* Button content */}
          <span className="relative flex items-center justify-center gap-3">
            <span>Commencer</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowRight className="w-6 h-6" />
            </motion.div>
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
