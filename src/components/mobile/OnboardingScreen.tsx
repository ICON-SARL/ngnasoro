import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Sparkles, Shield, Building2, ArrowRight, ChevronRight } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Sparkles,
    iconBg: 'from-amber-400 to-orange-500',
    title: "Bienvenue sur N'GNA SÔRÔ!",
    description: "Votre application de microfinance moderne. Gérez vos finances en toute simplicité.",
  },
  {
    icon: Shield,
    iconBg: 'from-emerald-400 to-teal-500',
    title: "Transactions sécurisées",
    description: "Vos données et transactions sont protégées avec les meilleurs standards de sécurité.",
  },
  {
    icon: Building2,
    iconBg: 'from-blue-400 to-indigo-500',
    title: "Accès simplifié aux prêts",
    description: "Demandez et suivez vos prêts directement depuis votre téléphone, où que vous soyez.",
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold && currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else if (info.offset.x > threshold && currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const currentData = slides[currentSlide];
  const Icon = currentData.icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-primary via-primary/95 to-primary/85">
      {/* Skip button */}
      {!isLastSlide && (
        <motion.button
          onClick={handleSkip}
          className="absolute top-safe-top right-4 mt-4 px-4 py-2 text-white/70 text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Passer
        </motion.button>
      )}

      {/* Main content */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-8 pt-16"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon with gradient background */}
            <motion.div
              className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${currentData.iconBg} flex items-center justify-center shadow-xl mb-10`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Icon className="w-12 h-12 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {currentData.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-white/70 text-base md:text-lg max-w-xs leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {currentData.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Bottom section */}
      <div className="px-8 pb-safe-bottom mb-8">
        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 bg-white' 
                  : 'w-2 bg-white/30'
              }`}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Action button */}
        <motion.button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold text-lg shadow-lg flex items-center justify-center gap-2 relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
          
          <span className="relative z-10">
            {isLastSlide ? 'Commencer' : 'Suivant'}
          </span>
          <ChevronRight className="w-5 h-5 relative z-10" />
        </motion.button>

        {/* Swipe hint on first slide */}
        {currentSlide === 0 && (
          <motion.p
            className="text-center text-white/50 text-sm mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Glissez pour naviguer
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;
