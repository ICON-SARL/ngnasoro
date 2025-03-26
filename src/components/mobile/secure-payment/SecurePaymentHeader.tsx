
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Info } from 'lucide-react';

interface SecurePaymentHeaderProps {
  onBack: () => void;
}

export const SecurePaymentHeader: React.FC<SecurePaymentHeaderProps> = ({ onBack }) => {
  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4 text-white" 
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Retour
      </Button>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-lime-300" />
          <h2 className="text-lg font-medium text-white">Paiement Sécurisé Multi-SFD</h2>
        </div>
        <Button variant="ghost" size="sm" className="p-1 text-white">
          <Info className="h-4 w-4 text-lime-300" />
        </Button>
      </div>
    </>
  );
};
