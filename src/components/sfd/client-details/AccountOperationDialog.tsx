
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useSavingsAccount } from '@/hooks/useSavingsAccount';
import { Loader } from '@/components/ui/loader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { edgeFunctionApi } from '@/utils/api/modules/edgeFunctionApi';

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
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [client, setClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { 
    processDeposit, 
    processWithdrawal, 
    account, 
    isLoading: accountLoading,
    refetchBalance
  } = useSavingsAccount(client?.user_id || '');

  useEffect(() => {
    if (isOpen && clientId) {
      setIsLoading(true);
      fetchClientDetails();
    }
  }, [isOpen, clientId]);

  const fetchClientDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('sfd_clients')
        .select('*')
        .eq('id', clientId)
        .single();
        
      if (error) throw error;
      setClient(data);
    } catch (error) {
      console.error('Error fetching client details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAmount(0);
    setDescription('');
    setActiveTab('deposit');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!client?.id) {
        throw new Error("Client information is missing");
      }
      
      // Use the edge function directly for better error handling
      const { data, error } = await supabase.functions.invoke('process-account-transaction', {
        body: {
          clientId: client.id,
          amount: amount,
          transactionType: activeTab === 'deposit' ? 'deposit' : 'withdrawal',
          description: description || (activeTab === 'deposit' ? 'Dépôt manuel' : 'Retrait manuel'),
          performedBy: (await supabase.auth.getUser()).data.user?.id,
          sfdId: client.sfd_id // Explicitly pass the client's SFD ID
        }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || "Échec de l'opération");
      }
      
      toast({
        title: 'Opération réussie',
        description: activeTab === 'deposit'
          ? `Dépôt de ${amount} FCFA effectué avec succès`
          : `Retrait de ${amount} FCFA effectué avec succès`
      });
      
      // After successful operation, refresh the account data
      if (refetchBalance) {
        refetchBalance();
      }
      
      if (onOperationComplete) {
        onOperationComplete();
      }
      
      handleClose();
    } catch (error: any) {
      console.error('Error processing operation:', error);
      toast({
        title: 'Erreur',
        description: error.message || `Échec de l'opération: ${activeTab}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Opération de compte</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="deposit" className="flex items-center">
              <ArrowDown className="h-4 w-4 mr-1 text-green-600" />
              Dépôt
            </TabsTrigger>
            <TabsTrigger value="withdrawal" className="flex items-center">
              <ArrowUp className="h-4 w-4 mr-1 text-blue-600" />
              Retrait
            </TabsTrigger>
          </TabsList>
          
          {accountLoading || isLoading ? (
            <div className="flex justify-center p-6">
              <Loader size="md" />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client-name">Client</Label>
                  <Input id="client-name" value={clientName} disabled />
                </div>
                
                <div>
                  <Label htmlFor="amount">Montant (FCFA)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="100"
                    step="100"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description (optionnelle)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={activeTab === 'deposit' ? "Dépôt en espèces..." : "Retrait en espèces..."}
                    className="resize-none"
                  />
                </div>
                
                {activeTab === 'withdrawal' && account && (
                  <div className="text-sm">
                    <span className="text-gray-500">Solde disponible: </span>
                    <span className="font-semibold">{account.balance?.toLocaleString('fr-FR')} FCFA</span>
                    {account.balance < amount && (
                      <p className="text-red-500 mt-1">Solde insuffisant pour ce retrait</p>
                    )}
                  </div>
                )}
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className={activeTab === 'deposit' ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                  disabled={
                    isLoading || 
                    amount <= 0 || 
                    (activeTab === 'withdrawal' && account && account.balance < amount)
                  }
                >
                  {isLoading && <Loader size="sm" className="mr-2" />}
                  {activeTab === 'deposit' ? 'Effectuer le dépôt' : 'Effectuer le retrait'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AccountOperationDialog;
