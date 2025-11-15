import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WelcomeStep } from './WelcomeStep';
import { FeaturesCarousel } from './FeaturesCarousel';
import { SfdSelectionStep } from './SfdSelectionStep';
import { AccountCreationStep } from './AccountCreationStep';
import { SecuritySetupStep } from './SecuritySetupStep';
import { pageVariants } from '@/utils/animations/pageTransitions';

export const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    { id: 'welcome', component: WelcomeStep },
    { id: 'features', component: FeaturesCarousel },
    { id: 'sfd-selection', component: SfdSelectionStep },
    { id: 'account-creation', component: AccountCreationStep },
    { id: 'security', component: SecuritySetupStep },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete
      navigate('/mobile-flow/dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate('/mobile-flow/dashboard');
  };

  const CurrentStepComponent = steps[currentStep].component;

  const stepProps = {
    onNext: handleNext,
    ...(currentStep > 0 && { onPrevious: handlePrevious }),
    onSkip: handleSkip,
  };

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gray-100 z-50 shadow-sm">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-accent to-primary relative overflow-hidden"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="absolute inset-0 animate-shimmer" 
               style={{
                 background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                 animation: 'shimmer 2s infinite'
               }} />
        </motion.div>
      </div>

      {/* Skip button */}
      {currentStep < steps.length - 1 && (
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-50 text-muted-foreground hover:text-foreground smooth-transition px-4 py-2"
        >
          Passer
        </button>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          className="h-full"
        >
          <CurrentStepComponent {...stepProps} />
        </motion.div>
      </AnimatePresence>

      {/* Step indicators */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2.5 z-50 px-4">
        {steps.map((_, index) => (
          <motion.div
            key={index}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentStep
                ? 'bg-gradient-to-r from-primary to-accent shadow-lg'
                : index < currentStep
                ? 'bg-primary/40'
                : 'bg-gray-200'
            }`}
            initial={false}
            animate={{
              width: index === currentStep ? 40 : 10,
              scale: index === currentStep ? 1.1 : 1,
            }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
        ))}
      </div>
    </div>
  );
};

export default OnboardingFlow;
