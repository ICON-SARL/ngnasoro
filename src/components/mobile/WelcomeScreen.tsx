
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-[#0D6A51] to-[#064335]">
      <div className="flex-1 flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">NGNA SÔRÔ</h1>
          <p className="text-lg opacity-80">Votre partenaire financier de confiance</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md mb-8 shadow-lg animate-scale-in">
          <h2 className="text-xl font-semibold mb-3">Bienvenue sur votre application</h2>
          <p className="opacity-90 mb-6">
            Accédez à vos comptes, effectuez des transactions et gérez vos prêts en toute simplicité.
          </p>
          
          <ul className="space-y-4 text-left mb-6">
            <li className="flex items-center transform hover:translate-x-1 transition-transform duration-200">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <CheckCircle className="h-4 w-4" />
              </div>
              <span>Gérez plusieurs comptes SFD</span>
            </li>
            <li className="flex items-center transform hover:translate-x-1 transition-transform duration-200">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <CheckCircle className="h-4 w-4" />
              </div>
              <span>Effectuez des transferts sécurisés</span>
            </li>
            <li className="flex items-center transform hover:translate-x-1 transition-transform duration-200">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <CheckCircle className="h-4 w-4" />
              </div>
              <span>Accédez à des microcrédits instantanés</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <Button 
          onClick={onStart}
          className="w-full py-6 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Commencer
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
