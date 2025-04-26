
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useClientAccountOperations } from '@/hooks/useClientAccountOperations';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Plus, Minus } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AccountOperationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  onOperationComplete: () => void;
  defaultType?: 'credit' | 'debit';
}

const AccountOperationDialog: React.FC<AccountOperationDialogProps> = ({
  isOpen,
  onClose,
  clientId,
  clientName,
  onOperationComplete,
  defaultType = 'credit'
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [operationType, setOperationType] = useState<'credit' | 'debit'>(defaultType);
  const { creditAccount, isLoading } = useClientAccountOperations(clientId);
  const { toast } = useToast();

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDescription('');
      setOperationType(defaultType);
    }
  }, [isOpen, defaultType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un montant valide',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Convert amount to number and adjust sign based on operation
      const numericAmount = parseFloat(amount);
      const adjustedAmount = operationType === 'credit' ? numericAmount : -numericAmount;
      
      await creditAccount.mutateAsync({ 
        amount: adjustedAmount,
        description: description || (operationType === 'credit' ? 'Crédit manuel' : 'Débit manuel')
      });
      
      toast({
        title: operationType === 'credit' ? 'Crédit effectué' : 'Débit effectué',
        description: `Le compte a été ${operationType === 'credit' ? 'crédité' : 'débité'} de ${amount} FCFA`,
      });
      
      onOperationComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-[#0D6A51]" />
            {operationType === 'credit' ? 'Créditer' : 'Débiter'} le compte de {clientName}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type d'opération</Label>
            <RadioGroup 
              value={operationType} 
              onValueChange={(value) => setOperationType(value as 'credit' | 'debit')} 
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="credit" id="credit" />
                <Label htmlFor="credit" className="flex items-center cursor-pointer">
                  <Plus className="h-4 w-4 mr-1 text-green-600" />
                  Crédit
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="debit" id="debit" />
                <Label htmlFor="debit" className="flex items-center cursor-pointer">
                  <Minus className="h-4 w-4 mr-1 text-red-600" />
                  Débit
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Montant (FCFA)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="100"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="text-lg"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder={operationType === 'credit' ? "Raison du crédit..." : "Raison du débit..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
          
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={onClose} type="button" disabled={isLoading}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className={operationType === 'credit' ? 
                "bg-green-600 hover:bg-green-700 text-white" : 
                "bg-red-600 hover:bg-red-700 text-white"}
            >
              {isLoading ? 'Traitement...' : operationType === 'credit' ? 'Créditer' : 'Débiter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccountOperationDialog;
