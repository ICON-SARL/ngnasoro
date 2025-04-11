
import React, { useState } from 'react';
import { useClientSavingsAccount } from '@/hooks/useClientSavingsAccount';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ArrowDownUp, 
  Banknote, 
  PiggyBank, 
  RefreshCw, 
  BadgeEuro, 
  CreditCard, 
  WalletCards 
} from 'lucide-react';
import { formatCurrencyAmount } from '@/utils/transactionUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface ClientSavingsAccountViewProps {
  clientId: string;
  sfdId: string;
}

const ClientSavingsAccountView: React.FC<ClientSavingsAccountViewProps> = ({ clientId, sfdId }) => {
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const { toast } = useToast();
  
  const {
    account,
    transactions,
    isLoading,
    isTransactionLoading,
    processDeposit,
    processWithdrawal,
    createAccount,
    refreshData
  } = useClientSavingsAccount();

  const handleCreateAccount = async () => {
    await createAccount(0);
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez saisir un montant valide supérieur à 0",
        variant: "destructive",
      });
      return;
    }

    const success = await processDeposit(parseFloat(amount), description);
    
    if (success) {
      setAmount('');
      setDescription('');
      setIsDepositDialogOpen(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez saisir un montant valide supérieur à 0",
        variant: "destructive",
      });
      return;
    }

    if (account && account.balance < parseFloat(amount)) {
      toast({
        title: "Solde insuffisant",
        description: "Le solde du compte est insuffisant pour ce retrait",
        variant: "destructive",
      });
      return;
    }

    const success = await processWithdrawal(parseFloat(amount), description);
    
    if (success) {
      setAmount('');
      setDescription('');
      setIsWithdrawalDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compte d'épargne</CardTitle>
          <CardDescription>Chargement des informations du compte...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // If account doesn't exist, show account creation option
  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compte d'épargne</CardTitle>
          <CardDescription>Le client n'a pas encore de compte d'épargne</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <PiggyBank className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="mb-4 text-gray-600">Aucun compte d'épargne n'est associé à ce client. Créez un compte pour permettre au client de gérer son épargne.</p>
            <Button
              onClick={handleCreateAccount}
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              <PiggyBank className="mr-2 h-4 w-4" />
              Créer un compte d'épargne
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Compte d'épargne</CardTitle>
          <CardDescription>Gestion du compte épargne client</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refreshData()}
          className="h-8 w-8 p-0"
          title="Rafraîchir"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Rafraîchir</span>
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Account Summary */}
          <div className="rounded-md bg-[#F8F9FC] p-4">
            <div className="mb-2 text-sm font-medium">Solde actuel</div>
            <div className="text-2xl font-semibold text-[#0D6A51]">
              {formatCurrencyAmount(account?.balance || 0)} {account?.currency || 'FCFA'}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Dernière mise à jour: {format(new Date(account?.last_updated || new Date()), 'PPP', { locale: fr })}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Deposit Dialog */}
            <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-[#0D6A51] hover:bg-[#0D6A51]/90">
                  <Banknote className="mr-2 h-4 w-4" />
                  Dépôt
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dépôt sur compte client</DialogTitle>
                  <DialogDescription>
                    Ajouter des fonds au compte d'épargne du client
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
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
                        min="0"
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {account?.currency || 'FCFA'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      className="col-span-3 resize-none"
                      placeholder="Motif du dépôt (optionnel)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDepositDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleDeposit}
                    disabled={!amount || parseFloat(amount) <= 0 || isTransactionLoading}
                    className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                  >
                    {isTransactionLoading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Traitement...
                      </>
                    ) : (
                      'Confirmer le dépôt'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Withdrawal Dialog */}
            <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="flex-1" 
                  variant="outline"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Retrait
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Retrait du compte client</DialogTitle>
                  <DialogDescription>
                    Retirer des fonds du compte d'épargne du client
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="withdrawal-amount" className="text-right">
                      Montant
                    </Label>
                    <div className="col-span-3 relative">
                      <Input
                        id="withdrawal-amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0"
                        max={account?.balance || 0}
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {account?.currency || 'FCFA'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="withdrawal-description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="withdrawal-description"
                      className="col-span-3 resize-none"
                      placeholder="Motif du retrait (optionnel)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsWithdrawalDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleWithdrawal}
                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > (account?.balance || 0) || isTransactionLoading}
                    variant="destructive"
                  >
                    {isTransactionLoading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Traitement...
                      </>
                    ) : (
                      'Confirmer le retrait'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Transaction History */}
          <Tabs defaultValue="transactions" className="mt-6">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="transactions">Historique des transactions</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions" className="mt-4">
              {isTransactionLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            {format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className={`mr-2 p-1 rounded-full ${
                                tx.type === 'deposit' || tx.type === 'loan_disbursement'
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-orange-100 text-orange-600'
                              }`}>
                                <ArrowDownUp className="h-3 w-3" />
                              </div>
                              {getTransactionType(tx.type)}
                            </div>
                          </TableCell>
                          <TableCell>{tx.description}</TableCell>
                          <TableCell className={`text-right font-medium ${
                            tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {tx.amount >= 0 ? '+' : ''}
                            {Math.abs(tx.amount).toLocaleString('fr-FR')} FCFA
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucune transaction pour le moment
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get transaction type label
function getTransactionType(type: string): string {
  const types: Record<string, string> = {
    'deposit': 'Dépôt',
    'withdrawal': 'Retrait',
    'loan_disbursement': 'Décaissement prêt',
    'loan_repayment': 'Remboursement prêt',
    'transfer': 'Transfert'
  };
  
  return types[type] || type;
}

export default ClientSavingsAccountView;
