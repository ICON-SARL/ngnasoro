import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import UltraSplashScreen from '@/components/mobile/UltraSplashScreen';

const RootLayout: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <UltraSplashScreen onComplete={handleSplashComplete} />;
  }

  return <Outlet />;
};

export default RootLayout;
