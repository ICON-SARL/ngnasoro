
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
  LoadingState
} from './sfd-savings';

const SFDSavingsOverview = () => {
  const navigate = useNavigate();
  const { activeSfdAccount, isLoading, refetch } = useSfdAccounts();
  const { activeSfdId } = useAuth();
  const { dashboardData, isLoading: isDashboardLoading, refreshDashboardData } = useMobileDashboard();
  const { isSyncing, synchronizeWithSfd } = useRealtimeSynchronization();
  const [isHidden, setIsHidden] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Get active SFD data from dashboard if available
  const activeSfd = dashboardData?.sfdAccounts?.find(sfd => sfd.is_default);
  const sfdName = activeSfd?.sfds?.name || activeSfdAccount?.name || "Premier SFD";
  const sfdBalance = dashboardData?.account?.balance || activeSfdAccount?.balance || 250000;
  const sfdCurrency = dashboardData?.account?.currency || activeSfdAccount?.currency || 'FCFA';
  
  // Check for updates from admin panel or SFD
  useEffect(() => {
    // Initial synchronization on component mount
    const performInitialSync = async () => {
      if (activeSfdId) {
        await synchronizeWithSfd();
      }
    };
    
    performInitialSync();
    
    // Set up a timer to periodically check for updates (every 5 minutes)
    const syncInterval = setInterval(() => {
      if (activeSfdId) {
        synchronizeWithSfd();
      }
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(syncInterval);
    };
  }, [activeSfdId, synchronizeWithSfd]);
  
  const refreshBalance = () => {
    setIsUpdating(true);
    
    // Use the synchronizeWithSfd function for more reliable updates
    synchronizeWithSfd().then(() => {
      // Refresh local data as well
      if (refreshDashboardData) {
        refreshDashboardData();
      }
      refetch();
      
      // Add a slight delay before removing the loading state
      setTimeout(() => {
        setIsUpdating(false);
      }, 1000);
    }).catch(() => {
      setIsUpdating(false);
    });
  };
  
  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };
  
  // Show a "no account" message if the user doesn't have an active SFD
  if (!activeSfdId && !isLoading && !isDashboardLoading) {
    return <NoAccountState />;
  }
  
  if (!activeSfdAccount && !activeSfd && (isLoading || isDashboardLoading)) {
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
          onClick={() => navigate('/mobile-flow/multi-sfd')}
        >
          Voir tous mes comptes SFD
        </Button>
      </CardContent>
    </Card>
  );
};

export default SFDSavingsOverview;
