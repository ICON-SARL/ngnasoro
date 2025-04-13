
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { useToast } from '@/hooks/use-toast';
import { formatCurrencyAmount } from '@/utils/transactionUtils';
import { ArrowDown, ArrowUp, Clock, RefreshCw, Lock } from 'lucide-react';
import TransactionList from '../TransactionList';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';

const TransactionsOverview: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('recent');
  const { activeSfdAccount } = useSfdAccounts();
  
  const {
    transactions,
    isLoading,
    fetchTransactions,
    getBalance
  } = useTransactions(user?.id, activeSfdId);

  // Check if the account is verified
  const isAccountVerified = activeSfdAccount ? 
    (activeSfdAccount.isVerified || activeSfdAccount.isDefault) : true;

  useEffect(() => {
    // Charger les transactions et le solde lors du montage
    fetchTransactions();
    if (isAccountVerified) {
      loadBalance();
    }
  }, [activeSfdId, isAccountVerified]);

  const loadBalance = async () => {
    const currentBalance = await getBalance();
    setBalance(currentBalance);
  };

  const refreshData = async () => {
    if (!isAccountVerified) return;
    
    await Promise.all([
      fetchTransactions(),
      loadBalance()
    ]);
    
    toast({
      title: 'Données actualisées',
      description: 'Vos transactions et solde ont été mis à jour',
    });
  };

  const handleMakeDeposit = () => {
    navigate('/mobile-flow/secure-payment');
  };

  const handleMakeWithdrawal = () => {
    navigate('/mobile-flow/secure-payment?withdrawal=true');
  };

  const formatTransactions = () => {
    return transactions.map(tx => ({
      id: tx.id,
      name: tx.name || (tx.type === 'deposit' ? 'Dépôt' : tx.type === 'withdrawal' ? 'Retrait' : 'Transaction'),
      type: tx.type,
      amount: tx.type === 'deposit' || tx.type === 'loan_disbursement' 
        ? `+${formatCurrencyAmount(tx.amount)}` 
        : `-${formatCurrencyAmount(tx.amount)}`,
      date: new Date(tx.date || tx.created_at).toLocaleDateString(),
      avatar: tx.avatar_url
    }));
  };

  return (
    <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-[#0D6A51] to-[#0D6A51]/90 p-4 text-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Solde Disponible</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              disabled={!isAccountVerified}
              onClick={refreshData}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="text-center py-4">
            {isAccountVerified ? (
              <p className="text-3xl font-bold mb-4">{formatCurrencyAmount(balance)} FCFA</p>
            ) : (
              <div className="flex flex-col items-center mb-4">
                <Lock className="h-6 w-6 mb-2" />
                <p className="text-lg font-medium">Compte en attente de validation</p>
                <p className="text-sm opacity-80 mt-1">Le solde sera disponible après validation par la SFD</p>
              </div>
            )}
            
            <div className="flex justify-center space-x-3">
              <Button 
                onClick={handleMakeDeposit}
                disabled={!isAccountVerified}
                className={`rounded-full py-2 px-4 flex items-center ${
                  isAccountVerified ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-white/10 text-white/50 cursor-not-allowed'
                }`}
              >
                <ArrowDown className="h-4 w-4 mr-2" />
                Dépôt
              </Button>
              <Button 
                onClick={handleMakeWithdrawal}
                disabled={!isAccountVerified}
                className={`rounded-full py-2 px-4 flex items-center ${
                  isAccountVerified ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-white/10 text-white/50 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                Retrait
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="recent" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="recent" className="text-sm">Transactions Récentes</TabsTrigger>
              <TabsTrigger value="scheduled" className="text-sm">Paiements Planifiés</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="recent" className="mt-0">
            <TransactionList 
              transactions={formatTransactions()}
              isLoading={isLoading}
              onViewAll={() => navigate('/mobile-flow/transactions')}
              title=""
            />
          </TabsContent>
          
          <TabsContent value="scheduled" className="mt-0 px-4 py-6">
            <div className="flex flex-col items-center justify-center text-center p-4 text-gray-500">
              <Clock className="h-12 w-12 mb-2 text-gray-400" />
              <h3 className="font-medium mb-1">Aucun paiement planifié</h3>
              <p className="text-sm">Vos paiements planifiés apparaîtront ici</p>
            </div>
          </TabsContent>
        </Tabs>
        
      </CardContent>
    </Card>
  );
};

export default TransactionsOverview;
