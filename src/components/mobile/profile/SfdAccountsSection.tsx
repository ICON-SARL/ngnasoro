
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
        const syncResult = await synchronizeWithSfd();
        if (syncResult) {
          await refetch();
        }
      } catch (error) {
        console.error("Failed to synchronize accounts on mount:", error);
        toast({
          title: "Erreur de synchronisation",
          description: "Impossible de synchroniser vos comptes pour le moment. Veuillez réessayer plus tard.",
          variant: "destructive",
        });
      }
    };
    
    syncOnMount();
  }, [synchronizeWithSfd, refetch, toast]);
  
  // Find the name of the pending SFD
  const pendingSfdName = React.useMemo(() => {
    if (!pendingSfdId) return '';
    
    const account = sfdAccounts.find(sfd => sfd.id === pendingSfdId);
    return account?.name || '';
  }, [pendingSfdId, sfdAccounts]);

  const handleVerificationComplete = async (code: string) => {
    const success = await completeSwitch(code);
    
    if (success) {
      try {
        await synchronizeBalances.mutateAsync();
        await refetch();
        
        toast({
          title: "Synchronisation terminée",
          description: "Les données de votre nouveau compte SFD ont été synchronisées",
        });
      } catch (error) {
        console.error("Error synchronizing after verification:", error);
        toast({
          title: "Erreur de synchronisation",
          description: "La vérification a réussi mais la synchronisation a échoué. Veuillez rafraîchir la page.",
          variant: "destructive",
        });
      }
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
