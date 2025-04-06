
import React from 'react';
import AccountsSection from './sfd-accounts/AccountsSection';
import SfdVerificationDialog from './sfd-accounts/SfdVerificationDialog';
import { useSfdSwitch } from '@/hooks/useSfdSwitch';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';

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
  
  const { sfdAccounts, refetch, synchronizeBalances } = useSfdAccounts();
  
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
    }
    
    return success;
  };

  return (
    <>
      <div className="space-y-4 mt-4">
        <AccountsSection {...props} />
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
