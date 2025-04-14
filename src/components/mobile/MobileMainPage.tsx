
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileMenu from './MobileMenu';
import MobileHeader from './MobileHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, CreditCard, ArrowUpDown } from 'lucide-react';
import TransactionList from './TransactionList';
import { useAuth } from '@/hooks/useAuth';
import { useClientLoans } from '@/hooks/useClientLoans';
import ActiveLoansSection from './loans/ActiveLoansSection';

const MobileMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Don't use useTransactions at the top level, use it conditionally based on user
  const loans = useClientLoans().loans || [];
  const isLoading = useClientLoans().isLoading || false;
  const refetchLoans = useClientLoans().refetchLoans || (() => {});
  
  // Placeholder for transactions until we get user data
  const recentTransactions = [
    {
      id: 1,
      name: "Dépôt mensuel",
      type: "deposit",
      amount: "+25,000 FCFA",
      date: "12/04/2025",
      avatar: null
    },
    {
      id: 2,
      name: "Remboursement prêt",
      type: "withdrawal",
      amount: "-15,000 FCFA",
      date: "10/04/2025",
      avatar: null
    }
  ];
  
  // Filter only active loans
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
          isLoading={isLoading} 
          onViewAll={() => navigate('/mobile-flow/my-loans')}
          onNewLoan={() => navigate('/mobile-flow/loans')}
        />
        
        <TransactionList 
          transactions={recentTransactions} 
          isLoading={false}
          onViewAll={() => navigate('/mobile-flow/transactions')}
        />
      </div>
      
      <MobileMenu 
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default MobileMainPage;
