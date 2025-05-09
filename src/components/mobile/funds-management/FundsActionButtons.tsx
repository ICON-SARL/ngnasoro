
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Send, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FundsActionButtons: React.FC = () => {
  const navigate = useNavigate();

  const handleDeposit = () => {
    navigate('/mobile-flow/secure-payment', { state: { type: 'deposit' } });
  };

  const handleWithdrawal = () => {
    navigate('/mobile-flow/secure-payment', { state: { type: 'withdrawal' } });
  };
  
  const handleTransfer = () => {
    navigate('/mobile-flow/transfers');
  };

  const handleLoanRepayment = () => {
    navigate('/mobile-flow/loan-repayment');
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-3">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 border border-gray-200"
            onClick={handleDeposit}
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <ArrowDown className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm">Dépôt</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 border border-gray-200"
            onClick={handleWithdrawal}
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-2">
              <ArrowUp className="h-5 w-5 text-red-600" />
            </div>
            <span className="text-sm">Retrait</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 border border-gray-200"
            onClick={handleTransfer}
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm">Transfert</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-24 border border-gray-200"
            onClick={handleLoanRepayment}
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <Wallet className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm">Prêt</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FundsActionButtons;
