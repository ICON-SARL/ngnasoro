
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSfdSwitch } from '@/hooks/useSfdSwitch';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';

export default function useSfdAccountSwitching(
  onSwitchSfd?: (sfdId: string) => Promise<boolean> | void
) {
  const { toast } = useToast();
  const { synchronizeBalances, refetch } = useSfdAccounts();
  const { 
    isVerifying, 
    pendingSfdId, 
    verificationRequired, 
    initiateSwitch, 
    completeSwitch, 
    cancelSwitch 
  } = useSfdSwitch();
  
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const pendingSfdName = useMemo(() => {
    if (!pendingSfdId) return '';
    
    // Since we don't have access to the accounts here,
    // we'll rely on the parent component to pass the name if needed
    return '';
  }, [pendingSfdId]);
  
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

  return {
    switchingId,
    isVerifying,
    verificationRequired,
    pendingSfdId,
    pendingSfdName,
    handleSwitchSfd,
    handleVerificationComplete,
    cancelSwitch
  };
}
