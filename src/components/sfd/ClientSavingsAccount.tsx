
import React, { useState } from 'react';
import { useClientSavingsAccount } from '@/hooks/useClientSavingsAccount';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Banknote, ArrowDownUp, PiggyBank, RefreshCw, ArrowDown, ArrowUp } from 'lucide-react';

interface ClientSavingsAccountProps {
  clientId: string;
  sfdId: string;
}

const ClientSavingsAccount: React.FC<ClientSavingsAccountProps> = ({ clientId, sfdId }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  
  const {
    account,
    transactions,
    isLoading,
    isTransactionLoading,
    createAccount,
    processDeposit,
    processWithdrawal,
    refreshData
  } = useClientSavingsAccount(clientId);
  
  // Handle deposit submission
  const handleDeposit = async () => {
    if (!user?.id || !amount || parseFloat(amount) <= 0) return;
    
    const success = await processDeposit(parseFloat(amount), description);
    
    if (success) {
      // Reset form
      setAmount('');
      setDescription('');
      setIsDepositDialogOpen(false);
    }
  };
  
  // Handle withdrawal submission
  const handleWithdrawal = async () => {
    if (!user?.id || !amount || parseFloat(amount) <= 0) return;
    
    const success = await processWithdrawal(parseFloat(amount), description);
    
    if (success) {
      // Reset form
      setAmount('');
      setDescription('');
      setIsWithdrawalDialogOpen(false);
    }
  };
  
  // Handle account creation if it doesn't exist
  const handleCreateAccount = async () => {
    if (!user?.id) return;
    await createAccount(0);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D6A51]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If account doesn't exist, show creation option
  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compte d'épargne</CardTitle>
          <CardDescription>Le client n'a pas encore de compte d'épargne</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
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
          disabled={isLoading || isTransactionLoading}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Account Summary */}
          <div className="rounded-md bg-[#F8F9FC] p-4">
            <div className="mb-2 text-sm font-medium">Solde actuel</div>
            <div className="text-2xl font-semibold text-[#0D6A51]">
              {account?.balance?.toLocaleString('fr-FR')} {account?.currency || 'FCFA'}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Dernière mise à jour: {format(new Date(account?.last_updated || Date.now()), 'PPP', { locale: fr })}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-[#0D6A51] hover:bg-[#0D6A51]/90">
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Créditer le compte
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créditer le compte client</DialogTitle>
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
                    <Input
                      id="description"
                      className="col-span-3"
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
                    {isTransactionLoading ? 'Traitement...' : 'Confirmer le dépôt'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Withdrawal Dialog */}
            <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-amber-600 hover:bg-amber-700">
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Retrait
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Effectuer un retrait</DialogTitle>
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
                    <Input
                      id="withdrawal-description"
                      className="col-span-3"
                      placeholder="Motif du retrait (optionnel)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  
                  <div className="text-sm text-amber-600 col-span-4 text-right">
                    Solde disponible: {account?.balance?.toLocaleString('fr-FR')} {account?.currency || 'FCFA'}
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
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {isTransactionLoading ? 'Traitement...' : 'Confirmer le retrait'}
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
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0D6A51]"></div>
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
                            {tx.amount.toLocaleString('fr-FR')} FCFA
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

export default ClientSavingsAccount;
