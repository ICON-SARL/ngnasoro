import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
    // Generate particles
    const newParticles = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);

    // Animation sequence
    const logoTimer = setTimeout(() => setShowLogo(true), 200);
    const textTimer = setTimeout(() => setShowText(true), 800);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    // Complete animation
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
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient opacity-50" />
      
      {/* Floating particles */}
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

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo with morphing animation */}
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
              {/* Logo container with glow effect */}
              <div className="relative">
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-white/50 blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                
                {/* Logo circle */}
                <motion.div
                  className="relative w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-2xl"
                  whileHover={{ scale: 1.05, rotateY: 180 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-4xl font-bold gradient-text">N'G</span>
                </motion.div>

                {/* Orbiting elements */}
                {[0, 120, 240].map((angle, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-white shadow-lg"
                    style={{
                      top: '50%',
                      left: '50%',
                    }}
                    animate={{
                      x: [
                        Math.cos((angle * Math.PI) / 180) * 60,
                        Math.cos(((angle + 360) * Math.PI) / 180) * 60,
                      ],
                      y: [
                        Math.sin((angle * Math.PI) / 180) * 60,
                        Math.sin(((angle + 360) * Math.PI) / 180) * 60,
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated text */}
        <AnimatePresence>
          {showText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <motion.h1 
                className="text-4xl font-bold text-white mb-2"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                style={{
                  background: 'linear-gradient(90deg, #ffffff, #10B981, #34D399, #ffffff)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              >
                N'GNA SÔRÔ
              </motion.h1>
              <p className="text-white/80 text-sm">Votre partenaire microfinance</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Circular progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          className="relative w-24 h-24"
        >
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="rgba(255,255,255,0.2)"
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
              strokeDasharray={276}
              strokeDashoffset={276 - (276 * progress) / 100}
              transition={{ duration: 0.1 }}
            />
          </svg>
          
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-lg font-bold">{Math.round(progress)}%</span>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default UltraSplashScreen;
