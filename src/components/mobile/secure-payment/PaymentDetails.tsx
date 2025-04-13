
import React from 'react';
import { SfdAccount } from '@/hooks/sfd/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaymentDetailsProps {
  isWithdrawal?: boolean;
  loanId?: string;
  transactionAmount: number;
  onAmountChange: (amount: number) => void;
  selectedSfdAccount?: SfdAccount | null;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ 
  isWithdrawal = false,
  loanId,
  transactionAmount,
  onAmountChange,
  selectedSfdAccount
}) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <h2 className="font-bold mb-2">
        {isWithdrawal ? "Détails du retrait" : loanId ? "Détails du remboursement" : "Détails du dépôt"}
      </h2>
      
      {selectedSfdAccount && (
        <>
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Compte:</span>
            <span>{selectedSfdAccount.name || 'SFD Principal'}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="text-gray-600">Disponible:</span>
            <span>{selectedSfdAccount.balance.toLocaleString()} FCFA</span>
          </div>
        </>
      )}
      
      <div className="mb-3">
        <Label htmlFor="amount" className="text-sm font-medium text-gray-700 mb-1 block">
          {isWithdrawal ? "Montant du retrait" : loanId ? "Montant du remboursement" : "Montant du dépôt"}
        </Label>
        <div className="flex">
          <Input
            id="amount"
            type="number"
            value={transactionAmount}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            className="rounded-r-none"
          />
          <div className="bg-gray-100 px-3 flex items-center rounded-r-md border-y border-r">
            <span className="text-gray-500">FCFA</span>
          </div>
        </div>
      </div>
      
      {loanId && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Référence du prêt:</span>
          <span className="font-medium">{loanId.substring(0, 8)}</span>
        </div>
      )}
    </div>
  );
};

export default PaymentDetails;
