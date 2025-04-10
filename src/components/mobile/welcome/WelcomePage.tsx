
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface WelcomePageProps {
  onAction: (action: string, data?: any) => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onAction }) => {
  const navigate = useNavigate();

  const handleStart = () => {
    onAction('Start');
    navigate('/mobile-flow/main');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#f8fbfa] font-montserrat">
      <img 
        src="/logo.svg" 
        alt="N'gna sôrô Logo" 
        className="w-32 h-32 mb-8"
      />
      
      <h1 className="text-3xl font-bold text-[#0D6A51] mb-4">Bienvenue sur N'gna sôrô</h1>
      
      <p className="text-gray-600 mb-8 max-w-md">
        Votre application de gestion financière sécurisée pour les transactions avec les SFD.
      </p>
      
      <Button 
        onClick={handleStart}
        className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-white px-8 py-6 rounded-lg text-lg"
      >
        Commencer
      </Button>
    </div>
  );
};

export default WelcomePage;
