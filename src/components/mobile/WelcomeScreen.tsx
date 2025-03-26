
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="h-screen flex flex-col bg-[#0D6A51]">
      <div className="flex-1 flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">NGNA SÔRÔ</h1>
          <p className="text-lg opacity-80">Votre partenaire financier de confiance</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 w-full max-w-md mb-8">
          <h2 className="text-xl font-semibold mb-3">Bienvenue sur votre application</h2>
          <p className="opacity-90 mb-6">
            Accédez à vos comptes, effectuez des transactions et gérez vos prêts en toute simplicité.
          </p>
          
          <ul className="space-y-3 text-left mb-6">
            <li className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <ArrowRight className="h-3 w-3" />
              </div>
              <span>Gérez plusieurs comptes SFD</span>
            </li>
            <li className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <ArrowRight className="h-3 w-3" />
              </div>
              <span>Effectuez des transferts sécurisés</span>
            </li>
            <li className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <ArrowRight className="h-3 w-3" />
              </div>
              <span>Accédez à des microcrédits instantanés</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="p-6">
        <Button 
          onClick={onStart}
          className="w-full py-6 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl text-lg"
        >
          Commencer
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
