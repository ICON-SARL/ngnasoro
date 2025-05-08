
import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  ArrowLeftRight, 
  AreaChart,
  CreditCard,
  Clock,
  ArrowUp,
  ArrowDown,
  Plus,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatters';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeSynchronization } from '@/hooks/useRealtimeSynchronization';
import { useToast } from '@/hooks/use-toast';
import FundsBalanceSection from './FundsBalanceSection';
import TransactionCard from '../transactions/TransactionCard';
import { Badge } from '@/components/ui/badge';
import { normalizeSfdAccounts } from '@/utils/accountAdapters';

const FundsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeSfdId } = useAuth();
  const { accounts, sfdAccounts, isLoading, refetch } = useSfdAccounts();
  const { synchronizeWithSfd, isSyncing } = useRealtimeSynchronization();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('accounts');
  const [selectedSfd, setSelectedSfd] = useState<string>(activeSfdId || 'all');
  
  // Ensure we have the normalized accounts data with consistent properties
  const normalizedAccounts = normalizeSfdAccounts(accounts);
  
  useEffect(() => {
    if (activeSfdId) {
      setSelectedSfd(activeSfdId);
    }
  }, [activeSfdId]);

  // Mock recent transactions for demonstration
  const recentTransactions = [
    {
      id: '1',
      name: 'Dépôt',
      type: 'deposit',
      amount: 25000,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      id: '2',
      name: 'Retrait',
      type: 'withdrawal',
      amount: -10000,
      date: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
    {
      id: '3',
      name: 'Remboursement de prêt',
      type: 'loan_repayment',
      amount: -15000,
      date: new Date(Date.now() - 1000 * 60 * 60 * 72),
    }
  ];
  
  // Calculate total balance from all accounts
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  
  const refreshBalances = async () => {
    try {
      const success = await synchronizeWithSfd(true);
      if (success) {
        await refetch();
        toast({
          title: 'Synchronisation réussie',
          description: 'Les soldes de vos comptes ont été mis à jour'
        });
      }
    } catch (error) {
      console.error('Error refreshing balances:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de synchroniser vos comptes en ce moment',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse w-full h-32 bg-gray-100 rounded-lg mb-4"></div>
        <div className="animate-pulse w-full h-64 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <FundsBalanceSection
        balance={totalBalance}
        isRefreshing={isSyncing}
        onRefresh={refreshBalances}
        sfdAccounts={normalizeSfdAccounts(sfdAccounts)}
        onSelectSfd={setSelectedSfd}
        selectedSfd={selectedSfd}
      />
      
      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="accounts">Comptes</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts" className="space-y-4">
            {accounts.length > 0 ? (
              accounts.map((account) => (
                <Card key={account.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center p-4">
                      <div className={`p-2 rounded-full mr-3 ${account.account_type === 'operation' ? 'bg-blue-100' : account.account_type === 'epargne' ? 'bg-green-100' : 'bg-amber-100'}`}>
                        {account.account_type === 'operation' ? (
                          <CreditCard className={`h-5 w-5 text-blue-500`} />
                        ) : account.account_type === 'epargne' ? (
                          <Coins className={`h-5 w-5 text-green-500`} />
                        ) : (
                          <Clock className={`h-5 w-5 text-amber-500`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {account.description || `Compte ${account.account_type}`}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {account.account_type === 'operation' ? 'Compte courant' : 
                           account.account_type === 'epargne' ? 'Compte d\'épargne' : 'Compte de remboursement'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(account.balance)}</p>
                        <p className="text-xs text-gray-500">{account.currency}</p>
                      </div>
                    </div>
                    <div className="border-t px-4 py-2 flex justify-between">
                      <Badge variant="outline" className="bg-gray-50">
                        {account.id}
                      </Badge>
                      {account.sfd_id && (
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/account/${account.sfd_id}`)}>
                          Détails
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-6">
                <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Aucun compte</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Vous n'avez pas encore de comptes dans cette SFD.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/account/sfds')}
                >
                  Gérer mes SFDs
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="actions">
            <div className="grid grid-cols-2 gap-4">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <Button 
                    variant="ghost" 
                    className="w-full h-full flex flex-col items-center justify-center p-6"
                    onClick={() => navigate('/deposit')}
                  >
                    <div className="bg-green-100 p-3 rounded-full mb-2">
                      <ArrowDown className="h-6 w-6 text-green-500" />
                    </div>
                    <span>Dépôt</span>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <Button 
                    variant="ghost" 
                    className="w-full h-full flex flex-col items-center justify-center p-6"
                    onClick={() => navigate('/withdraw')}
                  >
                    <div className="bg-amber-100 p-3 rounded-full mb-2">
                      <ArrowUp className="h-6 w-6 text-amber-500" />
                    </div>
                    <span>Retrait</span>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <Button 
                    variant="ghost" 
                    className="w-full h-full flex flex-col items-center justify-center p-6"
                    onClick={() => navigate('/transfer')}
                  >
                    <div className="bg-blue-100 p-3 rounded-full mb-2">
                      <ArrowLeftRight className="h-6 w-6 text-blue-500" />
                    </div>
                    <span>Transfert</span>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <Button 
                    variant="ghost" 
                    className="w-full h-full flex flex-col items-center justify-center p-6"
                    onClick={() => navigate('/savings')}
                  >
                    <div className="bg-purple-100 p-3 rounded-full mb-2">
                      <Coins className="h-6 w-6 text-purple-500" />
                    </div>
                    <span>Épargne</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map(transaction => (
                  <TransactionCard 
                    key={transaction.id}
                    transaction={transaction}
                    onClick={() => navigate(`/transaction/${transaction.id}`)}
                  />
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/transactions')}
                >
                  Voir tout l'historique
                </Button>
              </div>
            ) : (
              <div className="text-center p-6">
                <AreaChart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Aucune transaction</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Vous n'avez pas encore effectué de transactions.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {selectedSfd !== 'all' && (
        <Button
          className="fixed bottom-20 right-4 bg-[#0D6A51] hover:bg-[#0D6A51]/90 rounded-full h-14 w-14 p-0"
          onClick={() => navigate('/deposit')}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default FundsManagementPage;
