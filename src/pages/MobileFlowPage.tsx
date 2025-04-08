
import React from 'react';
import { MobileFlow } from './MobileFlow';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '@/hooks/useTransactions';
import { useUserAccounts } from '@/hooks/useUserAccounts';

const MobileFlowPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { accounts, isLoading: accountsLoading, activeAccount, setActiveAccount } = useUserAccounts();
  const { 
    transactions, 
    isLoading: transactionsLoading, 
    refetch
  } = useTransactions();

  // No need for these properties if they're not available in useTransactions
  const fetchMoreTransactions = () => {
    console.log('Fetching more transactions...');
    refetch();
  };
  
  const hasMoreTransactions = false;

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleAction = (type: string, data?: any) => {
    switch (type) {
      case 'NAVIGATE':
        navigate(data.path);
        break;
      case 'SET_ACTIVE_ACCOUNT':
        setActiveAccount(data.accountId);
        break;
      default:
        console.log('Unknown action type:', type);
    }
  };

  // Update the props to match the required interface
  return (
    <MobileFlow
      onAction={handleAction}
      account={activeAccount}
      transactions={transactions}
      transactionsLoading={transactionsLoading}
      loadMoreTransactions={fetchMoreTransactions}
      hasMoreTransactions={hasMoreTransactions}
      accounts={accounts}
      accountsLoading={accountsLoading}
    />
  );
};

export default MobileFlowPage;
