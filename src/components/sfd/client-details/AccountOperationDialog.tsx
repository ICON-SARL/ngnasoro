
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSavingsAccount } from '@/hooks/useSavingsAccount';
import { Loader } from '@/components/ui/loader';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AccountOperationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName?: string;
  onOperationComplete?: () => void;
}

export default function AccountOperationDialog({ 
  isOpen, 
  onClose, 
  clientId,
  clientName,
  onOperationComplete
}: AccountOperationDialogProps) {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [operationType, setOperationType] = useState<'deposit' | 'withdrawal'>('deposit');
  
  const { toast } = useToast();
  const { processDeposit, processWithdrawal, isLoading } = useSavingsAccount(clientId);
  const { activeSfdId } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeSfdId) {
      toast({
        title: "Erreur",
        description: "Aucune SFD active n'a été trouvée",
        variant: "destructive"
      });
      return;
    }

    if (amount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez saisir un montant supérieur à zéro",
        variant: "destructive"
      });
      return;
    }

    try {
      let success = false;
      
      if (operationType === 'deposit') {
        success = await processDeposit(amount, description || 'Dépôt');
      } else {
        success = await processWithdrawal(amount, description || 'Retrait');
      }
      
      if (success) {
        if (onOperationComplete) {
          onOperationComplete();
        }
        
        setAmount(0);
        setDescription('');
        onClose();
        
        toast({
          title: operationType === 'deposit' ? "Dépôt effectué" : "Retrait effectué",
          description: `${amount} FCFA ont été ${operationType === 'deposit' ? 'déposés sur' : 'retirés du'} compte client`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || `Impossible d'effectuer l'opération`,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {clientName ? `Opération sur le compte de ${clientName}` : "Opération sur le compte"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                className={operationType === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
                onClick={() => setOperationType('deposit')}
              >
                <ArrowDown className="mr-2 h-4 w-4" /> Dépôt
              </Button>
              <Button
                type="button"
                className={operationType === 'withdrawal' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
                onClick={() => setOperationType('withdrawal')}
              >
                <ArrowUp className="mr-2 h-4 w-4" /> Retrait
              </Button>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Montant (FCFA)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="1"
                step="100"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={operationType === 'deposit' ? "Dépôt de fonds" : "Retrait de fonds"}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || amount <= 0}>
              {isLoading ? <Loader size="sm" className="mr-2" /> : null}
              {operationType === 'deposit' ? 'Effectuer le dépôt' : 'Effectuer le retrait'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
