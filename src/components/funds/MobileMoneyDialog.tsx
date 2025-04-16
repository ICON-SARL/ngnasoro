
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useMobileMoneyOperations } from '@/hooks/mobile-money';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MobileMoneyDialogProps {
  open: boolean;
  onClose: () => void;
  isWithdrawal?: boolean;
}

const MobileMoneyDialog = ({ open, onClose, isWithdrawal = false }: MobileMoneyDialogProps) => {
  const [amount, setAmount] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [provider, setProvider] = useState<string>('orange');
  const { toast } = useToast();
  const { processPayment, processWithdrawal, isProcessingPayment, isProcessingWithdrawal } = useMobileMoneyOperations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !phoneNumber || !provider) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = isWithdrawal 
        ? await processWithdrawal(phoneNumber, amountValue, provider)
        : await processPayment(phoneNumber, amountValue, provider);

      if (success) {
        toast({
          title: isWithdrawal ? "Retrait initié" : "Dépôt initié",
          description: "Veuillez confirmer la transaction sur votre téléphone",
        });
        onClose();
      }
    } catch (error) {
      console.error('Transaction error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la transaction",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isWithdrawal ? 'Retrait via Mobile Money' : 'Dépôt via Mobile Money'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Montant</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Entrez le montant"
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                FCFA
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Opérateur</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Choisissez un opérateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="orange">Orange Money</SelectItem>
                <SelectItem value="moov">Moov Money</SelectItem>
                <SelectItem value="mtn">MTN Money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Ex: 0123456789"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              disabled={isProcessingPayment || isProcessingWithdrawal}
            >
              {isProcessingPayment || isProcessingWithdrawal ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Traitement...
                </span>
              ) : (
                'Confirmer'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MobileMoneyDialog;
