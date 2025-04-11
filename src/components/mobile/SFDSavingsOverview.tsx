
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
  const { isSyncing, synchronizeWithSfd, syncError } = useRealtimeSynchronization();
  const [isHidden, setIsHidden] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("Impossible de récupérer les informations de votre compte");
  
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
        try {
          const syncResult = await synchronizeWithSfd();
          if (syncResult) {
            setHasError(false);
          } else {
            setHasError(true);
            setErrorMessage("Synchronisation échouée. Veuillez réessayer.");
          }
        } catch (error) {
          console.error("Synchronization error:", error);
          setHasError(true);
          setErrorMessage("Erreur lors de la connexion au serveur. Veuillez vérifier votre connexion.");
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
      setErrorMessage("Aucun compte SFD trouvé pour votre profil.");
    }
    
    // Check for sync errors
    if (syncError) {
      setHasError(true);
      setErrorMessage(syncError);
    } else if (syncError === null && hasError) {
      // Reset error state if syncError is cleared
      setHasError(false);
    }
  }, [isLoading, isDashboardLoading, activeSfd, activeSfdAccount, user, syncError, hasError]);

  const refreshBalance = async () => {
    setIsUpdating(true);
    setHasError(false);
    
    try {
      // Use synchronizeWithSfd for reliable updates
      const syncResult = await synchronizeWithSfd();
      
      // Refresh local data
      if (refreshDashboardData) {
        await refreshDashboardData();
      }
      await refetch();
      
      // Add a slight delay before removing the loading state
      setTimeout(() => {
        setIsUpdating(false);
        if (!syncResult) {
          setHasError(true);
          setErrorMessage("Synchronisation échouée. Veuillez réessayer.");
        }
      }, 1000);
    } catch (error) {
      console.error("Error refreshing balance:", error);
      setHasError(true);
      setErrorMessage("Erreur de connexion au serveur. Veuillez vérifier votre connexion.");
      setIsUpdating(false);
    }
  };
  
  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };

  const handleWithdrawal = () => {
    navigate('/mobile-flow/secure-payment', { state: { isWithdrawal: true } });
  };
  
  // Show a "no account" message if the user doesn't have an active SFD
  if (!activeSfdId && !isLoading && !isDashboardLoading) {
    return <NoAccountState />;
  }
  
  // Show loading state
  if (!activeSfdAccount && !activeSfd && (isLoading || isDashboardLoading)) {
    return <LoadingState />;
  }
  
  // Show error state
  if (hasError) {
    return (
      <ErrorState 
        message={errorMessage} 
        retryFn={refreshBalance} 
      />
    );
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
