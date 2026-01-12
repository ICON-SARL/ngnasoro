import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from '@/components/mobile/SplashScreen';
import OnboardingScreen from '@/components/mobile/OnboardingScreen';
import { Capacitor } from '@capacitor/core';

type OnboardingPhase = 'splash' | 'onboarding';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<OnboardingPhase>('splash');
  
  // Check if user has already seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (hasSeenOnboarding === 'true') {
      // Redirect based on platform
      const isNative = Capacitor.isNativePlatform();
      navigate(isNative ? '/auth' : '/landing', { replace: true });
    }
  }, [navigate]);

  const handleSplashComplete = () => {
    setPhase('onboarding');
  };

  const handleOnboardingComplete = () => {
    // Mark onboarding as seen
    localStorage.setItem('hasSeenOnboarding', 'true');
    
    // Redirect to auth page
    navigate('/auth', { replace: true });
  };

  return (
    <AnimatePresence mode="wait">
      {phase === 'splash' && (
        <SplashScreen key="splash" onComplete={handleSplashComplete} />
      )}
      {phase === 'onboarding' && (
        <OnboardingScreen key="onboarding" onComplete={handleOnboardingComplete} />
      )}
    </AnimatePresence>
  );
};

export default OnboardingPage;
