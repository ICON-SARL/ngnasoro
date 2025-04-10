
import React from 'react';
import WelcomeScreen from '@/components/mobile/WelcomeScreen';

interface WelcomePageProps {
  onAction: (action: string, data?: any) => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onAction }) => {
  const handleStart = () => {
    onAction('Start');
  };

  return (
    <div className="min-h-screen">
      <WelcomeScreen onStart={handleStart} />
    </div>
  );
};

export default WelcomePage;
