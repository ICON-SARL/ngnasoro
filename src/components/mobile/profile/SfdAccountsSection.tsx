
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { SfdData } from '@/hooks/useSfdDataAccess';
import { useSfdSwitch } from '@/hooks/useSfdSwitch';
import SfdSwitchVerification from '@/components/SfdSwitchVerification';
import LoadingState from './sfd-accounts/LoadingState';
import EmptyAccountsState from './sfd-accounts/EmptyAccountsState';
import AccountsList from './sfd-accounts/AccountsList';
import { useToast } from '@/hooks/use-toast';

interface SfdAccountsSectionProps {
  sfdData?: SfdData[];
  activeSfdId?: string | null;
  onSwitchSfd?: (sfdId: string) => Promise<boolean> | void;
}

const SfdAccountsSection: React.FC<SfdAccountsSectionProps> = ({ 
  sfdData: propsSfdData,
  activeSfdId: propsActiveSfdId,
  onSwitchSfd
}) => {
  const { toast } = useToast();
  const { activeSfdId: authActiveSfdId } = useAuth();
  const { sfdAccounts, isLoading, refetch, synchronizeBalances } = useSfdAccounts();
  const { 
    isVerifying, 
    pendingSfdId, 
    verificationRequired, 
    initiateSwitch, 
    completeSwitch, 
    cancelSwitch 
  } = useSfdSwitch();
  
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  
  const effectiveActiveSfdId = propsActiveSfdId !== undefined ? propsActiveSfdId : authActiveSfdId;

  const pendingSfdName = React.useMemo(() => {
    if (!pendingSfdId) return '';
    const displayAccounts = propsSfdData || sfdAccounts;
    const pendingSfd = displayAccounts.find(sfd => sfd.id === pendingSfdId);
    return pendingSfd?.name || '';
  }, [pendingSfdId, propsSfdData, sfdAccounts]);

  const handleSwitchSfd = async (sfdId: string) => {
    setSwitchingId(sfdId);
    
    try {
      if (onSwitchSfd) {
        await onSwitchSfd(sfdId);
      } else {
        const initiated = await initiateSwitch(sfdId);
        
        if (initiated && !verificationRequired) {
          await synchronizeBalances.mutateAsync();
          refetch();
        }
      }
    } catch (error) {
      toast({
        title: "Erreur de changement",
        description: "Impossible de changer de SFD pour le moment",
        variant: "destructive",
      });
    } finally {
      setSwitchingId(null);
    }
  };

  const handleVerificationComplete = async (code: string) => {
    const success = await completeSwitch(code);
    
    if (success) {
      await synchronizeBalances.mutateAsync();
      refetch();
    }
    
    return success;
  };

  const displayAccounts = propsSfdData || sfdAccounts;

  return (
    <>
      <div className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Mes Comptes SFD</CardTitle>
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
      </div>
      
      <SfdSwitchVerification 
        isOpen={verificationRequired && !!pendingSfdId}
        onClose={cancelSwitch}
        onVerify={handleVerificationComplete}
        sfdName={pendingSfdName}
        isLoading={isVerifying}
      />
    </>
  );
};

export default SfdAccountsSection;
