import React from 'react';
import { Account } from '@/types/transactions';

interface MainDashboardProps {
  account: Account;
  transactions: any[];
  transactionsLoading?: boolean;
  toggleMenu: () => void;
  onAction: (action: string, data?: any) => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ 
  account, 
  transactions, 
  transactionsLoading = false,
  toggleMenu,
  onAction
}) => {
  return (
    <div className="space-y-4 pb-20">
      <div className="bg-gradient-to-b from-[#0D6A51] to-[#0D6A51]/90 text-white p-4 rounded-b-3xl shadow-md relative">
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="sm" className="text-white p-1 hover:bg-white/10" onClick={toggleMenu}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <ContextualHeader />
      </div>
      
      <div className="px-4 py-2">
        <SFDSavingsOverview />
      </div>
      
      <TransactionList 
        transactions={(dashboardData?.transactions || transactions).map(tx => ({
          id: tx.id,
          name: tx.name,
          type: tx.type,
          amount: tx.amount.toString(),
          date: new Date(tx.date).toLocaleDateString(),
          avatar: tx.avatar_url
        }))}
        isLoading={transactionsLoading || dashboardLoading}
        onViewAll={() => onAction('Loans')}
        title="Transactions Récentes"
      />
    </div>
  );
};

export default MainDashboard;
