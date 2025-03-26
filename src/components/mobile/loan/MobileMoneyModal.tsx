
import React from 'react';
import { Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileMoneyModalProps {
  onClose: () => void;
  isWithdrawal?: boolean;
}

const MobileMoneyModal = ({ onClose, isWithdrawal = false }: MobileMoneyModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-5 m-4 max-w-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Smartphone className="h-8 w-8 text-yellow-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">
            {isWithdrawal ? "Retrait Mobile Money" : "Paiement Mobile Money"}
          </h3>
          <p className="text-gray-500 mb-4">
            {isWithdrawal 
              ? "Un SMS avec un code de confirmation a été envoyé à votre numéro de téléphone. Veuillez confirmer la transaction sur votre téléphone pour recevoir les fonds."
              : "Un SMS avec un code de confirmation a été envoyé à votre numéro de téléphone. Veuillez suivre les instructions pour finaliser le paiement."
            }
          </p>
          <Button onClick={onClose} className="w-full">
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileMoneyModal;
