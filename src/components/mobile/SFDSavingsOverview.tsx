
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useAuth } from '@/hooks/useAuth';
import { useMobileDashboard } from '@/hooks/useMobileDashboard';
import { useRealtimeSynchronization } from '@/hooks/useRealtimeSynchronization';
import { 
  SavingsHeader, 
  AccountStats, 
  BalanceDisplay,
  NoAccountState,
  LoadingState,
  ErrorState
} from './sfd-savings';

const SFDSavingsOverview = () => {
  const navigate = useNavigate();
  const { activeSfdAccount, isLoading, refetch } = useSfdAccounts();
  const { user, activeSfdId } = useAuth();
  const { dashboardData, isLoading: isDashboardLoading, refreshDashboardData } = useMobileDashboard();
  const { isSyncing, synchronizeWithSfd } = useRealtimeSynchronization();
  const [isHidden, setIsHidden] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Get active SFD data from dashboard if available
  const activeSfd = dashboardData?.sfdAccounts?.find(sfd => sfd.is_default);
  
  // Fallback if no active SFD found
  const sfdName = activeSfd?.sfds?.name || activeSfdAccount?.name || "Mon Compte SFD";
  const sfdBalance = dashboardData?.account?.balance || activeSfdAccount?.balance || 250000;
  const sfdCurrency = dashboardData?.account?.currency || activeSfdAccount?.currency || 'FCFA';
  
  // Check for updates from admin panel or SFD
  useEffect(() => {
    // Initial synchronization on component mount
    const performInitialSync = async () => {
      if (activeSfdId) {
        try {
          await synchronizeWithSfd();
          setHasError(false);
        } catch (error) {
          console.error("Synchronization error:", error);
          setHasError(true);
        }
      }
    };
    
    performInitialSync();
    
    // Set up a timer to periodically check for updates (every 5 minutes)
    const syncInterval = setInterval(() => {
      if (activeSfdId) {
        synchronizeWithSfd().catch(err => {
          console.error("Periodic sync error:", err);
        });
      }
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(syncInterval);
    };
  }, [activeSfdId, synchronizeWithSfd]);
  
  // Effect to detect account errors
  useEffect(() => {
    // If not loading and no data found, set error state
    if (!isLoading && !isDashboardLoading && !activeSfd && !activeSfdAccount && user) {
      setHasError(true);
    } else {
      setHasError(false);
    }
  }, [isLoading, isDashboardLoading, activeSfd, activeSfdAccount, user]);

  const refreshBalance = async () => {
    setIsUpdating(true);
    
    try {
      // Use synchronizeWithSfd for reliable updates
      await synchronizeWithSfd();
      
      // Refresh local data
      if (refreshDashboardData) {
        await refreshDashboardData();
      }
      await refetch();
      
      // Add a slight delay before removing the loading state
      setTimeout(() => {
        setIsUpdating(false);
        setHasError(false);
      }, 1000);
    } catch (error) {
      console.error("Error refreshing balance:", error);
      setHasError(true);
      setIsUpdating(false);
    }
  };
  
  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };

  const handleWithdrawal = () => {
    navigate('/mobile-flow/secure-payment', { state: { isWithdrawal: true } });
  };
  
  // Use fallback data instead of showing no account message
  if (hasError) {
    return (
      <ErrorState 
        message="Impossible de récupérer les informations de votre compte" 
        retryFn={refreshBalance} 
      />
    );
  }
  
  // Show loading state
  if ((isLoading || isDashboardLoading) && !sfdBalance) {
    return <LoadingState />;
  }
  
  return (
    <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
      <CardContent className="p-4">
        <SavingsHeader 
          sfdName={sfdName}
          isHidden={isHidden}
          toggleVisibility={toggleVisibility}
        />
        
        <AccountStats 
          isHidden={isHidden} 
          balance={sfdBalance}
        />
        
        <BalanceDisplay 
          isHidden={isHidden}
          balance={sfdBalance}
          currency={sfdCurrency}
          isUpdating={isUpdating || isSyncing}
          refreshBalance={refreshBalance}
          isPending={isSyncing}
        />
        
        <Button 
          className="mt-3 w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-white py-2 rounded-xl font-medium transition-colors"
          onClick={handleWithdrawal}
        >
          Effectuer un retrait
        </Button>
        
        <p className="text-sm text-gray-500 mt-2 text-center">
          Retirez vos fonds facilement via Mobile Money ou en agence SFD
        </p>
      </CardContent>
    </Card>
  );
};

export default SFDSavingsOverview;
