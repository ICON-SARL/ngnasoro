
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClientSavingsAccount } from '@/hooks/useClientSavingsAccount';
import { Loader } from '@/components/ui/loader';

interface AccountOperationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName?: string;
  onOperationComplete?: () => void;
}

const AccountOperationDialog: React.FC<AccountOperationDialogProps> = ({ 
  isOpen,
  onClose,
  clientId,
  clientName = 'Client',
  onOperationComplete
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [operationType, setOperationType] = useState<'deposit' | 'withdrawal'>('deposit');
  
  const { processDeposit, processWithdrawal, isTransactionLoading, balance } = useClientSavingsAccount(clientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;

    if (operationType === 'deposit') {
      success = await processDeposit(amount, description);
    } else {
      success = await processWithdrawal(amount, description);
    }

    if (success) {
      setAmount(0);
      setDescription('');
      if (onOperationComplete) {
        onOperationComplete();
      }
      onClose();
    }
  };

  // Validation function
  const isValidAmount = () => {
    return amount > 0 && (operationType !== 'withdrawal' || amount <= balance);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Opération sur le compte</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="deposit" onValueChange={(value) => setOperationType(value as 'deposit' | 'withdrawal')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">Dépôt</TabsTrigger>
            <TabsTrigger value="withdrawal">Retrait</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="text-sm font-medium">
                Client: <span className="font-semibold">{clientName}</span>
              </div>
              
              {operationType === 'withdrawal' && (
                <div className="text-sm">
                  Solde disponible: <span className="font-semibold">{balance.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Montant
                </Label>
                <div className="col-span-3">
                  <Input
                    id="amount"
                    type="number"
                    min={1}
                    step={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="col-span-3"
                    disabled={isTransactionLoading}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <div className="col-span-3">
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="col-span-3"
                    disabled={isTransactionLoading}
                    placeholder={operationType === 'deposit' ? 'Dépôt sur compte client' : 'Retrait du compte client'}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isTransactionLoading}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isTransactionLoading || !isValidAmount()}
              >
                {isTransactionLoading && <Loader size="sm" className="mr-2" />}
                {operationType === 'deposit' ? 'Effectuer le dépôt' : 'Effectuer le retrait'}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AccountOperationDialog;
