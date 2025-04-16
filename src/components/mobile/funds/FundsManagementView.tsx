
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Wallet, ArrowUpDown } from 'lucide-react';
import MobileMoneyModal from '../loan/MobileMoneyModal';
import { Dialog } from '@/components/ui/dialog';

const FundsManagementView = () => {
  const navigate = useNavigate();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleBack = () => {
    navigate('/mobile-flow/main');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0D6A51] text-white p-4">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="text-white hover:bg-white/10 mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Mes fonds</h1>
        </div>
        
        <Card className="bg-[#0D6A51]/20 text-white border-0">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm opacity-90">Solde disponible</span>
            </div>
            <div className="text-2xl font-bold mb-4">25,000 FCFA</div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Actions rapides</h2>
        
        <Card className="border hover:border-primary cursor-pointer" onClick={() => setShowDepositModal(true)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Dépôt Mobile Money</h3>
                  <p className="text-xs text-gray-500">Déposez via votre compte mobile money</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border hover:border-primary cursor-pointer" onClick={() => setShowWithdrawModal(true)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <ArrowUpDown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Retrait Mobile Money</h3>
                  <p className="text-xs text-gray-500">Retirez via votre compte mobile money</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
};

export default FundsManagementView;
