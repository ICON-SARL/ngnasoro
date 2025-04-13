
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import SFDSavingsOverview from '@/components/mobile/SFDSavingsOverview';
import TransactionList from '@/components/mobile/TransactionList';
import { useMobileDashboard } from '@/hooks/useMobileDashboard';
import { Account } from '@/types/transactions';
import { useToast } from '@/hooks/use-toast';
import MobileHeader from '@/components/mobile/MobileHeader';

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
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    console.log("MainDashboard mounted with account:", account);
    
    // Only refresh data on initial mount, not on re-renders
    if (!hasInitialized) {
      setHasInitialized(true);
    }
  }, [account, hasInitialized]);
  
  const handleRefreshData = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      
      if (refreshDashboardData) {
        await refreshDashboardData();
        
        toast({
          title: "Données actualisées",
          description: "Vos informations financières ont été mises à jour",
        });
      }
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
      
      toast({
        title: "Échec de l'actualisation",
        description: "Impossible de mettre à jour vos données financières",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const displayTransactions = transactions && transactions.length > 0 
    ? transactions 
    : (dashboardData?.transactions || []);
    
  const formatTransactionData = () => {
    return displayTransactions.map(tx => ({
      id: tx.id,
      name: tx.name || (tx.type === 'deposit' ? 'Dépôt' : tx.type === 'withdrawal' ? 'Retrait' : 'Transaction'),
      type: tx.type,
      amount: tx.amount.toString(),
      date: new Date(tx.date || tx.created_at).toLocaleDateString(),
      avatar: tx.avatar_url
    }));
  };
  
  return (
    <div className="space-y-4 pb-20">
      <div className="bg-[#0D6A51] text-white shadow-md relative">
        <MobileHeader showWelcomeText={false} />
      </div>
      
      <div className="px-4 py-2">
        <SFDSavingsOverview 
          account={account} 
          onRefresh={handleRefreshData}
          isRefreshing={isRefreshing}
        />
      </div>
      
      <TransactionList 
        transactions={formatTransactionData()}
        isLoading={transactionsLoading || dashboardLoading}
        onViewAll={() => onAction('Transactions')}
        title="Transactions Récentes"
      />
    </div>
  );
};

export default MainDashboard;
