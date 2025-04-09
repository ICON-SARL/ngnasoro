
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useRealtimeSynchronization } from '@/hooks/useRealtimeSynchronization';
import { Loader } from '@/components/ui/loader';
import TransferOptions from './TransferOptions';
import TransactionHistory from './TransactionHistory';

const FundsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sfdAccounts, isLoading } = useSfdAccounts();
  const { isSyncing, synchronizeWithSfd, lastSyncTime } = useRealtimeSynchronization();
  const [isHidden, setIsHidden] = useState(true);
  
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
  
  // Calculate total balance from all SFD accounts
  const calculateTotalBalance = () => {
    if (!sfdAccounts || sfdAccounts.length === 0) return 0;
    return sfdAccounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  };
  
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return new Date().toLocaleDateString('fr-FR');
    return date.toLocaleDateString('fr-FR');
  };
  
  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };
  
  const totalBalance = calculateTotalBalance();
  const currency = sfdAccounts && sfdAccounts.length > 0 ? sfdAccounts[0].currency : 'FCFA';
  
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
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Solde actuel</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-1 text-gray-500 hover:text-gray-700"
                onClick={toggleVisibility}
              >
                {isHidden ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 text-gray-500 hover:text-gray-700"
                onClick={() => synchronizeWithSfd()}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <Loader size="sm" className="text-[#0D6A51]" />
                ) : (
                  <RefreshCw className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          
          {isLoading || isSyncing ? (
            <div className="flex justify-center items-center h-16">
              <Loader size="md" className="text-[#0D6A51]" />
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-[#0D6A51]">
                {isHidden ? '••••••' : totalBalance.toLocaleString('fr-FR')} {currency}
              </p>
              <p className="text-sm text-gray-500">
                {isSyncing ? 
                  "Synchronisation en cours..." : 
                  `Dernière mise à jour: ${formatDate(lastSyncTime)}`}
              </p>
            </>
          )}
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
