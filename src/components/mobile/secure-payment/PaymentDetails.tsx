
import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';
import { SfdAccount } from '@/hooks/useSfdAccounts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaymentDetailsProps {
  isWithdrawal?: boolean;
  amount: number;
  progress?: number;
  paymentStatus?: 'pending' | 'success' | 'failed' | null;
  selectedSfdAccount?: SfdAccount | null;
  onAmountChange?: (amount: number) => void;
}

const PaymentDetails = ({ 
  isWithdrawal = false, 
  amount, 
  progress = 0,
  paymentStatus,
  selectedSfdAccount,
  onAmountChange
}: PaymentDetailsProps) => {
  const [amountValue, setAmountValue] = useState(amount.toString());

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setAmountValue(value);
    
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && onAmountChange) {
      onAmountChange(numValue);
    }
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-2">
      <h2 className="font-bold mb-1">
        {isWithdrawal ? "Détails du retrait" : "Détails du paiement"}
      </h2>
      {selectedSfdAccount ? (
        <>
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Compte:</span>
            <span>{selectedSfdAccount.name || 'Compte SFD'}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Disponible:</span>
            <span>{selectedSfdAccount.balance.toLocaleString()} {selectedSfdAccount.currency || 'FCFA'}</span>
          </div>
        </>
      ) : isWithdrawal ? (
        <>
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Compte:</span>
            <span>Compte SFD</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Disponible:</span>
            <span>-</span>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Type:</span>
            <span>{isWithdrawal ? 'Retrait' : 'Paiement'}</span>
          </div>
        </>
      )}
      
      <div className="mt-2">
        <Label htmlFor="amount">Montant</Label>
        {onAmountChange ? (
          <Input
            id="amount"
            value={amountValue}
            onChange={handleAmountChange}
            placeholder="Entrez le montant"
            className="my-1"
            type="text"
          />
        ) : (
          <div className="flex justify-between text-lg font-bold mt-1">
            <span>{isWithdrawal ? "Montant du retrait:" : "Montant dû:"}</span>
            <span>{amount.toLocaleString()} FCFA</span>
          </div>
        )}
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
      
      {paymentStatus === 'success' && (
        <div className="flex items-center justify-center space-x-2 my-4 text-green-600">
          <Check className="h-5 w-5" />
          <span>{isWithdrawal ? "Retrait réussi" : "Paiement réussi"}</span>
        </div>
      )}
      
      {paymentStatus === 'failed' && (
        <div className="flex items-center justify-center space-x-2 my-4 text-red-600">
          <X className="h-5 w-5" />
          <span>{isWithdrawal ? "Échec du retrait" : "Échec du paiement"}</span>
        </div>
      )}
    </div>
  );
};

export default PaymentDetails;
