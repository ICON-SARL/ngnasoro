
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { SfdAccountDisplay } from './types/SfdAccountTypes';
import AddSfdButton from './components/AddSfdButton';
import AccountsListContent from './components/AccountsListContent';
import { sortAccounts } from './utils/accountSorter';

// Re-export SfdAccountDisplay type
export type { SfdAccountDisplay } from './types/SfdAccountTypes';

interface AccountsListProps {
  accounts: SfdAccountDisplay[];
  activeSfdId: string | null;
  onSwitchSfd: (sfdId: string) => Promise<void>;
  switchingId: string | null;
  isVerifying: boolean;
  onAddSfd?: () => void;
}

const AccountsList: React.FC<AccountsListProps> = ({
  accounts,
  activeSfdId,
  onSwitchSfd,
  switchingId,
  isVerifying,
  onAddSfd
}) => {
  // Sort accounts using our utility function
  const sortedAccounts = sortAccounts(accounts);
  
  return (
    <CardContent className="pt-0">
      <div className="space-y-3">
        <AccountsListContent
          accounts={sortedAccounts}
          activeSfdId={activeSfdId}
          onSwitchSfd={onSwitchSfd}
          switchingId={switchingId}
          isVerifying={isVerifying}
        />

        <AddSfdButton onAddSfd={onAddSfd} />
      </div>
    </CardContent>
  );
};

export default AccountsList;
