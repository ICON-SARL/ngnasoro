import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModernButton } from '@/components/ui/modern-button';
import { CreditCard, PiggyBank, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturesCarouselProps {
  onNext: () => void;
  onPrevious?: () => void;
}

const features = [
  {
    icon: CreditCard,
    title: 'Prêts instantanés',
    description: 'Obtenez un prêt rapidement avec des conditions avantageuses',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: PiggyBank,
    title: 'Épargne sécurisée',
    description: 'Faites fructifier votre argent en toute sécurité',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: TrendingUp,
    title: 'Suivi en temps réel',
    description: 'Consultez vos transactions et votre solde à tout moment',
    color: 'from-purple-500 to-pink-500',
  },
];

export const FeaturesCarousel: React.FC<FeaturesCarouselProps> = ({
  onNext,
  onPrevious,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevSlide = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : features.length - 1));
  };

  const handleNextSlide = () => {
    if (currentIndex < features.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onNext();
    }
  };

  const currentFeature = features[currentIndex];
  const Icon = currentFeature.icon;

  return (
    <div className="h-full flex flex-col items-center justify-between p-8">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-8"
            >
              <div className={`w-40 h-40 mx-auto rounded-3xl bg-gradient-to-br ${currentFeature.color} flex items-center justify-center shadow-2xl`}>
                <Icon className="w-20 h-20 text-white" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-4"
            >
              {currentFeature.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground"
            >
              {currentFeature.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center gap-2">
          {features.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary w-8'
                  : 'bg-muted w-2'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-4">
          {currentIndex > 0 && (
            <ModernButton
              variant="ghost"
              size="lg"
              onClick={handlePrevSlide}
              className="flex-1"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Précédent
            </ModernButton>
          )}
          <ModernButton
            variant="primary"
            size="lg"
            onClick={handleNextSlide}
            className="flex-1"
          >
            {currentIndex === features.length - 1 ? 'Continuer' : 'Suivant'}
            <ChevronRight className="w-5 h-5 ml-2" />
          </ModernButton>
        </div>
      </div>
    </div>
  );
};
