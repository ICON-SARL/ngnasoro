
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { QrCode, Scan } from 'lucide-react';

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
            Scannez le code QR affiché par l'agent SFD pour {isWithdrawal ? 'effectuer votre retrait' : 'effectuer votre paiement'}.
          </p>
          <p>
            Rendez-vous en agence SFD et demandez à l'agent d'afficher un code QR pour votre {isWithdrawal ? 'retrait' : 'paiement'}.
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
              Traitement en cours...
            </>
          ) : (
            <>
              <Scan className="h-4 w-4" />
              Scanner code QR pour {isWithdrawal ? 'retrait' : 'paiement'}
            </>
          )}
        </Button>
      </div>
      
      <div className="text-sm text-gray-500">
        <p>Le scanner QR permet de valider votre {isWithdrawal ? 'retrait' : 'paiement'} rapidement et en toute sécurité.</p>
      </div>
    </div>
  );
};
