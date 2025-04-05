
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SfdAccount } from '@/hooks/useSfdAccounts';
import { formatCurrencyAmount } from '@/utils/transactionUtils';

interface PaymentDetailsProps {
  isWithdrawal: boolean;
  amount: number;
  progress: number;
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  selectedSfdAccount?: SfdAccount | null;
  onAmountChange?: (amount: number) => void;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  isWithdrawal,
  amount,
  progress,
  paymentStatus,
  selectedSfdAccount,
  onAmountChange
}) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value.replace(/[^0-9]/g, ''));
    if (!isNaN(value) && onAmountChange) {
      onAmountChange(value);
    }
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-2">
      <h2 className="font-bold mb-1">
        {isWithdrawal ? "Détails du retrait" : "Détails du remboursement"}
      </h2>
      
      {selectedSfdAccount && (
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Compte:</span>
          <span>{selectedSfdAccount.name || 'SFD Bamako Principal'}</span>
        </div>
      )}
      
      {selectedSfdAccount && (
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Disponible:</span>
          <span>{formatCurrencyAmount(selectedSfdAccount.balance)} {selectedSfdAccount.currency || 'FCFA'}</span>
        </div>
      )}
      
      <div className="mb-3">
        <Label htmlFor="transaction-amount" className="text-gray-600">
          {isWithdrawal ? "Montant du retrait:" : "Montant dû:"}
        </Label>
        
        <Input
          id="transaction-amount"
          type="text"
          value={amount ? amount.toLocaleString() + ' FCFA' : '0 FCFA'}
          onChange={handleAmountChange}
          className="font-bold mt-1 text-lg"
          disabled={paymentStatus === 'pending' || !onAmountChange}
        />
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
