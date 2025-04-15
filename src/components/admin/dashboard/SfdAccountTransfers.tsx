
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { adaptSfdAccount, formatCurrency, getAccountDisplayName } from '@/utils/sfdAdapter';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function SfdAccountTransfers() {
  const { accounts, transferFunds, synchronizeBalances, refetchAccounts } = useSfdAccounts();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Adapt all accounts to ensure they have all required properties
  const adaptedAccounts = accounts.map(account => adaptSfdAccount(account));
  
  const handleTransfer = async () => {
    try {
      if (!fromAccountId || !toAccountId || !amount) {
        toast({
          title: "Champs incomplets",
          description: "Veuillez remplir tous les champs requis",
          variant: "destructive",
        });
        return;
      }
      
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        toast({
          title: "Montant invalide",
          description: "Veuillez entrer un montant valide",
          variant: "destructive",
        });
        return;
      }
      
      const fromAccount = adaptedAccounts.find(acc => acc.id === fromAccountId);
      if (!fromAccount) {
        toast({
          title: "Compte introuvable",
          description: "Le compte source est introuvable",
          variant: "destructive",
        });
        return;
      }
      
      if ((fromAccount.balance || 0) < parsedAmount) {
        toast({
          title: "Fonds insuffisants",
          description: "Le solde du compte source est insuffisant",
          variant: "destructive",
        });
        return;
      }
      
      await transferFunds.mutate({
        sfdId: fromAccount.sfd_id,
        fromAccountId,
        toAccountId,
        amount: parsedAmount,
      });
      
      toast({
        title: "Transfert réussi",
        description: `${formatCurrency(parsedAmount)} transférés avec succès`,
      });
      
      setOpen(false);
      setAmount('');
      setFromAccountId('');
      setToAccountId('');
      
      await refetchAccounts();
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Erreur de transfert",
        description: "Une erreur est survenue lors du transfert",
        variant: "destructive",
      });
    }
  };
  
  const refreshBalances = async () => {
    setIsRefreshing(true);
    try {
      await synchronizeBalances.mutate();
      toast({
        title: "Synchronisation terminée",
        description: "Les soldes des comptes ont été mis à jour",
      });
    } catch (error) {
      console.error('Balance sync error:', error);
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser les soldes",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const isPending = typeof synchronizeBalances.isPending === 'boolean' ? 
    synchronizeBalances.isPending : false;
  
  return (
    <Card>
      <CardHeader className="pb-3 flex justify-between items-center flex-row">
        <CardTitle className="text-lg">Transferts entre comptes</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshBalances}
          disabled={isRefreshing || isPending}
        >
          {isRefreshing || isPending ? (
            <Loader className="mr-2 h-4 w-4" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {adaptedAccounts.map(account => (
            <div key={account.id} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">{getAccountDisplayName(account)}</p>
                <p className="text-sm text-muted-foreground">
                  {account.account_type ? `Type: ${account.account_type}` : 'Compte principal'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(account.balance || 0, account.currency || 'FCFA')}</p>
              </div>
            </div>
          ))}
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full mt-2">Transférer des fonds</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transfert entre comptes</DialogTitle>
                <DialogDescription>
                  Transférer des fonds entre les comptes de la SFD.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="from-account">Compte source</Label>
                  <Select value={fromAccountId} onValueChange={setFromAccountId}>
                    <SelectTrigger id="from-account">
                      <SelectValue placeholder="Sélectionner un compte" />
                    </SelectTrigger>
                    <SelectContent>
                      {adaptedAccounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {getAccountDisplayName(account)} ({formatCurrency(account.balance || 0)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-center my-2">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="to-account">Compte destination</Label>
                  <Select value={toAccountId} onValueChange={setToAccountId}>
                    <SelectTrigger id="to-account">
                      <SelectValue placeholder="Sélectionner un compte" />
                    </SelectTrigger>
                    <SelectContent>
                      {adaptedAccounts
                        .filter(account => account.id !== fromAccountId)
                        .map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {getAccountDisplayName(account)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="amount">Montant à transférer</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0 FCFA"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleTransfer} disabled={!fromAccountId || !toAccountId || !amount}>
                  Transférer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
