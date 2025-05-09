
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Smartphone, Phone, CircleCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMobileMoneyOperations } from '@/hooks/mobile-money';
import { useAuth } from '@/hooks/useAuth';

interface MobileMoneyModalProps {
  onClose: () => void;
  isWithdrawal?: boolean;
  amount?: number;
  loanId?: string;
}

const MobileMoneyModal: React.FC<MobileMoneyModalProps> = ({ 
  onClose, 
  isWithdrawal = false,
  amount = 0,
  loanId
}) => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('orange');
  const [transactionAmount, setTransactionAmount] = useState(amount);
  const [success, setSuccess] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { 
    processPayment, 
    processWithdrawal, 
    isProcessingPayment,
    isProcessingWithdrawal
  } = useMobileMoneyOperations();
  
  const isProcessing = isProcessingPayment || isProcessingWithdrawal;
  
  const validatePhoneNumber = (phone: string) => {
    // Check if phone number is valid (simple validation)
    return phone.length >= 8;
  };
  
  const handleSubmit = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setErrorMessage('Veuillez entrer un numéro de téléphone valide');
      return;
    }
    
    if (transactionAmount <= 0) {
      setErrorMessage('Le montant doit être supérieur à 0');
      return;
    }
    
    setProcessingStatus('processing');
    
    try {
      let success;
      
      if (isWithdrawal) {
        success = await processWithdrawal({
          phoneNumber,
          amount: transactionAmount,
          provider,
          description: 'Retrait Mobile Money'
        });
      } else {
        success = await processPayment({
          phoneNumber,
          amount: transactionAmount,
          provider,
          description: loanId ? 'Remboursement de prêt' : 'Dépôt Mobile Money',
          loanId
        });
      }
      
      if (success) {
        setProcessingStatus('success');
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setProcessingStatus('error');
        setErrorMessage('La transaction a échoué. Veuillez réessayer.');
      }
    } catch (error: any) {
      setProcessingStatus('error');
      setErrorMessage(error.message || 'Une erreur est survenue');
    }
  };
  
  if (success) {
    return (
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="rounded-full bg-green-100 p-3 mb-4">
            <CircleCheck className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {isWithdrawal ? 'Retrait initié' : 'Paiement initié'}
          </h3>
          <p className="text-center text-gray-600 mb-4">
            {isWithdrawal
              ? `Votre demande de retrait de ${transactionAmount.toLocaleString()} FCFA a été initiée.`
              : `Votre paiement de ${transactionAmount.toLocaleString()} FCFA a été initié.`
            } Veuillez confirmer la transaction sur votre téléphone.
          </p>
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </DialogContent>
    );
  }
  
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          {isWithdrawal ? 'Retrait via Mobile Money' : 'Paiement via Mobile Money'}
        </DialogTitle>
        <DialogDescription>
          {isWithdrawal
            ? 'Retirez de l\'argent directement sur votre compte mobile money'
            : 'Payez rapidement et en toute sécurité via mobile money'
          }
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>Opérateur Mobile Money</Label>
          <RadioGroup 
            value={provider} 
            onValueChange={setProvider}
            className="flex space-x-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="orange" id="orange" />
              <Label htmlFor="orange" className="cursor-pointer">Orange Money</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mtn" id="mtn" />
              <Label htmlFor="mtn" className="cursor-pointer">MTN Money</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moov" id="moov" />
              <Label htmlFor="moov" className="cursor-pointer">Moov Money</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Numéro de téléphone</Label>
          <div className="flex">
            <div className="bg-gray-100 px-3 flex items-center rounded-l-md border-y border-l">
              <Phone className="h-4 w-4 text-gray-500" />
            </div>
            <Input
              id="phone"
              placeholder="Ex: 07XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="rounded-l-none focus-visible:ring-offset-0"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">Montant ({isWithdrawal ? 'à retirer' : 'à payer'})</Label>
          <div className="flex">
            <Input
              id="amount"
              type="number"
              value={transactionAmount}
              onChange={(e) => setTransactionAmount(Number(e.target.value))}
              className="rounded-r-none"
              disabled={!!amount}
            />
            <div className="bg-gray-100 px-3 flex items-center rounded-r-md border-y border-r">
              <span className="text-gray-500">FCFA</span>
            </div>
          </div>
        </div>
        
        {errorMessage && (
          <div className="flex items-center text-red-600 gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            {errorMessage}
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isProcessing}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={isProcessing || !phoneNumber} className="gap-2">
          {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
          {isProcessing ? 'Traitement en cours...' : isWithdrawal ? 'Retirer' : 'Payer'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default MobileMoneyModal;
