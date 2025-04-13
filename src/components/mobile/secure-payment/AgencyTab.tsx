
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { QrCode } from 'lucide-react';

interface AgencyTabProps {
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  handlePayment: () => void;
  isWithdrawal?: boolean;
}

export const AgencyTab: React.FC<AgencyTabProps> = ({ 
  paymentStatus, 
  handlePayment,
  isWithdrawal = false
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Paiement en agence SFD</h3>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg text-sm">
          <p className="mb-2">
            Générez un code QR à présenter à l'agent SFD pour {isWithdrawal ? 'effectuer votre retrait' : 'effectuer votre paiement'}.
          </p>
          <p>
            Ce code sera valide pendant 15 minutes et pourra être scanné par l'agent SFD.
          </p>
        </div>
        
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2" 
          onClick={handlePayment} 
          disabled={paymentStatus === 'pending'}
        >
          {paymentStatus === 'pending' ? (
            <>
              <Loader size="sm" className="mr-2" />
              Génération en cours...
            </>
          ) : (
            <>
              <QrCode className="h-4 w-4" />
              Générer code QR pour {isWithdrawal ? 'retrait' : 'paiement'}
            </>
          )}
        </Button>
      </div>
      
      <div className="text-sm text-gray-500">
        <p>Le code QR peut être scanné par l'agent SFD en agence pour effectuer votre {isWithdrawal ? 'retrait' : 'paiement'}.</p>
      </div>
    </div>
  );
};
