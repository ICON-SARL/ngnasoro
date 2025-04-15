
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { CreateTransferParams } from '@/types/sfdAccounts';

export const SfdAccountsManager = () => {
  const { accounts, isLoading, refetch } = useSfdAccounts();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };
  
  const handleTransfer = async () => {
    if (!user || !fromAccountId || !toAccountId || !amount || fromAccountId === toAccountId) {
      toast({
        title: "Erreur de transfert",
        description: "Veuillez sélectionner des comptes différents et spécifier un montant",
        variant: "destructive"
      });
      return;
    }
    
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide",
        variant: "destructive"
      });
      return;
    }
    
    // Find source account to check balance
    const sourceAccount = accounts?.find(acc => acc.id === fromAccountId);
    if (sourceAccount && sourceAccount.balance < transferAmount) {
      toast({
        title: "Fonds insuffisants",
        description: "Le compte source n'a pas assez de fonds pour ce transfert",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsTransferring(true);
      
      // Extract SFD ID from source account
      const sfdId = sourceAccount?.sfd_id;
      
      if (!sfdId) {
        throw new Error("SFD ID introuvable");
      }
      
      // Create transfer parameters
      const transferParams: CreateTransferParams = {
        sfdId,
        fromAccountId,
        toAccountId,
        amount: transferAmount,
        description: description || "Transfert entre comptes SFD"
      };
      
      // Call Supabase function to process transfer
      const { data, error } = await supabase.functions.invoke('sfd-account-transfer', {
        body: transferParams
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "Transfert réussi",
          description: `${formatCurrency(transferAmount)} transféré avec succès`,
        });
        
        // Clear form
        setFromAccountId('');
        setToAccountId('');
        setAmount('');
        setDescription('');
        
        // Refresh accounts data
        refetch();
      } else {
        throw new Error(data.message || "Échec du transfert pour une raison inconnue");
      }
    } catch (error: any) {
      console.error('Transfer error:', error);
      toast({
        title: "Erreur de transfert",
        description: error.message || "Une erreur s'est produite lors du transfert",
        variant: "destructive"
      });
    } finally {
      setIsTransferring(false);
    }
  };
  
  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'operation': return 'Opérations';
      case 'remboursement': return 'Remboursements';
      case 'epargne': return 'Épargne';
      default: return type;
    }
  };
  
  const getSfdById = (sfdId: string) => {
    const sfdAccount = accounts?.find(account => account.sfd_id === sfdId);
    return sfdId; // In a real implementation, you would return the SFD name from a map of SFDs
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Comptes SFD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Liste des Comptes</h3>
              
              {isLoading ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Chargement des comptes...</span>
                </div>
              ) : accounts && accounts.length > 0 ? (
                <div className="border rounded-md overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SFD</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solde</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {accounts.map(account => (
                        <tr key={account.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{getSfdById(account.sfd_id)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{getAccountTypeLabel(account.account_type)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{formatCurrency(account.balance)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {account.status === 'active' ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4 border rounded-md bg-gray-50">
                  Aucun compte trouvé
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Effectuer un Transfert</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fromAccount">Compte Source</Label>
                  <Select value={fromAccountId} onValueChange={setFromAccountId}>
                    <SelectTrigger id="fromAccount">
                      <SelectValue placeholder="Sélectionner le compte source" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts?.map(account => (
                        <SelectItem key={`from-${account.id}`} value={account.id}>
                          {getSfdById(account.sfd_id)} - {getAccountTypeLabel(account.account_type)} ({formatCurrency(account.balance)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="toAccount">Compte Destination</Label>
                  <Select value={toAccountId} onValueChange={setToAccountId}>
                    <SelectTrigger id="toAccount">
                      <SelectValue placeholder="Sélectionner le compte destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts?.map(account => (
                        <SelectItem key={`to-${account.id}`} value={account.id}>
                          {getSfdById(account.sfd_id)} - {getAccountTypeLabel(account.account_type)} ({formatCurrency(account.balance)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant (FCFA)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="1000"
                    placeholder="Montant à transférer"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description du transfert"
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleTransfer}
                  disabled={isTransferring || !fromAccountId || !toAccountId || !amount}
                >
                  {isTransferring ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Transfert en cours...
                    </>
                  ) : (
                    'Effectuer le Transfert'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
