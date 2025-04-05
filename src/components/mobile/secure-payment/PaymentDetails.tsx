
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { SfdAccount } from '@/hooks/useSfdAccounts';
import { formatCurrencyAmount } from '@/utils/transactionUtils';

interface PaymentDetailsProps {
  isWithdrawal: boolean;
  amount: number;
  progress: number;
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  selectedSfdAccount?: SfdAccount | null;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ 
  isWithdrawal, 
  amount, 
  progress, 
  paymentStatus,
  selectedSfdAccount
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg mb-2">
        <h2 className="font-bold mb-1">
          {isWithdrawal ? "Détails du retrait" : "Détails du remboursement"}
        </h2>
        {isWithdrawal ? (
          <>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Compte:</span>
              <span>{selectedSfdAccount?.name || "SFD Bamako Principal"}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Disponible:</span>
              <span>{selectedSfdAccount ? formatCurrencyAmount(selectedSfdAccount.balance) : "198 500"} FCFA</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Prêt:</span>
              <span>{selectedSfdAccount?.name || "Microfinance Bamako"}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Échéance:</span>
              <span>10 Juillet 2023</span>
            </div>
          </>
        )}
        <div className="flex justify-between text-lg font-bold">
          <span>{isWithdrawal ? "Montant du retrait:" : "Montant dû:"}</span>
          <span>{formatCurrencyAmount(amount)}</span>
        </div>
      </div>
      
      {paymentStatus === 'pending' && (
        <div className="space-y-2 my-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-center text-gray-600">
            {isWithdrawal 
              ? "Traitement de votre retrait..." 
              : "Traitement de votre remboursement..."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentDetails;
