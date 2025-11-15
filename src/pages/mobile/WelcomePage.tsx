import React from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeScreen from '@/components/mobile/WelcomeScreen';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    localStorage.setItem('hasVisitedApp', 'true');
    navigate('/mobile-flow/dashboard', { replace: true });
  };

  return <WelcomeScreen onStart={handleStart} />;
};

export default WelcomePage;
