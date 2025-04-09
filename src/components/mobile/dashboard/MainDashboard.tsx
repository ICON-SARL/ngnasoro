
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Menu, User } from 'lucide-react';
import ContextualHeader from '@/components/mobile/ContextualHeader';
import SFDSavingsOverview from '@/components/mobile/SFDSavingsOverview';
import TransactionList from '@/components/mobile/TransactionList';
import { useMobileDashboard } from '@/hooks/useMobileDashboard';
import { Account } from '@/types/transactions';
import FinancialOverview from '../FinancialOverview';

interface MainDashboardProps {
  onAction: (action: string, data?: any) => void;
  account: Account | null;
  transactions: any[];
  transactionsLoading: boolean;
  toggleMenu: () => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  onAction,
  account,
  transactions,
  transactionsLoading,
  toggleMenu
}) => {
  const { dashboardData, isLoading: dashboardLoading, refreshDashboardData } = useMobileDashboard();
  
  return (
    <div className="space-y-5 pb-20">
      <div className="bg-gradient-to-br from-[#0D6A51] to-[#13A180] text-white p-5 rounded-b-[2.5rem] shadow-md relative">
        <div className="flex justify-between items-center mb-5">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white rounded-full h-10 w-10 hover:bg-white/10">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white rounded-full h-10 w-10 hover:bg-white/10" onClick={toggleMenu}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <ContextualHeader />
      </div>
      
      <div className="px-4 py-1">
        <SFDSavingsOverview />
      </div>
      
      <FinancialOverview />
      
      <div className="mx-4">
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
          onViewAll={() => onAction('Transactions')}
          title="Transactions Récentes"
        />
      </div>
    </div>
  );
};

export default MainDashboard;
