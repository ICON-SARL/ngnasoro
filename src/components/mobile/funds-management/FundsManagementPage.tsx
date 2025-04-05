
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SecurePaymentTab from '../secure-payment';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useMobileDashboard } from '@/hooks/useMobileDashboard';
import { useRealtimeSynchronization } from '@/hooks/useRealtimeSynchronization';
import { useToast } from '@/hooks/use-toast';
import FundsHeader from './FundsHeader';
import FundsBalanceSection from './FundsBalanceSection';
import TransferOptions from './TransferOptions';
import AvailableChannels from './AvailableChannels';
import TransactionList from '../TransactionList';
import { formatCurrencyAmount } from '@/utils/transactionUtils';

const FundsManagementPage = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'main' | 'withdraw' | 'deposit'>('main');
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Utiliser useSfdAccounts pour récupérer les comptes SFD
  const { sfdAccounts, refetch: refetchSfdAccounts } = useSfdAccounts();
  
  // Utiliser le hook de synchronisation
  const { isSyncing, synchronizeWithSfd } = useRealtimeSynchronization();
  
  // Utiliser le hook du dashboard mobile pour les données globales
  const { dashboardData, refreshDashboardData } = useMobileDashboard();
  
  const { 
    transactions, 
    isLoading: transactionsLoading, 
    fetchTransactions
  } = useTransactions(user?.id, activeSfdId);
  
  useEffect(() => {
    // Charger les transactions lors du montage
    fetchTransactions();
    calculateTotalBalance();
  }, [activeSfdId, sfdAccounts]);

  // Calculer le solde total à partir de tous les comptes SFD
  const calculateTotalBalance = () => {
    if (sfdAccounts && sfdAccounts.length > 0) {
      const total = sfdAccounts.reduce((sum, account) => sum + (account.balance || 0), 0);
      setTotalBalance(total);
    } else if (dashboardData?.account?.balance) {
      setTotalBalance(dashboardData.account.balance);
    } else {
      setTotalBalance(0);
    }
  };
  
  const handleBack = () => {
    if (activeView !== 'main') {
      setActiveView('main');
    } else {
      navigate('/mobile-flow/main');
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    
    try {
      // Synchronisation avec les SFDs
      await synchronizeWithSfd();
      
      // Rafraîchir les données du dashboard
      if (refreshDashboardData) {
        await refreshDashboardData();
      }
      
      // Rafraîchir les comptes SFD
      await refetchSfdAccounts();
      
      // Récupérer les transactions
      await fetchTransactions();
      
      // Recalculer le solde total
      calculateTotalBalance();
      
      toast({
        title: "Données actualisées",
        description: "Vos soldes et transactions ont été mis à jour",
      });
    } catch (error) {
      console.error("Erreur lors de l'actualisation:", error);
      toast({
        title: "Erreur d'actualisation",
        description: "Impossible de mettre à jour vos données",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const formatTransactionData = () => {
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
    <div className="bg-white min-h-screen">
      {activeView === 'main' ? (
        <>
          <FundsHeader 
            onBack={handleBack} 
            onRefresh={refreshData} 
            isRefreshing={isRefreshing || isSyncing}
          />
          
          <FundsBalanceSection 
            balance={totalBalance}
            isRefreshing={isRefreshing || isSyncing}
            onWithdraw={() => setActiveView('withdraw')} 
            onDeposit={() => setActiveView('deposit')} 
          />
          
          <div className="p-4 space-y-6 mt-2">
            <h2 className="text-lg font-semibold">Options de transfert</h2>
            
            <TransferOptions 
              onWithdraw={() => setActiveView('withdraw')} 
              onDeposit={() => setActiveView('deposit')} 
            />
            
            <h2 className="text-lg font-semibold mt-6">Canaux disponibles</h2>
            
            <AvailableChannels />
            
            <TransactionList 
              transactions={formatTransactionData()}
              isLoading={transactionsLoading}
              onViewAll={() => navigate('/mobile-flow/transactions')}
              title="Transactions récentes"
            />
          </div>
        </>
      ) : (
        <SecurePaymentTab onBack={handleBack} isWithdrawal={activeView === 'withdraw'} onComplete={refreshData} />
      )}
    </div>
  );
};

export default FundsManagementPage;
