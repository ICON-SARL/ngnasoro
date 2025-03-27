
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SecurePaymentTab from '../secure-payment';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import FundsHeader from './FundsHeader';
import FundsBalanceSection from './FundsBalanceSection';
import TransferOptions from './TransferOptions';
import AvailableChannels from './AvailableChannels';
import TransactionList from '../TransactionList';
import { formatCurrencyAmount } from '@/utils/transactionUtils';

const FundsManagementPage = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const [activeView, setActiveView] = useState<'main' | 'withdraw' | 'deposit'>('main');
  const [balance, setBalance] = useState<number>(0);
  
  const { 
    transactions, 
    isLoading: transactionsLoading, 
    fetchTransactions,
    getBalance
  } = useTransactions(user?.id, activeSfdId);
  
  useEffect(() => {
    // Charger les transactions et le solde lors du montage
    fetchTransactions();
    loadBalance();
  }, [activeSfdId]);

  const loadBalance = async () => {
    const currentBalance = await getBalance();
    setBalance(currentBalance);
  };
  
  const handleBack = () => {
    if (activeView !== 'main') {
      setActiveView('main');
    } else {
      navigate('/mobile-flow/main');
    }
  };

  const refreshData = async () => {
    await Promise.all([
      fetchTransactions(),
      loadBalance()
    ]);
  };
  
  const formatTransactionData = () => {
    return transactions.map(tx => ({
      id: tx.id,
      name: tx.name || (tx.type === 'deposit' ? 'Dépôt' : tx.type === 'withdrawal' ? 'Retrait' : 'Transaction'),
      type: tx.type,
      amount: tx.type === 'deposit' || tx.type === 'loan_disbursement' 
        ? `+${formatCurrencyAmount(tx.amount)}` 
        : `-${formatCurrencyAmount(tx.amount)}`,
      date: new Date(tx.date || tx.created_at).toLocaleDateString(),
      avatar: tx.avatar_url
    }));
  };
  
  return (
    <div className="bg-white min-h-screen">
      {activeView === 'main' ? (
        <>
          <FundsHeader onBack={handleBack} onRefresh={refreshData} />
          
          <FundsBalanceSection 
            balance={balance}
            onWithdraw={() => setActiveView('withdraw')} 
            onDeposit={() => setActiveView('deposit')} 
          />
          
          <div className="p-4 space-y-6 mt-2">
            <h2 className="text-lg font-semibold">Options de transfert</h2>
            
            <TransferOptions 
              onWithdraw={() => setActiveView('withdraw')} 
              onDeposit={() => setActiveView('deposit')} 
            />
            
            <h2 className="text-lg font-semibold mt-6">Canaux disponibles</h2>
            
            <AvailableChannels />
            
            <TransactionList 
              transactions={formatTransactionData()}
              isLoading={transactionsLoading}
              onViewAll={() => navigate('/mobile-flow/transactions')}
              title="Transactions récentes"
            />
          </div>
        </>
      ) : (
        <SecurePaymentTab onBack={handleBack} isWithdrawal={activeView === 'withdraw'} onComplete={refreshData} />
      )}
    </div>
  );
};

export default FundsManagementPage;
