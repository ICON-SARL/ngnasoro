
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileMenu from './MobileMenu';
import MobileHeader from './MobileHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, CreditCard, ArrowUpDown, Wallet } from 'lucide-react';
import TransactionList, { TransactionListItem } from './TransactionList';
import { useAuth } from '@/hooks/useAuth';
import { useClientLoans } from '@/hooks/useClientLoans';
import { useTransactions } from '@/hooks/useTransactions';
import ActiveLoansSection from './loans/ActiveLoansSection';
import { formatCurrencyAmount } from '@/utils/transactionUtils';
import Footer from '@/components/Footer';
import MobileNavigation from './MobileNavigation';

const MobileMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const { loans = [], isLoading: loansLoading, refetch: refetchLoans } = useClientLoans();
  
  const { transactions, isLoading: transactionsLoading, fetchTransactions } = useTransactions(user?.id);
  
  const activeLoans = loans.filter(loan => 
    loan.status === 'active' || loan.status === 'approved' || loan.status === 'disbursed'
  );

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const formattedTransactions: TransactionListItem[] = transactions.slice(0, 5).map(tx => ({
    id: tx.id,
    name: tx.name || (tx.type === 'deposit' ? 'Dépôt' : tx.type === 'withdrawal' ? 'Retrait' : 'Transaction'),
    type: tx.type,
    amount: tx.type === 'deposit' || tx.type === 'loan_disbursement' 
      ? `+${formatCurrencyAmount(tx.amount)}` 
      : `-${formatCurrencyAmount(Math.abs(tx.amount))}`,
    date: new Date(tx.date || tx.created_at || '').toLocaleDateString('fr-FR'),
    avatar: tx.avatar_url,
  }));
  
  return (
    <div className="pb-16">
      <MobileHeader />
      
      <div className="px-4 py-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">Actions rapides</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex flex-col items-center justify-center">
              <Button
                className="w-12 h-12 rounded-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 mb-2"
                onClick={() => navigate('/mobile-flow/transfer')}
              >
                <ArrowUpDown className="h-5 w-5" />
              </Button>
              <span className="text-sm">Transfert</span>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex flex-col items-center justify-center">
              <Button
                className="w-12 h-12 rounded-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 mb-2"
                onClick={() => navigate('/mobile-flow/loans')}
              >
                <CreditCard className="h-5 w-5" />
              </Button>
              <span className="text-sm">Prêts</span>
            </CardContent>
          </Card>
        </div>
        
        <ActiveLoansSection 
          activeLoans={activeLoans} 
          isLoading={loansLoading} 
          onViewAll={() => navigate('/mobile-flow/my-loans')}
          onNewLoan={() => navigate('/mobile-flow/loans')}
        />
        
        <TransactionList 
          transactions={formattedTransactions}
          isLoading={transactionsLoading}
          onViewAll={() => navigate('/mobile-flow/transactions')}
        />
      </div>
      
      <MobileMenu 
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        onNavigate={handleNavigate}
      />
      
      <Footer />
      
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
        <MobileNavigation />
      </div>
    </div>
  );
};

export default MobileMainPage;
