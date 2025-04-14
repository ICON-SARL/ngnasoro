
import React, { useEffect } from 'react';
import { Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AccountsSection from './sfd-accounts/AccountsSection';
import SfdVerificationDialog from './sfd-accounts/SfdVerificationDialog';
import { useSfdSwitch } from '@/hooks/useSfdSwitch';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useRealtimeSynchronization } from '@/hooks/useRealtimeSynchronization';
import { useToast } from '@/hooks/use-toast';
import ErrorState from '../sfd-savings/ErrorState';
import ViewAllSfdsButton from '../sfd/ViewAllSfdsButton';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

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
  const { synchronizeWithSfd, isSyncing, syncError, retryCount } = useRealtimeSynchronization();
  const navigate = useNavigate(); // Add the useNavigate hook here
  
  useEffect(() => {
    let isMounted = true;
    
    const syncOnMount = async () => {
      try {
        const syncResult = await synchronizeWithSfd();
        if (syncResult && isMounted) {
          await refetch();
        }
      } catch (error) {
        console.error("Failed to synchronize accounts on mount:", error);
      }
    };
    
    syncOnMount();
    
    return () => {
      isMounted = false;
    };
  }, [synchronizeWithSfd, refetch]);
  
  const pendingSfdName = React.useMemo(() => {
    if (!pendingSfdId) return '';
    
    const account = sfdAccounts?.find(sfd => sfd?.id === pendingSfdId);
    return account?.name || '';
  }, [pendingSfdId, sfdAccounts]);

  const handleVerificationComplete = async (code: string) => {
    try {
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
    } catch (error) {
      console.error("Error completing switch:", error);
      return false;
    }
  };

  const handleRetrySync = () => {
    synchronizeWithSfd()
      .then(success => {
        if (success) {
          refetch();
        }
      })
      .catch(error => {
        console.error("Error retrying sync:", error);
      });
  };

  // Show a dedicated error state if there's a sync error
  if (syncError) {
    return (
      <ErrorState 
        message={syncError}
        retryFn={handleRetrySync}
        retryCount={retryCount}
      />
    );
  }
  
  // Show loading or empty state as appropriate
  const showEmptyState = !sfdAccounts || sfdAccounts.length === 0;

  return (
    <>
      <div className="space-y-4 mt-4">
        {showEmptyState ? (
          <div className="text-center p-6 border rounded-lg">
            <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Aucun compte SFD</h3>
            <p className="text-sm text-gray-500 mb-4">
              Vous n'avez pas encore de compte SFD associé à votre profil.
            </p>
            <Button 
              onClick={() => navigate('/sfd-setup')} 
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              Ajouter un compte SFD
            </Button>
          </div>
        ) : (
          <AccountsSection 
            {...props} 
            sfdData={sfdAccounts}
            isSyncing={isSyncing}
            onRefresh={synchronizeWithSfd}
          />
        )}
        
        <div className="mt-4">
          <ViewAllSfdsButton />
        </div>
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
