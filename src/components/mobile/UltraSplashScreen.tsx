import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';

interface UltraSplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

const UltraSplashScreen: React.FC<UltraSplashScreenProps> = ({ 
  onComplete,
  duration = 3500 
}) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [particles, setParticles] = useState<Array<{ x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);

    const logoTimer = setTimeout(() => setShowLogo(true), 200);
    const textTimer = setTimeout(() => setShowText(true), 800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    const completeTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate('/auth-selector');
      }
    }, duration);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
      clearTimeout(completeTimer);
      clearInterval(progressInterval);
    };
  }, [duration, navigate, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-accent to-primary animate-gradient">
      <div className="absolute inset-0 mesh-gradient opacity-50" />
      
      <div className="absolute inset-0">
        {particles.map((particle, index) => (
          <motion.div
            key={index}
            className="absolute w-2 h-2 rounded-full bg-white/30"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-8">
        <AnimatePresence>
          {showLogo && (
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ 
                duration: 0.8,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="relative"
            >
              <AnimatedLogo size={140} withGlow withPulse />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/90 text-xl font-medium"
              >
                Microfinance digitale
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="relative w-24 h-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="4"
              fill="none"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="44"
              stroke="white"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progress) / 100}
              style={{
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-lg font-bold">{Math.round(progress)}%</span>
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/30 pointer-events-none" />

      <style>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }

        .mesh-gradient {
          background-image: 
            radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.3) 0px, transparent 50%),
            radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.3) 0px, transparent 50%),
            radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.3) 0px, transparent 50%),
            radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 0.3) 0px, transparent 50%),
            radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 0.3) 0px, transparent 50%),
            radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 0.3) 0px, transparent 50%),
            radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 0.3) 0px, transparent 50%);
          animation: gradient 15s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default UltraSplashScreen;
