
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMobileMoneyOperations } from '@/hooks/mobile-money';
import { Loader } from '@/components/ui/loader';
import { useLocalization } from '@/contexts/LocalizationContext';

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
  const { t, language } = useLocalization();
  
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
            {language === 'bambara' ? 'Téléphone numero' : 'Numéro de téléphone'}
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder={language === 'bambara' ? "Misali: 76XXXXXX" : "Ex: 76XXXXXXX"}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={paymentStatus === 'pending'}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="provider" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {language === 'bambara' ? 'Mobile Money cikan' : 'Opérateur Mobile Money'}
          </label>
          <Select 
            value={provider} 
            onValueChange={setProvider} 
            disabled={paymentStatus === 'pending'}
          >
            <SelectTrigger>
              <SelectValue placeholder={language === 'bambara' ? "Mobile Money cikan sugandi" : "Sélectionner un opérateur"} />
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
              {isWithdrawal ? 
                (language === 'bambara' ? 'Wari bɔli ka taara...' : 'Retrait en cours...') : 
                (language === 'bambara' ? 'Wari sara ka taara...' : 'Paiement en cours...')}
            </>
          ) : (
            isWithdrawal ? 
              (language === 'bambara' ? 'Wari bɔ' : 'Effectuer le retrait') : 
              (language === 'bambara' ? 'Wari sara' : 'Effectuer le paiement')
          )}
        </Button>
      </div>
      
      <div className="text-sm text-gray-500">
        <p>{language === 'bambara' ? 
          'I bɛna kunnafoni sɔrɔ i ka téléphone kan ka transaction dafa.' : 
          'Vous recevrez une notification sur votre téléphone pour confirmer la transaction.'}
        </p>
      </div>
    </div>
  );
};
