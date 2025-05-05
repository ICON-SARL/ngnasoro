
import React from 'react';
import { SfdAccountDisplay } from '../types/SfdAccountTypes';
import SfdAccountItem from '../SfdAccountItem';
import { getAccountStatus } from '../utils/accountStatus';

interface AccountsListContentProps {
  accounts: SfdAccountDisplay[];
  activeSfdId: string | null;
  onSwitchSfd: (sfdId: string) => Promise<boolean | void> | void;
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
  return (
    <div className="space-y-3">
      {accounts.map((sfd) => {
        const isActive = sfd.id === activeSfdId;
        const isProcessing = switchingId === sfd.id && isVerifying;
        const status = getAccountStatus(sfd);
        
        return (
          <SfdAccountItem
            key={sfd.id}
            sfd={sfd}
            status={status}
            isActive={isActive}
            onSwitchSfd={onSwitchSfd}
            isProcessing={isProcessing}
          />
        );
      })}
    </div>
  );
};

export default AccountsListContent;
