
import React, { useEffect } from 'react';
import { Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AccountsSection from './sfd-accounts/AccountsSection';
import { useSfdSwitch } from '@/hooks/useSfdSwitch';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useRealtimeSynchronization } from '@/hooks/useRealtimeSynchronization';
import { useToast } from '@/hooks/use-toast';
import ErrorState from '../sfd-savings/ErrorState';
import { Button } from '@/components/ui/button';

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
  const navigate = useNavigate();

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

  if (syncError) {
    return (
      <ErrorState 
        message={syncError}
        retryFn={handleRetrySync}
        retryCount={retryCount}
      />
    );
  }
  
  const showEmptyState = !sfdAccounts || sfdAccounts.length === 0;

  return (
    <>
      <div className="space-y-4 mt-4">
        {showEmptyState ? (
          <div className="text-center p-6 border rounded-lg">
            <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Aucun compte SFD</h3>
            <p className="text-sm text-gray-500 mb-4">
              Seul un administrateur SFD peut vous ajouter à un compte.
            </p>
            <Button 
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={() => {
                toast({
                  title: "Demande de compte SFD",
                  description: "Contactez votre SFD pour l'ajout de votre compte."
                });
              }}
            >
              Contacter un SFD
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
      </div>
    </>
  );
};

export default SfdAccountsSection;

