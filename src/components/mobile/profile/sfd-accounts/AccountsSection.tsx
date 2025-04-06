
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { useRealtimeSynchronization } from '@/hooks/useRealtimeSynchronization';
import { useToast } from '@/hooks/use-toast';
import { SfdAccountDisplay } from './AccountsList';
import LoadingState from './LoadingState';
import EmptyAccountsState from './EmptyAccountsState';
import AccountsList from './AccountsList';
import useSfdAccountsData from './hooks/useSfdAccountsData';
import useSfdAccountSwitching from './hooks/useSfdAccountSwitching';

interface SfdAccountsSectionProps {
  sfdData?: any[];
  activeSfdId?: string | null;
  onSwitchSfd?: (sfdId: string) => Promise<boolean> | void;
}

const AccountsSection: React.FC<SfdAccountsSectionProps> = ({ 
  sfdData: propsSfdData,
  activeSfdId: propsActiveSfdId,
  onSwitchSfd
}) => {
  const { toast } = useToast();
  const { isSyncing, synchronizeWithSfd } = useRealtimeSynchronization();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Custom hooks for better separation of concerns
  const { 
    sfdAccounts, 
    effectiveActiveSfdId, 
    displayAccounts, 
    isLoading, 
    refetch 
  } = useSfdAccountsData(propsSfdData, propsActiveSfdId);
  
  const {
    switchingId,
    isVerifying,
    verificationRequired,
    pendingSfdId,
    pendingSfdName,
    handleSwitchSfd,
    handleVerificationComplete,
    cancelSwitch
  } = useSfdAccountSwitching(onSwitchSfd);

  // Synchronize accounts when the component mounts
  useEffect(() => {
    const syncAccounts = async () => {
      setIsRefreshing(true);
      try {
        await synchronizeWithSfd();
        await refetch();
      } catch (error) {
        console.error("Failed to sync accounts:", error);
      } finally {
        setIsRefreshing(false);
      }
    };
    
    syncAccounts();
  }, []);

  const refreshAccounts = async () => {
    setIsRefreshing(true);
    try {
      await synchronizeWithSfd();
      await refetch();
      toast({
        title: "Synchronisation réussie",
        description: "Vos comptes SFD ont été mis à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de mettre à jour vos comptes SFD",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2 flex justify-between items-center flex-row">
        <CardTitle className="text-lg font-bold">Mes Comptes SFD</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={refreshAccounts}
          disabled={isRefreshing || isLoading}
          className="flex items-center"
        >
          {isRefreshing ? (
            <Loader size="sm" className="mr-1" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          Actualiser
        </Button>
      </CardHeader>
      
      {isLoading || isRefreshing ? (
        <LoadingState />
      ) : displayAccounts.length === 0 ? (
        <EmptyAccountsState />
      ) : (
        <AccountsList
          accounts={displayAccounts}
          activeSfdId={effectiveActiveSfdId}
          onSwitchSfd={handleSwitchSfd}
          switchingId={switchingId}
          isVerifying={isVerifying}
        />
      )}
    </Card>
  );
};

export default AccountsSection;
