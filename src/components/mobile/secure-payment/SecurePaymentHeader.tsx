
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

interface SecurePaymentHeaderProps {
  onBack: () => void;
}

export const SecurePaymentHeader: React.FC<SecurePaymentHeaderProps> = ({ onBack }) => {
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="mb-4" 
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Retour
      </Button>
      
      <div className="flex items-center mb-4">
        <Shield className="h-5 w-5 mr-2 text-[#0D6A51]" />
        <h2 className="text-lg font-medium">Paiement Sécurisé</h2>
      </div>
    </>
  );
};
