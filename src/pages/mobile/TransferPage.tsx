
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TransferOptions from '@/components/mobile/funds-management/TransferOptions';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState } from 'react';
import MobileMoneyModal from '@/components/mobile/loan/MobileMoneyModal';

export default function TransferPage() {
  const navigate = useNavigate();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  const handleBack = () => {
    navigate('/mobile-flow/main');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 bg-white shadow-sm">
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 mr-2 text-[#0D6A51]" 
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#0D6A51]">Transfert</h1>
            <p className="text-gray-500 text-sm">Dépôt et retrait via Mobile Money</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <TransferOptions 
          onWithdraw={() => setShowWithdrawModal(true)}
          onDeposit={() => setShowDepositModal(true)}
        />
      </div>

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
    </div>
  );
}
