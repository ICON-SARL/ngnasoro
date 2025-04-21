
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useClientAccountOperations } from '@/components/admin/hooks/sfd-client/useClientAccountOperations';

interface AccountOperationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  onOperationComplete: () => void;
}

const AccountOperationDialog: React.FC<AccountOperationDialogProps> = ({
  isOpen,
  onClose,
  clientId,
  clientName,
  onOperationComplete
}) => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [operationType, setOperationType] = useState<'credit' | 'debit'>('credit');
  const { toast } = useToast();
  const { creditAccount, isLoading } = useClientAccountOperations(clientId);
  
  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide supérieur à 0",
        variant: "destructive",
      });
      return;
    }
    
    const amountValue = parseFloat(amount);
    
    try {
      // For credit, we use positive amount, for debit we use negative amount
      const operationAmount = operationType === 'credit' ? amountValue : -amountValue;
      const operationDescription = `${operationType === 'credit' ? 'Crédit' : 'Débit'}: ${description || 'Opération manuelle'}`;
      
      await creditAccount.mutateAsync({ 
        amount: operationAmount, 
        description: operationDescription 
      });
      
      toast({
        title: "Opération réussie",
        description: `Compte ${operationType === 'credit' ? 'crédité' : 'débité'} de ${amount} FCFA`,
      });
      
      setAmount('');
      setDescription('');
      onOperationComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || `Impossible de ${operationType === 'credit' ? 'créditer' : 'débiter'} le compte`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Opération sur le compte de {clientName}</DialogTitle>
          <DialogDescription>
            Effectuer un crédit ou un débit sur le compte client
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <RadioGroup 
            defaultValue="credit" 
            value={operationType}
            onValueChange={(value) => setOperationType(value as 'credit' | 'debit')}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="credit" id="credit" />
              <Label htmlFor="credit" className="font-medium">Crédit</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="debit" id="debit" />
              <Label htmlFor="debit" className="font-medium">Débit</Label>
            </div>
          </RadioGroup>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Montant
            </Label>
            <div className="col-span-3 relative">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                className="pr-16"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                FCFA
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              className="col-span-3"
              placeholder="Motif de l'opération (optionnel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          >
            {isLoading ? 'En cours...' : 'Confirmer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccountOperationDialog;
