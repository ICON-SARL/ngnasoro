
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft, Wallet, RefreshCw } from 'lucide-react';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/format';

export function SfdAccountTransfers() {
  const { accounts, transferFunds } = useSfdAccounts();
  const { toast } = useToast();
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');

  const handleTransfer = async () => {
    if (!fromAccountId || !toAccountId || !amount) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs requis',
        variant: 'destructive',
      });
      return;
    }

    if (fromAccountId === toAccountId) {
      toast({
        title: 'Erreur',
        description: 'Vous ne pouvez pas transférer de fonds vers le même compte',
        variant: 'destructive',
      });
      return;
    }

    const fromAccount = accounts.find(acc => acc.id === fromAccountId);
    if (fromAccount && fromAccount.balance < amount) {
      toast({
        title: 'Solde insuffisant',
        description: 'Le solde du compte source est insuffisant pour ce transfert',
        variant: 'destructive',
      });
      return;
    }

    try {
      await transferFunds.mutateAsync({
        sfdId: accounts[0]?.sfd_id || '', // Assuming all accounts belong to same SFD
        fromAccountId,
        toAccountId,
        amount,
        description: description || 'Transfert entre comptes'
      });

      // Reset form
      setDescription('');
      setAmount(0);
    } catch (error) {
      console.error('Transfer error:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          Transfert entre comptes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fromAccount">Compte source</Label>
            <Select value={fromAccountId} onValueChange={setFromAccountId}>
              <SelectTrigger id="fromAccount">
                <SelectValue placeholder="Sélectionner un compte" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name || account.description || `Compte ${account.account_type}`} ({formatCurrency(account.balance, account.currency)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="toAccount">Compte destination</Label>
            <Select value={toAccountId} onValueChange={setToAccountId}>
              <SelectTrigger id="toAccount">
                <SelectValue placeholder="Sélectionner un compte" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name || account.description || `Compte ${account.account_type}`} ({formatCurrency(account.balance, account.currency)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="amount">Montant</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            value={amount || ''}
            onChange={e => setAmount(Number(e.target.value))}
            placeholder="Montant à transférer"
          />
        </div>

        <div>
          <Label htmlFor="description">Description (optionnelle)</Label>
          <Input
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Raison du transfert"
          />
        </div>

        <Button 
          onClick={handleTransfer} 
          disabled={!fromAccountId || !toAccountId || !amount || transferFunds.isPending}
          className="w-full"
        >
          {transferFunds.isPending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Transfert en cours...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Effectuer le transfert
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
