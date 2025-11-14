import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ModernSplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export const ModernSplashScreen: React.FC<ModernSplashScreenProps> = ({
  onComplete,
  duration = 3500,
}) => {
  const [progress, setProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Logo animation
    setTimeout(() => setShowLogo(true), 100);
    
    // Text animation
    setTimeout(() => setShowText(true), 800);
    
    // Progress animation
    setTimeout(() => setShowProgress(true), 1500);
    
    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Complete animation
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [duration, onComplete, navigate]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary via-accent to-primary overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative h-full flex flex-col items-center justify-center p-8">
        {/* Logo with morph animation */}
        <AnimatePresence>
          {showLogo && (
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
                duration: 0.8,
              }}
              className="relative mb-8"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255,255,255,0.3)',
                    '0 0 60px rgba(255,255,255,0.6)',
                    '0 0 20px rgba(255,255,255,0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 rounded-3xl bg-white flex items-center justify-center"
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">N'G</span>
                </div>
              </motion.div>

              {/* Orbiting particles */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-yellow-300 rounded-full"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                    marginLeft: -6,
                    marginTop: -6,
                    transformOrigin: `${50 + i * 10}px ${50 + i * 10}px`,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* App name with gradient animation */}
        <AnimatePresence>
          {showText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-4"
            >
              <motion.h1
                className="text-5xl font-bold text-white mb-2"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                N'GNA SÔRÔ
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-white/90"
              >
                Votre partenaire financier
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modern circular progress */}
        <AnimatePresence>
          {showProgress && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mt-12"
            >
              <div className="relative w-24 h-24">
                {/* Background circle */}
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <motion.circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="white"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: progress / 100 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      strokeDasharray: '251.2',
                      strokeDashoffset: 251.2 * (1 - progress / 100),
                    }}
                  />
                </svg>

                {/* Percentage text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    key={progress}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-white"
                  >
                    {Math.round(progress)}%
                  </motion.span>
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-white/80 mt-4 text-sm"
              >
                Chargement...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModernSplashScreen;
