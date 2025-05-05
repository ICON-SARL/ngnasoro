import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import TransactionList, { TransactionListItem } from '../TransactionList';
import { formatCurrencyAmount } from '@/utils/transactionUtils';
import { supabase } from '@/integrations/supabase/client';
import { SfdAccountDisplay } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';

const FundsManagementPage = () => {
  const navigate = useNavigate();
  const { user, activeSfdId, setActiveSfdId } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'main' | 'withdraw' | 'deposit'>('main');
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedSfd, setSelectedSfd] = useState<string>('all');
  
  const { accounts, sfdAccounts, refetch: refetchSfdAccounts } = useSfdAccounts();
  
  const { 
    transactions, 
    isLoading: transactionsLoading, 
    fetchTransactions
  } = useTransactions(user?.id, selectedSfd !== 'all' ? selectedSfd : undefined);
  
  const { isSyncing, synchronizeWithSfd } = useRealtimeSynchronization();
  
  const { dashboardData, refreshDashboardData } = useMobileDashboard();

  // Map SfdClientAccount array to SfdAccountDisplay array
  const mapToSfdAccountDisplay = useCallback((accounts) => {
    return accounts.map(acc => ({
      id: acc.id,
      name: acc.name || acc.description || `Account ${acc.account_type || ''}`,
      balance: acc.balance || 0,
      currency: acc.currency || 'FCFA',
      code: acc.code || '',
      region: acc.region || '',
      logo_url: acc.logoUrl || acc.logo_url,
      is_default: acc.isDefault || false,
      isVerified: acc.isVerified !== false,
      isActive: acc.id === selectedSfd,
      status: acc.status || 'active',
      description: acc.description || acc.name
    }));
  }, [selectedSfd]);

  // Subscribe to account changes
  useEffect(() => {
    if (!user?.id) return;
    
    const channel = supabase
      .channel('account-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accounts',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Account changed, refreshing data');
          calculateBalanceForSelectedSfd();
          refetchSfdAccounts();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetchSfdAccounts]);
  
  useEffect(() => {
    fetchTransactions();
    calculateBalanceForSelectedSfd();
  }, [selectedSfd, sfdAccounts]);

  const calculateBalanceForSelectedSfd = useCallback(() => {
    if (selectedSfd === 'all') {
      if (sfdAccounts && sfdAccounts.length > 0) {
        const total = sfdAccounts.reduce((sum, account) => sum + (account.balance || 0), 0);
        console.log('Calculating total balance across all SFDs:', total, sfdAccounts);
        setTotalBalance(total);
      } else if (dashboardData?.account?.balance) {
        setTotalBalance(dashboardData.account.balance);
      } else {
        setTotalBalance(0);
      }
    } else {
      const selectedAccount = sfdAccounts.find(account => account.id === selectedSfd);
      console.log('Selected SFD account balance:', selectedAccount?.balance, selectedAccount);
      setTotalBalance(selectedAccount?.balance || 0);
    }
  }, [selectedSfd, sfdAccounts, dashboardData]);

  const handleSfdSelection = (sfdId: string) => {
    setSelectedSfd(sfdId);
    if (sfdId !== 'all') {
      setActiveSfdId(sfdId);
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
      // Call the Edge Function to synchronize accounts
      await synchronizeWithSfd();
      
      // Refresh the dashboard data (includes latest balances)
      if (refreshDashboardData) {
        await refreshDashboardData();
      }
      
      // Refresh SFD accounts
      await refetchSfdAccounts();
      
      // Get latest transactions
      await fetchTransactions();
      
      // Recalculate balance
      calculateBalanceForSelectedSfd();
      
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
    })) as TransactionListItem[];
  };
  
  const selectedSfdAccount = selectedSfd !== 'all' 
    ? sfdAccounts.find(account => account.id === selectedSfd) 
    : undefined;
  
  useEffect(() => {
    // Initial data load
    refreshData();
  }, []);
  
  return (
    <div className="bg-gray-50 min-h-screen">
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
            sfdAccounts={mapToSfdAccountDisplay(sfdAccounts)}
            onSelectSfd={handleSfdSelection}
            selectedSfd={selectedSfd}
          />
          
          <div className="p-5 space-y-6 mt-2">
            <h2 className="text-lg font-semibold text-gray-800">Options de transfert</h2>
            
            <TransferOptions 
              onWithdraw={() => setActiveView('withdraw')} 
              onDeposit={() => setActiveView('deposit')} 
            />
            
            <h2 className="text-lg font-semibold text-gray-800 mt-6">Canaux disponibles</h2>
            
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
        <SecurePaymentTab 
          onBack={handleBack} 
          isWithdrawal={activeView === 'withdraw'} 
          onComplete={refreshData}
          selectedSfdId={selectedSfd !== 'all' ? selectedSfd : undefined}
        />
      )}
    </div>
  );
};

export default FundsManagementPage;
