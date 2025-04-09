
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { useToast } from '@/hooks/use-toast';
import { formatCurrencyAmount } from '@/utils/transactionUtils';
import { ArrowDown, ArrowUp, Clock, RefreshCw } from 'lucide-react';
import TransactionList from '../TransactionList';

const TransactionsOverview: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('recent');
  
  const {
    transactions,
    isLoading,
    fetchTransactions,
    getBalance
  } = useTransactions(user?.id, activeSfdId);

  useEffect(() => {
    // Charger les transactions et le solde lors du montage
    fetchTransactions();
    loadBalance();
  }, [activeSfdId]);

  const loadBalance = async () => {
    const currentBalance = await getBalance();
    setBalance(currentBalance);
  };

  const refreshData = async () => {
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
    <Card className="border-0 shadow-soft bg-white rounded-3xl overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-[#0D6A51] to-[#13A180] p-6 text-white">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Solde Disponible</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 rounded-full" 
              onClick={refreshData}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="text-center py-6">
            <p className="text-4xl font-bold mb-6">{formatCurrencyAmount(balance)} FCFA</p>
            
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={handleMakeDeposit}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full py-2 px-5 flex items-center button-glow"
              >
                <ArrowDown className="h-4 w-4 mr-2" />
                Dépôt
              </Button>
              <Button 
                onClick={handleMakeWithdrawal}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full py-2 px-5 flex items-center button-glow"
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                Retrait
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="recent" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="grid grid-cols-2 w-full rounded-full bg-gray-100/80 p-1">
              <TabsTrigger value="recent" className="text-sm rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Transactions Récentes
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="text-sm rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Paiements Planifiés
              </TabsTrigger>
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
            <div className="flex flex-col items-center justify-center text-center p-8 text-gray-500">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Clock className="h-7 w-7 text-gray-400" />
              </div>
              <h3 className="font-medium mb-2 text-lg">Aucun paiement planifié</h3>
              <p className="text-sm">Vos paiements planifiés apparaîtront ici</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TransactionsOverview;
