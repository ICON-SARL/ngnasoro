
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import FundsHeader from './FundsHeader';
import FundsBalanceSection from './FundsBalanceSection';
import TransferOptions from './TransferOptions';
import AvailableChannels from './AvailableChannels';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';

interface FundsManagementPageProps {
  balanceAmount?: number;
  isBalanceRefreshing?: boolean;
  onRefreshBalance?: () => void;
}

const FundsManagementPage: React.FC<FundsManagementPageProps> = ({ 
  balanceAmount = 0,
  isBalanceRefreshing = false,
  onRefreshBalance
}) => {
  const { user } = useAuth();
  const { sfdAccounts } = useSfdAccounts();
  const [selectedSfd, setSelectedSfd] = useState<string>('all');
  
  const handleSelectSfd = (sfdId: string) => {
    setSelectedSfd(sfdId);
    // Normally we would fetch the balance for this specific SFD account
    console.log('Selected SFD:', sfdId);
  };
  
  return (
    <div className="flex flex-col h-full bg-white">
      <FundsHeader />
      
      <FundsBalanceSection 
        balance={balanceAmount} 
        isRefreshing={isBalanceRefreshing}
        sfdAccounts={sfdAccounts || []}
        onSelectSfd={handleSelectSfd}
        selectedSfd={selectedSfd}
        onRefresh={onRefreshBalance}
      />
      
      <div className="flex-1 px-4 pt-4 pb-20">
        <TransferOptions />
        <AvailableChannels />
      </div>
    </div>
  );
};

export default FundsManagementPage;
