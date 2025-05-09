
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import TransferOptions from './TransferOptions';
import MobileMoneyModal from '../loan/MobileMoneyModal';

const FundsActionButtons: React.FC = () => {
  const navigate = useNavigate();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleDeposit = () => {
    setShowDepositModal(true);
  };

  const handleWithdrawal = () => {
    setShowWithdrawModal(true);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-3">Actions rapides</h3>
        
        <TransferOptions 
          onDeposit={handleDeposit}
          onWithdraw={handleWithdrawal}
        />

        {/* Modals for Mobile Money operations */}
        <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
          <MobileMoneyModal 
            onClose={() => setShowDepositModal(false)}
            isWithdrawal={false}
          />
        </Dialog>

        <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
          <MobileMoneyModal 
            onClose={() => setShowWithdrawModal(false)}
            isWithdrawal={true}
          />
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default FundsActionButtons;
