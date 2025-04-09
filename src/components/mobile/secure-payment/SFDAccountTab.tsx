
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from '@/components/ui/loader';
import { SfdAccount } from '@/hooks/sfd/types';

interface SFDAccountTabProps {
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  handlePayment: () => void;
  isWithdrawal?: boolean;
  selectedSfdAccount?: SfdAccount | null;
  syncedAccountsList?: SfdAccount[];
}

export const SFDAccountTab: React.FC<SFDAccountTabProps> = ({ 
  paymentStatus, 
  handlePayment,
  isWithdrawal = false,
  selectedSfdAccount,
  syncedAccountsList = []
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {isWithdrawal 
          ? "Retrait depuis votre compte SFD" 
          : "Paiement depuis votre compte SFD"
        }
      </h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="sfd-account" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Compte SFD
          </label>
          <Select disabled={syncedAccountsList.length <= 1 || paymentStatus === 'pending'}>
            <SelectTrigger>
              <SelectValue placeholder={selectedSfdAccount?.name || "Choisir un compte"} />
            </SelectTrigger>
            <SelectContent>
              {syncedAccountsList.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} - {account.balance?.toLocaleString()} FCFA
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          className="w-full" 
          onClick={handlePayment} 
          disabled={paymentStatus === 'pending' || !selectedSfdAccount}
        >
          {paymentStatus === 'pending' ? (
            <>
              <Loader size="sm" className="mr-2" />
              {isWithdrawal ? 'Retrait en cours...' : 'Paiement en cours...'}
            </>
          ) : (
            isWithdrawal ? 'Effectuer le retrait' : 'Effectuer le paiement'
          )}
        </Button>
      </div>
      
      <div className="text-sm text-gray-500">
        <p>
          {isWithdrawal 
            ? "Le montant sera envoyé sur votre compte Mobile Money ou disponible en agence." 
            : "Le montant sera débité de votre compte SFD."
          }
        </p>
      </div>
    </div>
  );
};
