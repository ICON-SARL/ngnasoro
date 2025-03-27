
import React from 'react';
import { CreditCard } from 'lucide-react';
import IconographicUI from '../IconographicUI';
import RealTimeSavingsWidget from '../RealTimeSavingsWidget';

const StepStart: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-[#0D6A51]/10 flex items-center justify-center mb-4">
          <CreditCard className="h-12 w-12 text-[#0D6A51]" />
        </div>
        <h3 className="text-xl font-bold text-center">Bienvenue dans l'assistant de prêt</h3>
        <p className="text-gray-500 text-center mt-2">
          Obtenez un prêt en quelques étapes simples avec votre compte SFD
        </p>
      </div>
      
      <IconographicUI />
      <div className="mt-6">
        <RealTimeSavingsWidget />
      </div>
    </div>
  );
};

export default StepStart;
