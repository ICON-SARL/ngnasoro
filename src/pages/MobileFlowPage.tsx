
import React from 'react';
import MobileHeader from '@/components/mobile/MobileHeader';
import { MobileFlowRoutes, MobileFlowRoutesProps } from '@/components/mobile/MobileFlowRoutes';
import MobileLayout from '@/components/mobile/layout/MobileLayout';
import { useTransactions } from '@/hooks/useTransactions';
import { useUserAccounts } from '@/hooks/useUserAccounts';
import { useToast } from '@/hooks/use-toast';

const MobileFlowPage: React.FC = () => {
  const { toast } = useToast();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { accounts, isLoading: accountsLoading, activeAccount } = useUserAccounts();
  
  // Add missing functions from error messages
  const loadMoreTransactions = () => {
    // Implementation for loading more transactions
    console.log('Loading more transactions');
  };
  
  const hasMoreTransactions = false; // Set proper value based on your data

  const handleAction = (type: string, data?: any) => {
    switch(type) {
      case 'VIEW_TRANSACTIONS':
        console.log('Viewing transactions', data);
        break;
      case 'MAKE_PAYMENT':
        console.log('Making payment', data);
        break;
      default:
        console.log('Action not handled', type, data);
    }
  };

  // Create props object that matches the MobileFlowRoutesProps interface
  const flowProps: MobileFlowRoutesProps = {
    account: activeAccount,
    transactions,
    transactionsLoading,
    loadMoreTransactions,
    hasMoreTransactions,
    accounts: accounts || [],
    accountsLoading
  };

  return (
    <MobileLayout>
      <MobileHeader title="Mon Tableau de Bord" showBackButton={false} />
      <MobileFlowRoutes {...flowProps} />
    </MobileLayout>
  );
};

export default MobileFlowPage;
