
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, CreditCard, ArrowUpDown, Wallet, RefreshCw, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useClientLoans } from '@/hooks/useClientLoans';
import { useSfdLoanPlans, clearLoanPlansCache } from '@/hooks/useSfdLoanPlans';
import { sfdCache } from '@/utils/cacheUtils';
import TransactionList from './TransactionList';
import MobileNavigation from './MobileNavigation';
import MobileDrawerMenu from './menu/MobileDrawerMenu';
import { Account } from '@/types/transactions';
import AccountBalance from './financial-snapshot/AccountBalance';
import ActiveLoansSection from './loans/ActiveLoansSection';

export interface MainDashboardProps {
  onAction?: (newView: string, data?: any) => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  onAction
}) => {
  const { user, activeSfdId } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch accounts data
  const { 
    accounts,
    activeSfdAccount, 
    isLoading: accountsLoading, 
    synchronizeBalances 
  } = useSfdAccounts();
  
  // Fetch loans data
  const { 
    loans, 
    isLoading: loansLoading, 
    refetchLoans 
  } = useClientLoans();
  
  // Fetch transactions
  const { 
    transactions, 
    isLoading: transactionsLoading, 
    fetchTransactions 
  } = useTransactions(user?.id, activeSfdId);
  
  // Fetch loan plans
  const {
    data: loanPlans,
    isLoading: loanPlansLoading,
    refetch: refetchLoanPlans
  } = useSfdLoanPlans();
  
  const activeLoans = loans.filter(loan => 
    loan.status === 'active' || loan.status === 'approved' || loan.status === 'disbursed'
  );
  
  // Debug cache on mount
  useEffect(() => {
    console.log("[MainDashboard] Component mounted, cache debug:");
    sfdCache.debug();
  }, []);
  
  // Function to handle global refresh
  const handleRefreshAll = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    console.log("[MainDashboard] Refreshing all data");
    
    try {
      // Clear relevant caches
      if (activeSfdId) {
        clearLoanPlansCache(activeSfdId);
      }
      
      // Refresh data
      const refreshPromises = [
        synchronizeBalances.mutateAsync(undefined),
        refetchLoans(),
        fetchTransactions(),
        refetchLoanPlans()
      ];
      
      await Promise.all(refreshPromises);
      
      console.log("[MainDashboard] All data refreshed successfully");
    } catch (error) {
      console.error("[MainDashboard] Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleOpenMenu = () => {
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };
  
  const handleLoansView = () => {
    navigate('/mobile-flow/loans');
  };
  
  const handleTransactionsView = () => {
    navigate('/mobile-flow/transactions');
  };
  
  const handlePaymentView = () => {
    navigate('/mobile-flow/payment');
  };
  
  const handleMyLoansView = () => {
    navigate('/mobile-flow/my-loans');
  };
  
  const handleNewLoan = () => {
    navigate('/mobile-flow/loan-plans');
  };

  return (
    <div className="pb-20">
      <div className="bg-[#0D6A51] text-white p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium italic">Votre partenaire financier de confiance</h2>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/10" 
              disabled={isRefreshing}
              onClick={handleRefreshAll}
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/10" 
              onClick={handleOpenMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <Card className="mt-4 bg-[#0D6A51]/20 text-white border-0 shadow-sm">
          <CardContent className="p-4">
            <AccountBalance />
            
            <div className="flex gap-2 mt-4">
              <Button 
                className="bg-white text-[#0D6A51] hover:bg-white/90 text-sm flex-1"
                onClick={handlePaymentView}
              >
                <Wallet className="h-4 w-4 mr-1" />
                Paiement
              </Button>
              <Button 
                className="bg-white/20 text-white hover:bg-white/30 text-sm flex-1"
                onClick={handleTransactionsView}
              >
                <ArrowUpDown className="h-4 w-4 mr-1" />
                Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="px-4 py-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">Actions rapides</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="border-0 shadow-sm cursor-pointer" onClick={handleTransactionsView}>
            <CardContent className="p-3 flex flex-col items-center justify-center">
              <div
                className="w-12 h-12 rounded-full bg-[#0D6A51] flex items-center justify-center mb-2"
              >
                <ArrowUpDown className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm">Transfert</span>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm cursor-pointer" onClick={handleLoansView}>
            <CardContent className="p-3 flex flex-col items-center justify-center">
              <div
                className="w-12 h-12 rounded-full bg-[#0D6A51] flex items-center justify-center mb-2"
              >
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm">Prêts</span>
            </CardContent>
          </Card>
        </div>
        
        <ActiveLoansSection 
          activeLoans={activeLoans} 
          isLoading={loansLoading} 
          onViewAll={handleMyLoansView}
          onNewLoan={handleNewLoan}
        />
        
        <TransactionList 
          transactions={transactions.slice(0, 5).map(tx => ({
            id: tx.id,
            name: tx.name || (tx.type === 'deposit' ? 'Dépôt' : tx.type === 'withdrawal' ? 'Retrait' : 'Transaction'),
            type: tx.type,
            amount: tx.type === 'deposit' || tx.amount > 0 
              ? `+${tx.amount.toLocaleString()} FCFA` 
              : `-${Math.abs(tx.amount).toLocaleString()} FCFA`,
            date: new Date(tx.date || tx.created_at || '').toLocaleDateString('fr-FR'),
            avatar: tx.avatar_url,
          }))} 
          isLoading={transactionsLoading}
          onViewAll={handleTransactionsView}
        />
      </div>

      <MobileDrawerMenu 
        isOpen={menuOpen}
        onClose={handleCloseMenu}
      />

      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
        <MobileNavigation />
      </div>
    </div>
  );
};

export default MainDashboard;
