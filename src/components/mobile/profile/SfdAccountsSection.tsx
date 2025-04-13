
import React, { useEffect } from 'react';
import { Building, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import AccountsSection from './sfd-accounts/AccountsSection';
import SfdVerificationDialog from './sfd-accounts/SfdVerificationDialog';
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
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sfdAccounts, refetch, synchronizeBalances } = useSfdAccounts();
  const { synchronizeWithSfd, isSyncing, syncError, retryCount } = useRealtimeSynchronization();
  
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

  const handleRetrySync = () => {
    synchronizeWithSfd()
      .then(success => {
        if (success) {
          refetch();
        }
      });
  };

  const viewAllSfds = () => {
    navigate('/mobile-flow/sfds');
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

  // Display only first 2 SFDs and "View All" button
  const displayedSfds = sfdAccounts.slice(0, 2);

  return (
    <>
      <div className="space-y-4 mt-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">Mes SFDs</h3>
              <Button 
                variant="ghost" 
                className="flex items-center p-0 h-auto text-[#0D6A51]"
                onClick={viewAllSfds}
              >
                Voir tout <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {displayedSfds.map((sfd, index) => (
                <div 
                  key={sfd.id}
                  onClick={() => navigate(`/mobile-flow/sfd/${sfd.id}`)}
                  className={`flex items-center p-3 rounded-lg cursor-pointer ${
                    index === 0 ? 'bg-[#E8F5F0]' : 'bg-white border border-gray-100'
                  }`}
                >
                  <div className={`p-2 rounded-md mr-3 ${
                    index === 0 ? 'bg-white/60' : 'bg-gray-100'
                  }`}>
                    <Building className={`h-5 w-5 ${
                      index === 0 ? 'text-[#0D6A51]' : 'text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <h4 className={`font-medium ${
                      index === 0 ? 'text-[#0D6A51]' : 'text-gray-800'
                    }`}>{sfd.name}</h4>
                    <p className="text-gray-500 text-sm">{sfd.code}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
