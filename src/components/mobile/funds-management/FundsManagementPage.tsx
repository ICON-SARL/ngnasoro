
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SecurePaymentTab from '../secure-payment';
import { useTransactions } from '@/hooks/useTransactions';
import FundsHeader from './FundsHeader';
import FundsBalanceSection from './FundsBalanceSection';
import TransferOptions from './TransferOptions';
import AvailableChannels from './AvailableChannels';
import TransactionList from '../TransactionList';

const FundsManagementPage = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'main' | 'withdraw' | 'deposit'>('main');
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  
  const handleBack = () => {
    if (activeView !== 'main') {
      setActiveView('main');
    } else {
      navigate('/mobile-flow/main');
    }
  };
  
  return (
    <div className="bg-white min-h-screen">
      {activeView === 'main' ? (
        <>
          <FundsHeader onBack={handleBack} />
          
          <FundsBalanceSection 
            onWithdraw={() => setActiveView('withdraw')} 
            onDeposit={() => navigate('/mobile-flow/secure-payment')} 
          />
          
          <div className="p-4 space-y-6 mt-2">
            <h2 className="text-lg font-semibold">Options de transfert</h2>
            
            <TransferOptions 
              onWithdraw={() => setActiveView('withdraw')} 
              onDeposit={() => navigate('/mobile-flow/secure-payment')} 
            />
            
            <h2 className="text-lg font-semibold mt-6">Canaux disponibles</h2>
            
            <AvailableChannels />
            
            <TransactionList 
              transactions={transactions.map(tx => ({
                id: tx.id,
                name: tx.name,
                type: tx.type,
                amount: tx.amount.toString(),
                date: new Date(tx.date).toLocaleDateString(),
                avatar: tx.avatar_url
              }))}
              isLoading={transactionsLoading}
              onViewAll={() => {}}
              title="Transactions récentes"
            />
          </div>
        </>
      ) : (
        <SecurePaymentTab onBack={handleBack} isWithdrawal={activeView === 'withdraw'} />
      )}
    </div>
  );
};

export default FundsManagementPage;
