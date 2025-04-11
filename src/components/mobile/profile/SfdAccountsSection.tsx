
import React, { useEffect } from 'react';
import AccountsSection from './sfd-accounts/AccountsSection';
import SfdVerificationDialog from './sfd-accounts/SfdVerificationDialog';
import { useSfdSwitch } from '@/hooks/useSfdSwitch';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useRealtimeSynchronization } from '@/hooks/useRealtimeSynchronization';
import { useToast } from '@/hooks/use-toast';

interface SfdAccountsSectionProps {
  sfdData?: any[];
  activeSfdId?: string | null;
  onSwitchSfd?: (sfdId: string) => Promise<boolean> | void;
}

const SfdAccountsSection: React.FC<SfdAccountsSectionProps> = (props) => {
  const { 
    verificationRequired, 
    pendingSfdId, 
    isVerifying,
    cancelSwitch,
    completeSwitch 
  } = useSfdSwitch();
  
  const { toast } = useToast();
  const { sfdAccounts, refetch, synchronizeBalances } = useSfdAccounts();
  const { synchronizeWithSfd, isSyncing } = useRealtimeSynchronization();
  
  // Synchronize accounts when component mounts
  useEffect(() => {
    const syncOnMount = async () => {
      try {
        await synchronizeWithSfd();
        await refetch();
      } catch (error) {
        console.error("Failed to synchronize accounts on mount:", error);
      }
    };
    
    syncOnMount();
  }, [synchronizeWithSfd, refetch]);
  
  // Find the name of the pending SFD
  const pendingSfdName = React.useMemo(() => {
    if (!pendingSfdId) return '';
    
    const account = sfdAccounts.find(sfd => sfd.id === pendingSfdId);
    return account?.name || '';
  }, [pendingSfdId, sfdAccounts]);

  const handleVerificationComplete = async (code: string) => {
    const success = await completeSwitch(code);
    
    if (success) {
      await synchronizeBalances.mutateAsync();
      refetch();
      
      toast({
        title: "Synchronisation terminée",
        description: "Les données de votre nouveau compte SFD ont été synchronisées",
      });
    }
    
    return success;
  };

  return (
    <>
      <div className="space-y-4 mt-4">
        <AccountsSection 
          {...props} 
          sfdData={sfdAccounts}
          isSyncing={isSyncing}
          onRefresh={synchronizeWithSfd}
        />
      </div>
      
      <SfdVerificationDialog 
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
