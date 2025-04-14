
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import ContextualHeader from '@/components/mobile/ContextualHeader';
import SFDSavingsOverview from '@/components/mobile/SFDSavingsOverview';
import TransactionList from '@/components/mobile/TransactionList';
import { useMobileDashboard } from '@/hooks/useMobileDashboard';
import { Account } from '@/types/transactions';
import { useToast } from '@/hooks/use-toast';
import { formatTransactionAmount } from '@/utils/transactionUtils';

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
  
  useEffect(() => {
    if (refreshDashboardData) {
      refreshDashboardData().catch(error => {
        console.error("Erreur lors du rafraîchissement des données:", error);
      });
    }
  }, [refreshDashboardData]);
  
  const displayTransactions = transactions && transactions.length > 0 
    ? transactions 
    : (dashboardData?.transactions || []);
    
  const formatTransactionData = () => {
    return displayTransactions.map(tx => ({
      id: tx.id,
      name: tx.name || getTransactionName(tx.type),
      type: tx.type,
      amount: formatTransactionAmount(tx.amount, tx.type),
      date: formatDate(tx.date || tx.created_at),
      avatar: tx.avatar_url
    }));
  };
  
  const getTransactionName = (type: string): string => {
    switch (type) {
      case 'deposit': return 'Dépôt mensuel';
      case 'withdrawal': return 'Retrait';
      case 'loan_repayment': return 'Remboursement prêt';
      case 'loan_disbursement': return 'Décaissement de prêt';
      case 'transfer': return 'Transfert';
      default: return 'Transaction';
    }
  };
  
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateString || '';
    }
  };
  
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
        <SFDSavingsOverview account={account} />
      </div>
      
      <TransactionList 
        transactions={formatTransactionData()}
        isLoading={transactionsLoading || dashboardLoading}
        onViewAll={() => onAction('Loans')}
        title="Transactions Récentes"
      />
    </div>
  );
};

export default MainDashboard;
