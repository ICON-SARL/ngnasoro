
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, ArrowRightLeft, PiggyBank, Landmark, FileText } from 'lucide-react';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { formatCurrencyAmount } from '@/utils/transactionUtils';
import { SfdAccount } from '@/types/sfdAccounts';

const AccountCard: React.FC<{ account: SfdAccount | undefined; title: string; icon: React.ReactNode }> = ({ 
  account, 
  title, 
  icon 
}) => {
  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
        <div className="h-5 w-5 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {account ? formatCurrencyAmount(account.balance) : '0'} FCFA
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {account?.description || 'Compte non configuré'}
        </p>
      </CardContent>
    </Card>
  );
};

const TransferForm: React.FC<{ accounts: SfdAccount[]; onTransfer: (data: any) => void; isLoading: boolean }> = ({
  accounts,
  onTransfer,
  isLoading
}) => {
  const [fromAccount, setFromAccount] = useState<string>('');
  const [toAccount, setToAccount] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccount || !toAccount || !amount) return;

    onTransfer({
      fromAccountId: fromAccount,
      toAccountId: toAccount,
      amount: parseFloat(amount),
      description
    });
  };

  const selectedFromAccount = accounts.find(a => a.id === fromAccount);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fromAccount">Compte source</Label>
          <Select value={fromAccount} onValueChange={setFromAccount}>
            <SelectTrigger id="fromAccount">
              <SelectValue placeholder="Sélectionner un compte" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.description || account.account_type} ({formatCurrencyAmount(account.balance)} FCFA)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="toAccount">Compte destination</Label>
          <Select value={toAccount} onValueChange={setToAccount}>
            <SelectTrigger id="toAccount">
              <SelectValue placeholder="Sélectionner un compte" />
            </SelectTrigger>
            <SelectContent>
              {accounts.filter(a => a.id !== fromAccount).map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.description || account.account_type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Montant (FCFA)</Label>
        <Input
          id="amount"
          type="number"
          placeholder="Montant"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
          step="1"
          max={selectedFromAccount?.balance.toString() || ''}
        />
        {selectedFromAccount && (
          <div className="text-xs text-muted-foreground">
            Solde disponible: {formatCurrencyAmount(selectedFromAccount.balance)} FCFA
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optionnel)</Label>
        <Input
          id="description"
          placeholder="Description du transfert"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!fromAccount || !toAccount || !amount || isLoading}
      >
        {isLoading ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Transfert en cours...
          </>
        ) : (
          <>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Effectuer le transfert
          </>
        )}
      </Button>
    </form>
  );
};

export function SfdAccountsManager() {
  const { 
    accounts, 
    isLoading, 
    operationAccount, 
    repaymentAccount, 
    savingsAccount,
    transferFunds,
    transferHistory,
    isLoadingHistory,
    refetchAccounts
  } = useSfdAccounts();

  const handleTransfer = async (data: any) => {
    if (!accounts.length) return;
    
    const sfdId = accounts[0].sfd_id;
    
    await transferFunds.mutateAsync({
      sfdId,
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      amount: data.amount,
      description: data.description
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Comptes SFD</h2>
        <Button variant="outline" size="sm" onClick={() => refetchAccounts()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <AccountCard 
              account={operationAccount} 
              title="Compte d'Opération" 
              icon={<Landmark className="h-5 w-5" />} 
            />
            <AccountCard 
              account={repaymentAccount} 
              title="Compte de Remboursement" 
              icon={<FileText className="h-5 w-5" />} 
            />
            <AccountCard 
              account={savingsAccount} 
              title="Compte d'Épargne" 
              icon={<PiggyBank className="h-5 w-5" />} 
            />
          </div>

          <Tabs defaultValue="transfer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transfer">Transfert de fonds</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>
            <TabsContent value="transfer">
              <Card>
                <CardHeader>
                  <CardTitle>Transférer des fonds</CardTitle>
                  <CardDescription>
                    Déplacez des fonds entre vos différents comptes SFD
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TransferForm 
                    accounts={accounts} 
                    onTransfer={handleTransfer}
                    isLoading={transferFunds.isPending}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des transferts</CardTitle>
                  <CardDescription>
                    Consultez l'historique des transferts entre comptes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingHistory ? (
                    <div className="flex justify-center items-center h-40">
                      <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : transferHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun transfert n'a été effectué entre les comptes.
                    </div>
                  ) : (
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-gray-50">
                          <tr>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">De</th>
                            <th className="px-4 py-2">Vers</th>
                            <th className="px-4 py-2">Montant</th>
                            <th className="px-4 py-2">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transferHistory.map(transfer => {
                            // Find the account names
                            const fromAccount = accounts.find(a => a.id === transfer.from_account_id);
                            const toAccount = accounts.find(a => a.id === transfer.to_account_id);
                            return (
                              <tr key={transfer.id} className="bg-white border-b">
                                <td className="px-4 py-2">
                                  {new Date(transfer.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2">
                                  {fromAccount?.description || fromAccount?.account_type || 'Inconnu'}
                                </td>
                                <td className="px-4 py-2">
                                  {toAccount?.description || toAccount?.account_type || 'Inconnu'}
                                </td>
                                <td className="px-4 py-2 font-medium">
                                  {formatCurrencyAmount(transfer.amount)} FCFA
                                </td>
                                <td className="px-4 py-2">
                                  {transfer.description || '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
