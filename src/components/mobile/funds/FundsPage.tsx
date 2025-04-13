
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowUp, ArrowDown, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MobileHeader from '@/components/mobile/MobileHeader';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useSavingsAccount } from '@/hooks/useSavingsAccount';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrencyAmount } from '@/utils/transactionUtils';
import TransactionList from '@/components/mobile/TransactionList';
import { useToast } from '@/hooks/use-toast';

const FundsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    account,
    transactions,
    isLoading,
    refetch
  } = useSavingsAccount(user?.id);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      await refetch();
      
      toast({
        title: "Données actualisées",
        description: "Vos informations financières ont été mises à jour",
      });
    } catch (error) {
      console.error("Error refreshing account data:", error);
      
      toast({
        title: "Échec de l'actualisation",
        description: "Impossible de mettre à jour vos données financières",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeposit = () => {
    navigate('/mobile-flow/deposit');
  };

  const handleWithdrawal = () => {
    navigate('/mobile-flow/withdraw');
  };

  const formatTransactionData = () => {
    if (!transactions) return [];
    
    return transactions.map(tx => ({
      id: tx.id,
      name: tx.name || (tx.type === 'deposit' ? 'Dépôt' : tx.type === 'withdrawal' ? 'Retrait' : 'Transaction'),
      type: tx.type,
      amount: tx.amount.toString(),
      date: new Date(tx.created_at).toLocaleDateString(),
      avatar: tx.avatar_url
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="Mes fonds" />

      <div className="px-4 mt-4 space-y-4">
        {isLoading ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D6A51]"></div>
            </CardContent>
          </Card>
        ) : account ? (
          <>
            {/* Balance Card */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-800">Solde disponible</h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleRefresh} 
                    disabled={isRefreshing}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-8 w-8 rounded-full"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                
                <div className="my-6 text-center">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {isBalanceHidden 
                      ? '••••••' 
                      : `${formatCurrencyAmount(account.balance || 0)} ${account.currency || 'FCFA'}`}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Dernière mise à jour: {new Date(account.last_updated).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button 
                    className="rounded-lg py-2 flex items-center justify-center bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                    onClick={handleDeposit}
                  >
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Dépôt
                  </Button>
                  <Button 
                    className="rounded-lg py-2 flex items-center justify-center bg-gray-800 hover:bg-gray-700"
                    onClick={handleWithdrawal}
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Retrait
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions List */}
            <TransactionList 
              transactions={formatTransactionData()}
              isLoading={isLoading}
              onViewAll={() => navigate('/mobile-flow/transactions')}
              title="Transactions Récentes"
            />
          </>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">Aucun compte</h3>
              <p className="text-gray-500 mb-6">
                Vous n'avez pas encore de compte d'épargne associé à votre profil
              </p>
              <Button 
                className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                onClick={() => navigate('/mobile-flow/create-account')}
              >
                Créer un compte
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <MobileNavigation />
    </div>
  );
};

export default FundsPage;
