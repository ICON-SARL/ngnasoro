
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import FinancialSnapshot from '@/components/mobile/financial-snapshot/FinancialSnapshot';
import TransactionList from '@/components/mobile/TransactionList';
import QuickActionsCard from '@/components/mobile/QuickActionsCard';
import { Loader } from '@/components/ui/loader';
import NoSfdAccount from '../financial-snapshot/NoSfdAccount';

interface MainDashboardProps {
  account?: any;
  transactions?: any[];
  transactionsLoading?: boolean;
  onAction: (action: string, data?: any) => void;
  toggleMenu: () => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  account,
  transactions = [],
  transactionsLoading = false,
  onAction,
  toggleMenu
}) => {
  const { user, loading } = useAuth();
  const { 
    activeSfdAccount, 
    sfdAccounts, 
    isLoading: isSfdLoading 
  } = useSfdAccounts();

  if (loading || isSfdLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader size="lg" />
      </div>
    );
  }

  const hasSfdAccount = sfdAccounts && sfdAccounts.length > 0;

  // Ensure that the transactions are in the right format for the TransactionList component
  const formattedTransactions = transactions.map(tx => ({
    id: tx.id,
    name: tx.name || tx.type,
    type: tx.type,
    amount: Number(tx.amount), // Ensure amount is a number
    date: tx.date || new Date(tx.created_at).toLocaleDateString('fr-FR'),
    avatar: tx.avatar_url,
    sfdName: tx.sfdName
  }));

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex flex-col space-y-4">
        {!hasSfdAccount ? (
          <NoSfdAccount />
        ) : (
          <FinancialSnapshot account={account} />
        )}
        
        <QuickActionsCard onAction={onAction} />
        
        <div className="flex justify-between items-center mt-4">
          <h2 className="text-xl font-bold">Transactions Récentes</h2>
          {transactions && transactions.length > 0 && (
            <button 
              className="text-[#0D6A51] hover:underline text-sm font-medium"
              onClick={() => onAction('ViewAllTransactions')}
            >
              Voir Prêts
            </button>
          )}
        </div>
        
        <TransactionList
          transactions={formattedTransactions}
          isLoading={transactionsLoading}
          maxItems={5}
          onViewAll={() => onAction('ViewAllTransactions')}
        />
      </div>
    </div>
  );
};

export default MainDashboard;
