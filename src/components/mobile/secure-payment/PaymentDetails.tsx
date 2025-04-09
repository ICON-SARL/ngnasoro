
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { SfdAccount } from '@/hooks/sfd/types';

interface PaymentDetailsProps {
  isWithdrawal: boolean;
  amount: number;
  progress: number;
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  selectedSfdAccount?: SfdAccount | null;
  onAmountChange: (amount: number) => void;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  isWithdrawal,
  amount,
  progress,
  paymentStatus,
  selectedSfdAccount,
  onAmountChange
}) => {
  return (
    <>
      <div className="bg-blue-50 p-4 rounded-lg mb-2">
        <h2 className="font-bold mb-1">
          {isWithdrawal ? "Détails du retrait" : "Détails du paiement"}
        </h2>
        {isWithdrawal ? (
          <>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Compte:</span>
              <span>{selectedSfdAccount?.name || 'Compte SFD'}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Disponible:</span>
              <span>{selectedSfdAccount?.balance?.toLocaleString() || '0'} FCFA</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Service:</span>
              <span>{isWithdrawal ? 'Retrait' : 'Remboursement'}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Frais:</span>
              <span>0 FCFA</span>
            </div>
          </>
        )}
        
        <div className="mt-2">
          <label htmlFor="amount" className="block text-sm font-medium mb-1">
            {isWithdrawal ? "Montant du retrait" : "Montant"}
          </label>
          <Input 
            id="amount" 
            type="number" 
            value={amount} 
            onChange={(e) => onAmountChange(parseFloat(e.target.value))}
            className="border-0 bg-white shadow-sm"
            disabled={paymentStatus === 'pending'}
          />
        </div>
      </div>
      
      {paymentStatus === 'pending' && (
        <div className="space-y-2 my-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-center text-gray-600">
            {isWithdrawal 
              ? "Traitement de votre retrait..." 
              : "Traitement de votre paiement..."
            }
          </p>
        </div>
      )}
    </>
  );
};

export default PaymentDetails;
