
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowDown, ArrowUp, BarChart2, Clock, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import BalanceDisplay from '@/components/mobile/sfd-savings/BalanceDisplay';
import ClientAccountState from '@/components/mobile/sfd-savings/ClientAccountState';

const MobileSavingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const { accounts, isLoading, refetchSfdAccounts } = useSfdAccounts();
  const { transactions, isLoading: transactionsLoading } = useTransactions(user?.id, activeSfdId);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  
  useEffect(() => {
    if (!isLoading && accounts.length > 0) {
      const activeAccount = accounts.find(acc => acc.sfd_id === activeSfdId) || accounts[0];
      setSelectedAccount(activeAccount);
    }
  }, [accounts, isLoading, activeSfdId]);
  
  const handleRefresh = async () => {
    setIsUpdating(true);
    try {
      await refetchSfdAccounts();
      setTimeout(() => {
        setIsUpdating(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing account:', error);
      setIsUpdating(false);
    }
  };
  
  const handleDeposit = () => {
    navigate('/mobile-flow/deposit');
  };
  
  const handleWithdraw = () => {
    navigate('/mobile-flow/withdraw');
  };
  
  const handleTransactionHistory = () => {
    navigate('/mobile-flow/transaction-history');
  };
  
  const handleManageAccount = () => {
    navigate('/mobile-flow/account-details');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#0D6A51]" />
          <p>Chargement de vos comptes...</p>
        </div>
      </div>
    );
  }
  
  // If no account is available
  if (!selectedAccount) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-4 shadow-sm flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/mobile-flow/main')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Épargne</h1>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 mb-4">Aucun compte d'épargne trouvé</p>
          <Button 
            onClick={() => navigate('/sfd-selector')}
          >
            Connecter un SFD
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/mobile-flow/main')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Épargne</h1>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsHidden(!isHidden)}
          >
            {isHidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <ClientAccountState 
          client={{
            id: user?.id || '',
            full_name: user?.user_metadata?.full_name || 'Client',
            email: user?.email || '',
            phone: user?.user_metadata?.phone || '',
            sfd_id: activeSfdId || '',
            status: 'active'
          }}
          balance={selectedAccount.balance || 0}
          onManageAccount={handleManageAccount}
        />
        
        <BalanceDisplay 
          isHidden={isHidden} 
          balance={selectedAccount.balance || 0}
          currency="FCFA"
          isUpdating={isUpdating}
          refreshBalance={handleRefresh}
          isVerified={true}
        />
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button 
            onClick={handleDeposit}
            className="h-16 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          >
            <ArrowDown className="mr-2 h-5 w-5" />
            Dépôt
          </Button>
          <Button 
            onClick={handleWithdraw}
            className="h-16 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          >
            <ArrowUp className="mr-2 h-5 w-5" />
            Retrait
          </Button>
        </div>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Transactions récentes</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-[#0D6A51]"
                onClick={handleTransactionHistory}
              >
                Voir tout
              </Button>
            </div>
            
            {transactionsLoading ? (
              <div className="py-8 flex justify-center">
                <Clock className="h-6 w-6 animate-pulse text-gray-400" />
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        tx.type === 'deposit' || tx.amount > 0 
                          ? 'bg-green-100' 
                          : 'bg-red-100'
                      }`}>
                        {tx.type === 'deposit' || tx.amount > 0 ? (
                          <ArrowDown className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUp className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.created_at || tx.date || Date.now()).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold ${
                      tx.type === 'deposit' || tx.amount > 0 
                        ? 'text-green-600' 
                        : 'text-gray-900'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} FCFA
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500">
                <BarChart2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucune transaction récente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileSavingsPage;
