
import React, { useState } from 'react';
import { useSavingsAccount } from '@/hooks/useSavingsAccount';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader } from '@/components/ui/loader';
import { ArrowUpCircle, ArrowDownCircle, Wallet, HistoryIcon, AlertCircle } from 'lucide-react';
import { formatCurrencyAmount } from '@/utils/transactionUtils';

interface ClientSavingsManagementProps {
  clientId: string;
  clientName: string;
  sfdId: string;
}

const ClientSavingsManagement: React.FC<ClientSavingsManagementProps> = ({
  clientId,
  clientName,
  sfdId
}) => {
  const { user } = useAuth();
  const { 
    account, 
    transactions, 
    isLoading, 
    createAccount, 
    processDeposit 
  } = useSavingsAccount(clientId);
  
  const [activeTab, setActiveTab] = useState('account');
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  // Function to create savings account if it doesn't exist
  const handleCreateAccount = async () => {
    if (!sfdId || !clientId) return;
    
    await createAccount.mutateAsync({
      sfdId,
      initialBalance: 0
    });
  };
  
  // Process deposit transaction
  const handleDeposit = async () => {
    if (!clientId || !amount || !user?.id) return;
    
    await processDeposit.mutateAsync({
      amount: parseFloat(amount),
      description: description || `Dépôt effectué pour ${clientName}`,
      adminId: user.id
    });
    
    setIsDepositOpen(false);
    setAmount('');
    setDescription('');
  };
  
  // Format date from ISO string
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Non disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Render transaction type badge
  const renderTransactionType = (type: string) => {
    switch (type) {
      case 'deposit':
        return <span className="text-green-600">Dépôt</span>;
      case 'withdrawal':
        return <span className="text-red-600">Retrait</span>;
      case 'loan_disbursement':
        return <span className="text-blue-600">Décaissement prêt</span>;
      case 'loan_repayment':
        return <span className="text-purple-600">Remboursement prêt</span>;
      default:
        return <span>{type}</span>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader size="lg" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6 font-montserrat">
      <Card>
        <CardHeader>
          <CardTitle>Compte d'épargne - {clientName}</CardTitle>
        </CardHeader>
        <CardContent>
          {!account ? (
            <div className="text-center py-6 space-y-4">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <div>
                <h3 className="text-lg font-medium mb-1">Aucun compte d'épargne</h3>
                <p className="text-muted-foreground mb-4">Ce client n'a pas encore de compte d'épargne actif.</p>
                <Button 
                  onClick={handleCreateAccount}
                  disabled={createAccount.isPending}
                  className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                >
                  {createAccount.isPending ? (
                    <>
                      <Loader size="sm" className="mr-2" />
                      Création en cours...
                    </>
                  ) : (
                    "Créer un compte d'épargne"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="account">Détails du compte</TabsTrigger>
                <TabsTrigger value="transactions">Historique</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account">
                <div className="space-y-6">
                  <div className="p-4 bg-[#F8F9FC] rounded-xl">
                    <p className="text-sm text-[#0D6A51] mb-1">Solde disponible</p>
                    <p className="text-3xl font-semibold">
                      {formatCurrencyAmount(account.balance)} {account.currency}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                      onClick={() => setIsDepositOpen(true)}
                    >
                      <ArrowUpCircle className="mr-2 h-4 w-4" />
                      Dépôt
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-[#0D6A51]/30 text-[#0D6A51]"
                      onClick={() => setIsWithdrawalOpen(true)}
                    >
                      <ArrowDownCircle className="mr-2 h-4 w-4" />
                      Retrait
                    </Button>
                  </div>
                  
                  <div className="rounded-lg border p-4 space-y-3">
                    <h3 className="font-medium">Informations du compte</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">ID du compte</p>
                        <p>{account.id.substring(0, 8)}...</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Statut</p>
                        <p>Actif</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Dernière opération</p>
                        <p>{formatDate(account.last_updated || account.updated_at)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Devise</p>
                        <p>{account.currency}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="transactions">
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {transactions.map((transaction: any) => (
                      <div key={transaction.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{transaction.name || 'Transaction'}</p>
                            <p className="text-sm text-muted-foreground">
                              {renderTransactionType(transaction.type)} • {formatDate(transaction.created_at)}
                            </p>
                          </div>
                          <p className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrencyAmount(transaction.amount)} {account.currency}
                          </p>
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground mt-2">{transaction.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HistoryIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                    <h3 className="text-lg font-medium mb-1">Aucune transaction</h3>
                    <p className="text-muted-foreground">Ce compte n'a pas encore d'historique de transactions</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
      
      {/* Deposit Dialog */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Effectuer un dépôt</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  FCFA
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                placeholder="Détails de l'opération"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDepositOpen(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={handleDeposit}
              disabled={!amount || parseFloat(amount) <= 0 || processDeposit.isPending}
            >
              {processDeposit.isPending ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Traitement...
                </>
              ) : (
                "Confirmer le dépôt"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Withdrawal Dialog (similar to deposit dialog) */}
      <Dialog open={isWithdrawalOpen} onOpenChange={setIsWithdrawalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Effectuer un retrait</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-md border border-amber-200 mb-4">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800">
                  Le solde disponible est de {account ? formatCurrencyAmount(account.balance) : 0} FCFA. 
                  Veuillez ne pas dépasser ce montant.
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="withdrawal-amount">Montant</Label>
              <div className="relative">
                <Input
                  id="withdrawal-amount"
                  type="number"
                  placeholder="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  FCFA
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="withdrawal-description">Description (optionnel)</Label>
              <Textarea
                id="withdrawal-description"
                placeholder="Détails de l'opération"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawalOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="default"
              onClick={() => setIsWithdrawalOpen(false)}
              disabled={!amount || parseFloat(amount) <= 0 || (account && parseFloat(amount) > account.balance)}
            >
              Confirmer le retrait
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientSavingsManagement;
