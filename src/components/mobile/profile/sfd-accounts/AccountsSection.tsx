
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
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
  isSyncing?: boolean;
  onRefresh?: () => Promise<boolean>;
}

const AccountsSection: React.FC<SfdAccountsSectionProps> = ({ 
  sfdData: propsSfdData,
  activeSfdId: propsActiveSfdId,
  onSwitchSfd,
  isSyncing = false,
  onRefresh
}) => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Custom hooks for better separation of concerns
  const { 
    displayAccounts, 
    effectiveActiveSfdId, 
    isLoading, 
    refetch 
  } = useSfdAccountsData(propsSfdData, propsActiveSfdId);
  
  const {
    switchingId,
    isVerifying,
    handleSwitchSfd,
  } = useSfdAccountSwitching(onSwitchSfd);

  const refreshAccounts = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      const success = await onRefresh();
      
      if (success) {
        await refetch();
        
        toast({
          title: "Synchronisation réussie",
          description: "Vos comptes SFD ont été mis à jour",
        });
      }
    } catch (error) {
      console.error("Failed to refresh accounts:", error);
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de mettre à jour vos comptes SFD",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const isProcessing = isRefreshing || isSyncing;

  return (
    <Card>
      <CardHeader className="pb-2 flex justify-between items-center flex-row">
        <CardTitle className="text-lg font-bold">Mes Comptes SFD</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={refreshAccounts}
          disabled={isProcessing || isLoading || !onRefresh}
          className="flex items-center"
        >
          {isProcessing ? (
            <Loader size="sm" className="mr-1" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          Actualiser
        </Button>
      </CardHeader>
      
      {isLoading ? (
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
