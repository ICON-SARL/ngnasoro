
import React, { useState, useCallback, useEffect } from 'react';
import { CreditCard, RefreshCw, Lock } from 'lucide-react';
import { useAccount } from '@/hooks/useAccount';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useAuth } from '@/hooks/useAuth';
import { useMobileDashboard } from '@/hooks/useMobileDashboard';
import { canDisplayBalance } from '@/components/mobile/profile/sfd-accounts/utils/accountSorter';

const AccountBalance: React.FC = () => {
  const { account } = useAccount();
  const { activeSfdId } = useAuth();
  const { activeSfdAccount, isLoading, refetch, synchronizeBalances } = useSfdAccounts();
  const { dashboardData, isLoading: isDashboardLoading, refreshDashboardData } = useMobileDashboard();
  
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncPending, setIsSyncPending] = useState(false);
  
  // Check if the account is verified and can display balance
  const isAccountVerified = activeSfdAccount ? 
    (activeSfdAccount.isVerified || activeSfdAccount.isDefault) : true;
  
  // Get balance from dashboard data if available
  const accountBalance = dashboardData?.account?.balance || 
                        (activeSfdId ? (activeSfdAccount?.balance || 0) : (account?.balance || 0));
  const accountCurrency = dashboardData?.account?.currency || 
                         activeSfdAccount?.currency || account?.currency || 'FCFA';
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' ' + accountCurrency;
  };
  
  // Manual refresh function for balance
  const refreshBalance = useCallback(() => {
    if (isRefreshing || !isAccountVerified) return;
    
    setIsRefreshing(true);
    
    // Use the refreshDashboardData function if available
    if (refreshDashboardData) {
      refreshDashboardData()
        .then(() => {
          setLastUpdated(new Date());
          setIsRefreshing(false);
        })
        .catch(() => {
          setIsRefreshing(false);
        });
    } else {
      // Fall back to synchronizeBalances function
      setIsSyncPending(true);
      synchronizeBalances()
        .then(() => {
          refetch();
          setLastUpdated(new Date());
          setIsRefreshing(false);
          setIsSyncPending(false);
        })
        .catch(() => {
          setIsRefreshing(false);
          setIsSyncPending(false);
        });
    }
  }, [isRefreshing, synchronizeBalances, refetch, refreshDashboardData, isAccountVerified]);
  
  // Simulate balance update every 2 hours
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastUpdated(new Date());
    }, 2 * 60 * 60 * 1000); // 2 hours
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-2">
      <h3 className="text-sm text-gray-500 flex items-center">
        <CreditCard className="h-4 w-4 mr-1 text-[#0D6A51]" />
        Solde disponible
      </h3>
      
      {isAccountVerified ? (
        <p className="text-2xl font-bold">
          {isLoading || isDashboardLoading || isSyncPending
            ? "Chargement..." 
            : formatCurrency(accountBalance)}
        </p>
      ) : (
        <div className="flex items-center space-x-2">
          <Lock className="h-4 w-4 text-amber-500" />
          <p className="text-sm text-amber-600">En attente de validation</p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Mis à jour: {lastUpdated.toLocaleTimeString()}
        </p>
        <button 
          onClick={refreshBalance}
          disabled={isRefreshing || isSyncPending || !isAccountVerified}
          className={`text-xs flex items-center ${isAccountVerified ? 'text-blue-500' : 'text-gray-400'}`}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing || isSyncPending ? 'animate-spin' : ''}`} />
          {isRefreshing || isSyncPending ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>
    </div>
  );
};

export default AccountBalance;
