
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Home, Phone } from 'lucide-react';

interface PaymentTabContentProps {
  onBack: () => void;
}

const PaymentTabContent = ({ onBack }: PaymentTabContentProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <Button 
        variant="outline" 
        size="sm" 
        className="mb-4" 
        onClick={onBack}
      >
        &larr; Retour
      </Button>
      <h2 className="text-lg font-medium mb-4">Options de paiement</h2>
      
      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-md font-medium mb-4">Choisissez votre méthode</h3>
        <div className="space-y-3">
          <Button className="w-full justify-start bg-black hover:bg-gray-800">
            <CreditCard className="mr-2 h-4 w-4" />
            Compte SFD
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Phone className="mr-2 h-4 w-4" />
            Mobile Money
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            Paiement en agence
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentTabContent;
