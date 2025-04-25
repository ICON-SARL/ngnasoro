
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useClientAccountOperations } from '@/hooks/useClientAccountOperations';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface AccountOperationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  onOperationComplete?: () => void;
}

const AccountOperationDialog: React.FC<AccountOperationDialogProps> = ({
  isOpen,
  onClose,
  clientId,
  clientName,
  onOperationComplete
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [operationType, setOperationType] = useState<'credit' | 'debit'>('credit');
  const { creditAccount, isLoading } = useClientAccountOperations(clientId);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || amount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide supérieur à 0",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await creditAccount.mutateAsync({
        amount: operationType === 'credit' ? amount : -amount,
        description: description || `${operationType === 'credit' ? 'Crédit' : 'Débit'} manuel`
      });

      if (result) {
        toast({
          title: "Opération réussie",
          description: `Le compte a été ${operationType === 'credit' ? 'crédité' : 'débité'} de ${amount} FCFA`,
        });
        onOperationComplete?.();
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'opération",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Opération sur compte</DialogTitle>
          <DialogDescription>
            Client: {clientName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type d'opération</Label>
              <RadioGroup
                value={operationType}
                onValueChange={(value: 'credit' | 'debit') => setOperationType(value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit" id="credit" />
                  <Label htmlFor="credit">Crédit</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="debit" id="debit" />
                  <Label htmlFor="debit">Débit</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Montant (FCFA)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                placeholder="Montant en FCFA"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description de l'opération"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={isLoading || !amount || amount <= 0}
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              {isLoading ? 'En cours...' : 'Valider'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccountOperationDialog;
