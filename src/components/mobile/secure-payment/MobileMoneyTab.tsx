
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMobileMoneyOperations } from '@/hooks/mobile-money';
import { Loader } from '@/components/ui/loader';

interface MobileMoneyTabProps {
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  handlePayment: () => void;
  isWithdrawal?: boolean;
  loanId?: string; // Add support for loan repayments
}

export const MobileMoneyTab: React.FC<MobileMoneyTabProps> = ({ 
  paymentStatus, 
  handlePayment,
  isWithdrawal = false,
  loanId
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('orange');
  const { 
    mobileMoneyProviders, 
    isProcessingPayment, 
    isProcessingWithdrawal 
  } = useMobileMoneyOperations();
  
  // Use the appropriate processing state based on operation type
  const isProcessing = isWithdrawal ? isProcessingWithdrawal : isProcessingPayment;
  
  const handleClick = () => {
    if (phoneNumber.trim().length < 8) {
      return; // Basic phone number validation
    }
    
    // Call the appropriate handler in the parent component
    handlePayment();
  };
  
  const operationType = isWithdrawal 
    ? 'Retrait' 
    : (loanId ? 'Remboursement de prêt' : 'Paiement');
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {isWithdrawal ? 'Retrait par Mobile Money' : 'Paiement par Mobile Money'}
      </h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Numéro de téléphone
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="Ex: 07XXXXXXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={paymentStatus === 'pending'}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="provider" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Opérateur Mobile Money
          </label>
          <Select 
            value={provider} 
            onValueChange={setProvider} 
            disabled={paymentStatus === 'pending'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un opérateur" />
            </SelectTrigger>
            <SelectContent>
              {mobileMoneyProviders.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          className="w-full" 
          onClick={handleClick} 
          disabled={paymentStatus === 'pending' || phoneNumber.trim().length < 8}
        >
          {paymentStatus === 'pending' ? (
            <>
              <Loader size="sm" className="mr-2" />
              {isWithdrawal ? 'Retrait en cours...' : loanId ? 'Remboursement en cours...' : 'Paiement en cours...'}
            </>
          ) : (
            isWithdrawal ? 'Effectuer le retrait' : loanId ? 'Effectuer le remboursement' : 'Effectuer le paiement'
          )}
        </Button>
      </div>
      
      <div className="text-sm text-gray-500">
        <p>Vous recevrez une notification sur votre téléphone pour confirmer la transaction.</p>
      </div>
    </div>
  );
};
