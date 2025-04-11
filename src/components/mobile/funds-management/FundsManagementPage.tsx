
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import FundsHeader from './FundsHeader';
import FundsBalanceSection from './FundsBalanceSection';
import TransferOptions from './TransferOptions';
import AvailableChannels from './AvailableChannels';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useToast } from '@/hooks/use-toast';

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sfdAccounts } = useSfdAccounts();
  const [selectedSfd, setSelectedSfd] = useState<string>('all');
  
  const handleSelectSfd = (sfdId: string) => {
    setSelectedSfd(sfdId);
    // Normally we would fetch the balance for this specific SFD account
    console.log('Selected SFD:', sfdId);
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleWithdraw = () => {
    navigate('/mobile-flow/secure-payment', { state: { isWithdrawal: true } });
  };
  
  const handleDeposit = () => {
    navigate('/mobile-flow/secure-payment');
    toast({
      title: "Accès au paiement",
      description: "Vous allez effectuer un remboursement",
    });
  };
  
  return (
    <div className="flex flex-col h-full bg-white">
      <FundsHeader 
        onBack={handleBack} 
        onRefresh={onRefreshBalance || (() => {})}
        isRefreshing={isBalanceRefreshing}
      />
      
      <FundsBalanceSection 
        balance={balanceAmount} 
        isRefreshing={isBalanceRefreshing}
        sfdAccounts={sfdAccounts || []}
        onSelectSfd={handleSelectSfd}
        selectedSfd={selectedSfd}
        onRefresh={onRefreshBalance}
      />
      
      <div className="flex-1 px-4 pt-4 pb-20">
        <TransferOptions onWithdraw={handleWithdraw} onDeposit={handleDeposit} />
        <AvailableChannels />
      </div>
    </div>
  );
};

export default FundsManagementPage;
