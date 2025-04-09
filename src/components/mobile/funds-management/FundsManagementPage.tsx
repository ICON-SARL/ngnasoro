
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import TransferOptions from './TransferOptions';
import TransactionHistory from './TransactionHistory';

const FundsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleBack = () => {
    navigate('/mobile-flow');
  };
  
  const handleWithdraw = () => {
    navigate('/mobile-flow/secure-payment', { 
      state: { isWithdrawal: true } 
    });
  };
  
  const handleDeposit = () => {
    navigate('/mobile-flow/secure-payment');
  };
  
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white p-4 shadow-sm flex items-center">
        <Button 
          variant="ghost" 
          className="p-1 mr-2" 
          onClick={handleBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">Gestion des fonds</h1>
      </div>
      
      <div className="p-4 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Solde actuel</h2>
          <p className="text-3xl font-bold text-[#0D6A51]">198 500 FCFA</p>
          <p className="text-sm text-gray-500">Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Options de transfert</h2>
          <TransferOptions 
            onWithdraw={handleWithdraw}
            onDeposit={handleDeposit}
          />
        </div>
        
        <TransactionHistory />
      </div>
    </div>
  );
};

export default FundsManagementPage;
