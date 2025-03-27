
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useAuth } from '@/hooks/useAuth';
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
  const [isHidden, setIsHidden] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const refreshBalance = () => {
    setIsUpdating(true);
    
    // Use the synchronizeBalances mutation
    synchronizeBalances.mutate(undefined, {
      onSettled: () => {
        refetch();
        setTimeout(() => {
          setIsUpdating(false);
        }, 1000);
      }
    });
  };
  
  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };
  
  // Show a "no account" message if the user doesn't have an active SFD
  if (!activeSfdId && !isLoading) {
    return <NoAccountState />;
  }
  
  if (!activeSfdAccount && isLoading) {
    return <LoadingState />;
  }
  
  return (
    <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
      <CardContent className="p-4">
        <SavingsHeader 
          sfdName={activeSfdAccount?.name}
          isHidden={isHidden}
          toggleVisibility={toggleVisibility}
        />
        
        <AccountStats 
          isHidden={isHidden} 
          balance={activeSfdAccount?.balance}
        />
        
        <BalanceDisplay 
          isHidden={isHidden}
          balance={activeSfdAccount?.balance}
          currency={activeSfdAccount?.currency}
          isUpdating={isUpdating}
          refreshBalance={refreshBalance}
          isPending={synchronizeBalances.isPending}
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
