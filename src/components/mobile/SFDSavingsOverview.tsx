
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useAuth } from '@/hooks/useAuth';
import { useMobileDashboard } from '@/hooks/useMobileDashboard';
import { 
  SavingsHeader, 
  AccountStats, 
  BalanceDisplay,
  NoAccountState,
  LoadingState
} from './sfd-savings';

const SFDSavingsOverview = () => {
  const navigate = useNavigate();
  const { activeSfdAccount, isLoading, refetch, synchronizeBalances } = useSfdAccounts();
  const { activeSfdId } = useAuth();
  const { dashboardData, isLoading: isDashboardLoading, refreshDashboardData } = useMobileDashboard();
  const [isHidden, setIsHidden] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Get active SFD data from dashboard if available
  const activeSfd = dashboardData?.sfdAccounts?.find(sfd => sfd.is_default);
  const sfdName = activeSfd?.sfds?.name || activeSfdAccount?.name;
  const sfdBalance = dashboardData?.account?.balance || activeSfdAccount?.balance || 0;
  const sfdCurrency = dashboardData?.account?.currency || activeSfdAccount?.currency || 'FCFA';
  
  const refreshBalance = () => {
    setIsUpdating(true);
    
    // Use the refreshDashboardData function if available
    if (refreshDashboardData) {
      refreshDashboardData()
        .then(() => {
          setTimeout(() => {
            setIsUpdating(false);
          }, 1000);
        })
        .catch(() => {
          setIsUpdating(false);
        });
    } else {
      // Fall back to synchronizeBalances if no dashboard data
      synchronizeBalances.mutate(undefined, {
        onSettled: () => {
          refetch();
          setTimeout(() => {
            setIsUpdating(false);
          }, 1000);
        }
      });
    }
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
          isUpdating={isUpdating}
          refreshBalance={refreshBalance}
          isPending={synchronizeBalances.isPending || (isUpdating && refreshDashboardData !== undefined)}
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
