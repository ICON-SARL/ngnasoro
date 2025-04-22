
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useClientAccountOperations } from '@/hooks/admin/useClientAccountOperations';
import { useTransactions } from '@/hooks/transactions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BanknoteIcon, ArrowDownIcon, ArrowUpIcon, ReceiptIcon } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<string>('basic');
  const { toast } = useToast();
  const { isLoading: isClientAccountLoading } = useClientAccountOperations(clientId);
  const { makeDeposit, makeWithdrawal, isLoading: isTransactionLoading } = useTransactions(clientId);
  
  const isLoading = isClientAccountLoading || isTransactionLoading;
  
  const resetForm = () => {
    setAmount('');
    setDescription('');
    setOperationType('credit');
    setActiveTab('basic');
  };
  
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
      if (operationType === 'credit') {
        await makeDeposit(amountValue, description || 'Dépôt manuel', 'sfd_account');
        toast({
          title: "Dépôt réussi",
          description: `${amountValue.toLocaleString('fr-FR')} FCFA ont été déposés sur le compte client`,
        });
      } else {
        await makeWithdrawal(amountValue, description || 'Retrait manuel', 'sfd_account');
        toast({
          title: "Retrait réussi",
          description: `${amountValue.toLocaleString('fr-FR')} FCFA ont été retirés du compte client`,
        });
      }
      
      resetForm();
      onOperationComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || `Impossible d'effectuer l'opération`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      resetForm();
      onClose();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Opération sur le compte de {clientName}</DialogTitle>
          <DialogDescription>
            Effectuer un dépôt ou un retrait sur le compte client
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="basic">Opération standard</TabsTrigger>
            <TabsTrigger value="advanced">Options avancées</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="mt-4">
            <div className="grid gap-4 py-4">
              <div className="flex justify-around">
                <Button
                  type="button"
                  variant={operationType === 'credit' ? 'default' : 'outline'}
                  onClick={() => setOperationType('credit')}
                  className={operationType === 'credit' ? 'bg-[#0D6A51] hover:bg-[#0D6A51]/90' : ''}
                >
                  <ArrowDownIcon className="mr-2 h-4 w-4" />
                  Dépôt
                </Button>
                <Button
                  type="button"
                  variant={operationType === 'debit' ? 'default' : 'outline'}
                  onClick={() => setOperationType('debit')}
                  className={operationType === 'debit' ? 'bg-[#0D6A51] hover:bg-[#0D6A51]/90' : ''}
                >
                  <ArrowUpIcon className="mr-2 h-4 w-4" />
                  Retrait
                </Button>
              </div>
              
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
                    min="1"
                    step="100"
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
          </TabsContent>
          
          <TabsContent value="advanced" className="mt-4">
            <div className="grid gap-4 py-4">
              <RadioGroup 
                defaultValue="cash" 
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center cursor-pointer">
                    <BanknoteIcon className="h-4 w-4 mr-2" />
                    Espèces
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="mobile" id="mobile" />
                  <Label htmlFor="mobile" className="flex items-center cursor-pointer">
                    <ReceiptIcon className="h-4 w-4 mr-2" />
                    Mobile Money
                  </Label>
                </div>
              </RadioGroup>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ref-number" className="text-right">
                  N° Référence
                </Label>
                <Input
                  id="ref-number"
                  className="col-span-3"
                  placeholder="Numéro de référence (optionnel)"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
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
