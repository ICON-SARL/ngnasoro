
import React from 'react';
import SfdAccountItem from '../SfdAccountItem';
import { SfdAccountDisplay } from '../types/SfdAccountTypes';
import { getAccountStatus } from '../utils/accountStatus';

interface AccountsListContentProps {
  accounts: SfdAccountDisplay[];
  activeSfdId: string | null;
  onSwitchSfd: (sfdId: string) => Promise<void>;
  switchingId: string | null;
  isVerifying: boolean;
}

const AccountsListContent: React.FC<AccountsListContentProps> = ({
  accounts,
  activeSfdId,
  onSwitchSfd,
  switchingId,
  isVerifying
}) => {
  // Fonction pour empêcher la navigation par défaut
  const handleContainerClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-3" onClick={handleContainerClick}>
      {accounts.map((sfd) => (
        <SfdAccountItem
          key={sfd.id}
          sfd={sfd}
          status={getAccountStatus(sfd)}
          isActive={sfd.id === activeSfdId}
          onSwitchSfd={onSwitchSfd}
          isProcessing={switchingId === sfd.id || isVerifying}
        />
      ))}
    </div>
  );
};

export default AccountsListContent;
