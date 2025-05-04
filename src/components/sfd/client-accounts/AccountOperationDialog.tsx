
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useClientSavingsAccount } from '@/hooks/useClientSavingsAccount';

interface AccountOperationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  onOperationComplete?: () => void;
}

export default function AccountOperationDialog({
  isOpen,
  onClose,
  clientId,
  clientName,
  onOperationComplete,
}: AccountOperationDialogProps) {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('deposit');

  const { processDeposit, processWithdrawal, account } = useClientSavingsAccount(clientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let success;
      
      if (activeTab === 'deposit') {
        success = await processDeposit(amount, description);
      } else {
        success = await processWithdrawal(amount, description);
      }
      
      if (success) {
        handleClose();
        if (onOperationComplete) {
          onOperationComplete();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    setAmount(0);
    setDescription('');
    onClose();
  };
  
  const isDisabled = isSubmitting || amount <= 0 || (activeTab === 'withdrawal' && account?.balance ? account.balance < amount : false);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Opération de compte pour {clientName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="deposit" className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4" /> Dépôt
              </TabsTrigger>
              <TabsTrigger value="withdrawal" className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4" /> Retrait
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="deposit">
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Montant à déposer (FCFA)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    min="0"
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit-description">Description (optionnel)</Label>
                  <Textarea
                    id="deposit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Raison du dépôt"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="withdrawal">
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="withdrawal-amount">Montant à retirer (FCFA)</Label>
                  <Input
                    id="withdrawal-amount"
                    type="number"
                    min="0"
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="0"
                  />
                  {account && (
                    <p className="text-sm text-gray-500">
                      Solde disponible: {account.balance.toLocaleString()} FCFA
                    </p>
                  )}
                  {activeTab === 'withdrawal' && account?.balance && amount > account.balance && (
                    <p className="text-sm text-red-500">
                      Solde insuffisant pour ce retrait
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="withdrawal-description">Description (optionnel)</Label>
                  <Textarea
                    id="withdrawal-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Raison du retrait"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isDisabled}
              className={activeTab === 'deposit' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Traitement...
                </span>
              ) : activeTab === 'deposit' ? 'Effectuer le dépôt' : 'Effectuer le retrait'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
