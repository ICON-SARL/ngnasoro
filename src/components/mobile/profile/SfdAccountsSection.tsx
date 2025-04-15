
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/hooks/use-toast';
import AccountsList from './AccountsList';
import LoadingState from './LoadingState';
import EmptyAccountsState from './EmptyAccountsState';
import useSfdAccountsData from './hooks/useSfdAccountsData';
import useSfdAccountSwitching from './hooks/useSfdAccountSwitching';

const SfdAccountsSection: React.FC = () => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Custom hooks for better separation of concerns
  const { 
    displayAccounts, 
    effectiveActiveSfdId, 
    isLoading, 
    refetch 
  } = useSfdAccountsData();
  
  const {
    switchingId,
    isVerifying,
    handleSwitchSfd,
  } = useSfdAccountSwitching();

  const refreshAccounts = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Synchronisation réussie",
        description: "Vos comptes SFD ont été mis à jour",
      });
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

export default SfdAccountsSection;
