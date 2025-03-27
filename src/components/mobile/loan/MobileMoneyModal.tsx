
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useMobileMoneyOperations } from '@/hooks/useMobileMoneyOperations';

export interface MobileMoneyModalProps {
  isOpen?: boolean;
  onClose: () => void;
  isWithdrawal: boolean;
  onSuccess?: () => Promise<void>;
  amount?: number;
}

const MobileMoneyModal: React.FC<MobileMoneyModalProps> = ({ 
  isOpen = true, 
  onClose, 
  isWithdrawal,
  onSuccess,
  amount = isWithdrawal ? 25000 : 3500
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState<'orange' | 'mtn' | 'wave'>('orange');
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'info' | 'verification'>('info');
  const { processMobileMoneyPayment, processMobileMoneyWithdrawal } = useMobileMoneyOperations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isWithdrawal) {
        await processMobileMoneyWithdrawal(phoneNumber, amount, provider);
      } else {
        await processMobileMoneyPayment(phoneNumber, amount, provider);
      }
      
      // Simuler l'envoi d'un code de vérification
      setTimeout(() => {
        setStep('verification');
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Mobile money error:', error);
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate verification process
    setTimeout(async () => {
      setIsLoading(false);
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isWithdrawal ? 'Retrait d\'argent' : 'Remboursement de prêt'} via Mobile Money
          </DialogTitle>
        </DialogHeader>
        
        {step === 'info' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Opérateur</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={provider === 'orange' ? 'default' : 'outline'}
                  onClick={() => setProvider('orange')}
                  className={provider === 'orange' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                >
                  Orange
                </Button>
                <Button
                  type="button"
                  variant={provider === 'mtn' ? 'default' : 'outline'}
                  onClick={() => setProvider('mtn')}
                  className={provider === 'mtn' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                >
                  MTN
                </Button>
                <Button
                  type="button"
                  variant={provider === 'wave' ? 'default' : 'outline'}
                  onClick={() => setProvider('wave')}
                  className={provider === 'wave' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                >
                  Wave
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="70 XX XX XX"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (FCFA)</Label>
              <Input
                id="amount"
                type="text"
                value={amount.toLocaleString()}
                readOnly
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading || !phoneNumber}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continuer
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-gray-500">
              Un code a été envoyé au {phoneNumber}. Veuillez l'entrer ci-dessous.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="code">Code de vérification</Label>
              <Input
                id="code"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="XXXX"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => setStep('info')} disabled={isLoading}>
                Retour
              </Button>
              <Button type="submit" disabled={isLoading || !code}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Vérifier
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MobileMoneyModal;
