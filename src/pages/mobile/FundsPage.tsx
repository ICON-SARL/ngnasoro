
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import FundsHeader from '@/components/funds/FundsHeader';
import FundsBalanceSection from '@/components/funds/FundsBalanceSection';
import QuickActionsSection from '@/components/funds/QuickActionsSection';
import MobileMoneyDialog from '@/components/funds/MobileMoneyDialog';
import { useBalanceManagement } from '@/hooks/funds/useBalanceManagement';

const FundsPage = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  
  const {
    currentBalance,
    isRefreshing,
    fetchBalance,
    handleRefresh
  } = useBalanceManagement(user?.id, activeSfdId);

  // Initial balance fetch
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Real-time sync
  useRealtimeSync({
    table: 'transactions',
    filter: user?.id ? `user_id=eq.${user.id}` : undefined,
    onInsert: fetchBalance
  });

  const handleBack = () => navigate('/mobile-flow/main');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <FundsHeader 
        onBack={handleBack}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <FundsBalanceSection 
        balance={currentBalance}
        isRefreshing={isRefreshing}
      />

      <QuickActionsSection 
        onDeposit={() => setShowDepositDialog(true)}
        onWithdraw={() => setShowWithdrawDialog(true)}
      />

      <MobileMoneyDialog 
        open={showDepositDialog}
        onClose={() => setShowDepositDialog(false)}
        isWithdrawal={false}
      />

      <MobileMoneyDialog 
        open={showWithdrawDialog}
        onClose={() => setShowWithdrawDialog(false)}
        isWithdrawal={true}
      />
    </div>
  );
};

export default FundsPage;
