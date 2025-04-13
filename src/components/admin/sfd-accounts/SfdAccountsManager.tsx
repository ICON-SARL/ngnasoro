
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowDownUp, RefreshCw, BadgeDollarSign } from 'lucide-react';

export const SfdAccountsManager: React.FC = () => {
  const { toast } = useToast();
  const { 
    accounts, 
    isLoading, 
    transferHistory, 
    operationAccount, 
    repaymentAccount, 
    savingsAccount,
    transferFunds,
    refetchAccounts,
    refetchHistory
  } = useSfdAccounts();

  const [transferAmount, setTransferAmount] = useState<string>('');
  const [fromAccount, setFromAccount] = useState<string>('');
  const [toAccount, setToAccount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshData = async () => {
    await Promise.all([refetchAccounts(), refetchHistory()]);
    toast({
      title: "Données actualisées",
      description: "Les informations des comptes SFD ont été mises à jour",
    });
  };

  const handleTransfer = async () => {
    if (!fromAccount || !toAccount) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner les comptes source et destination",
        variant: "destructive",
      });
      return;
    }

    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }

    if (fromAccount === toAccount) {
      toast({
        title: "Erreur",
        description: "Les comptes source et destination doivent être différents",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await transferFunds.mutateAsync({
        sfdId: accounts[0]?.sfd_id || '',
        fromAccountId: fromAccount,
        toAccountId: toAccount,
        amount: parseFloat(transferAmount),
        description: description || "Transfert entre comptes SFD",
      });

      setTransferAmount('');
      setDescription('');
      setIsTransferDialogOpen(false);
    } catch (error) {
      console.error("Transfer error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des comptes SFD...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Comptes SFD</h2>
        <Button onClick={refreshData} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Operation Account Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Compte d'Opérations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {operationAccount ? (
                `${operationAccount.balance.toLocaleString()} ${operationAccount.currency}`
              ) : "N/A"}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Utilisé pour les opérations quotidiennes
            </p>
            {operationAccount && (
              <div className="text-xs text-muted-foreground mt-2">
                ID: {operationAccount.id.substring(0, 8)}...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Repayment Account Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Compte de Remboursements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {repaymentAccount ? (
                `${repaymentAccount.balance.toLocaleString()} ${repaymentAccount.currency}`
              ) : "N/A"}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Dédié aux remboursements de prêts
            </p>
            {repaymentAccount && (
              <div className="text-xs text-muted-foreground mt-2">
                ID: {repaymentAccount.id.substring(0, 8)}...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Savings Account Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Compte d'Épargne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {savingsAccount ? (
                `${savingsAccount.balance.toLocaleString()} ${savingsAccount.currency}`
              ) : "N/A"}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Réservé pour l'épargne des clients
            </p>
            {savingsAccount && (
              <div className="text-xs text-muted-foreground mt-2">
                ID: {savingsAccount.id.substring(0, 8)}...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transfer Button */}
      <div className="flex justify-center mt-6">
        <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[#0D6A51] hover:bg-[#0D6A51]/90">
              <ArrowDownUp className="h-4 w-4" />
              Transfert entre comptes
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfert entre comptes SFD</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="fromAccount">Compte Source</label>
                <Select value={fromAccount} onValueChange={setFromAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le compte source" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_type === 'operation' ? 'Compte Opérations' : 
                         account.account_type === 'remboursement' ? 'Compte Remboursements' : 
                         'Compte Épargne'} - {account.balance.toLocaleString()} {account.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="toAccount">Compte Destination</label>
                <Select value={toAccount} onValueChange={setToAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le compte destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_type === 'operation' ? 'Compte Opérations' : 
                         account.account_type === 'remboursement' ? 'Compte Remboursements' : 
                         'Compte Épargne'} - {account.balance.toLocaleString()} {account.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="amount">Montant</label>
                <div className="relative">
                  <BadgeDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-10"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description">Description (optionnel)</label>
                <Input
                  id="description"
                  placeholder="Raison du transfert"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button 
                className="w-full mt-4 bg-[#0D6A51] hover:bg-[#0D6A51]/90" 
                onClick={handleTransfer}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transfert en cours...
                  </>
                ) : (
                  'Effectuer le transfert'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transfer History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Historique des transferts</CardTitle>
        </CardHeader>
        <CardContent>
          {transferHistory.length > 0 ? (
            <div className="rounded-md border">
              <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b bg-muted/50">
                <div>Date</div>
                <div>De</div>
                <div>Vers</div>
                <div>Montant</div>
                <div>Description</div>
              </div>
              <div className="divide-y">
                {transferHistory.map(transfer => {
                  const fromAccount = accounts.find(a => a.id === transfer.from_account_id);
                  const toAccount = accounts.find(a => a.id === transfer.to_account_id);
                  
                  return (
                    <div key={transfer.id} className="grid grid-cols-5 gap-4 p-4 text-sm">
                      <div>{new Date(transfer.created_at).toLocaleString()}</div>
                      <div>{fromAccount ? (
                        fromAccount.account_type === 'operation' ? 'Compte Opérations' : 
                        fromAccount.account_type === 'remboursement' ? 'Compte Remboursements' : 
                        'Compte Épargne'
                      ) : 'Inconnu'}</div>
                      <div>{toAccount ? (
                        toAccount.account_type === 'operation' ? 'Compte Opérations' : 
                        toAccount.account_type === 'remboursement' ? 'Compte Remboursements' : 
                        'Compte Épargne'
                      ) : 'Inconnu'}</div>
                      <div>{transfer.amount.toLocaleString()} FCFA</div>
                      <div>{transfer.description || '-'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              Aucun transfert n'a été effectué entre les comptes SFD.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
