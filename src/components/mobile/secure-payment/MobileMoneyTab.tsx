
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
}

export const MobileMoneyTab: React.FC<MobileMoneyTabProps> = ({ 
  paymentStatus, 
  handlePayment,
  isWithdrawal = false
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('orange');
  const { mobileMoneyProviders, isProcessing } = useMobileMoneyOperations();
  
  const handleClick = () => {
    if (phoneNumber.trim().length < 8) {
      return; // Basic phone number validation
    }
    
    // Call the appropriate handler in the parent component
    handlePayment();
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Paiement par Mobile Money</h3>
      
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
          className="w-full bg-yellow-500 hover:bg-yellow-600" 
          onClick={handleClick} 
          disabled={paymentStatus === 'pending' || phoneNumber.trim().length < 8}
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
        <p>Vous recevrez une notification sur votre téléphone pour confirmer la transaction.</p>
      </div>
    </div>
  );
};
