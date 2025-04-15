
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#0D6A51]/10 to-white">
      <div className="w-full max-w-md text-center">
        <div className="rounded-full bg-[#0D6A51]/10 p-6 w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-[#0D6A51]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-3 text-gray-900">Bienvenue sur MEREF</h1>
        <p className="text-gray-600 mb-8">
          Votre plateforme financière pour gérer vos prêts et épargnes avec les SFDs au Mali.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={onStart}
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 h-12 text-lg"
          >
            Commencer
          </Button>
          
          <div className="flex justify-center gap-4 mt-6">
            <Button 
              variant="outline" 
              className="text-sm"
              onClick={() => navigate('/auth')}
            >
              Se connecter
            </Button>
            <Button 
              variant="outline" 
              className="text-sm"
              onClick={() => navigate('/register')}
            >
              S'inscrire
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
