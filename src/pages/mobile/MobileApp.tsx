
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  MainDashboard, 
  HomeLoanPage, 
  MobileSavingsPage, 
  MobileTransactionsPage,
  LoanAgreementPage, 
  LoanDetailsPage, 
  LoanActivityPage, 
  AccountPage, 
  SettingsPage, 
  HelpPage, 
  AboutPage, 
  TermsPage, 
  PrivacyPage, 
  SecurePaymentPage, 
  LoanPlansPage, 
  SfdSelectorPage 
} from '@/components/mobile';
import MobileMenu from '@/components/mobile/MobileMenu';
import { Account } from '@/types/transactions';
import { apiClient } from '@/utils/apiClient';
import { useTransactions } from '@/hooks/transactions';

const MobileApp = () => {
  const [view, setView] = useState('Home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { user, activeSfdId } = useAuth();
  const { transactions, isLoading: transactionsLoading } = useTransactions(
    user?.id || '', 
    activeSfdId || 'default-sfd'
  );
  
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchAccount = useCallback(async () => {
    if (!user?.id || !activeSfdId || activeSfdId === 'default-sfd') {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const fetchedAccount = await apiClient.getClientAccount(user.id);
      setAccount(fetchedAccount);
    } catch (error) {
      console.error("Failed to fetch account:", error);
      toast({
        title: "Erreur de compte",
        description: "Impossible de charger les informations du compte.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, activeSfdId, toast]);
  
  useEffect(() => {
    if (user?.id && activeSfdId && activeSfdId !== 'default-sfd') {
      fetchAccount();
    }
  }, [user, activeSfdId, fetchAccount]);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialView = params.get('view') || 'Home';
    setView(initialView);
  }, [location.search]);
  
  const handleViewChange = (newView: string, data?: any) => {
    setView(newView);
    
    if (newView === 'Loans') {
      navigate('/mobile-flow/loan-activity');
    }
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const renderMainView = () => {
    switch (view) {
      case 'Home':
        return <MainDashboard 
          onAction={handleViewChange}
          account={account}
          transactions={transactions}
          transactionsLoading={transactionsLoading}
          toggleMenu={toggleMenu}
        />;
      case 'Loans':
        return <HomeLoanPage />;
      case 'Savings':
        return <MobileSavingsPage />;
      case 'Transactions':
        return <MobileTransactionsPage />;
      case 'LoanAgreement':
        return <LoanAgreementPage />;
      case 'LoanDetails':
        return <LoanDetailsPage />;
      case 'Payment':
        return <SecurePaymentPage />;
      case 'LoanActivity':
        return <LoanActivityPage />;
      case 'Account':
        return <AccountPage />;
      case 'Settings':
        return <SettingsPage />;
      case 'Help':
        return <HelpPage />;
      case 'About':
        return <AboutPage />;
      case 'Terms':
        return <TermsPage />;
      case 'Privacy':
        return <PrivacyPage />;
      case 'SecurePayment':
        return <SecurePaymentPage />;
      case 'LoanPlans':
        return <LoanPlansPage />;
      case 'Loan Process':
        return <LoanPlansPage />;
      case 'SFDSelector':
        return <SfdSelectorPage />;
      default:
        return <MainDashboard 
          onAction={handleViewChange}
          account={account}
          transactions={transactions}
          transactionsLoading={transactionsLoading}
          toggleMenu={toggleMenu}
        />;
    }
  };
  
  return (
    <div className="relative h-screen">
      {renderMainView()}
      
      <MobileMenu 
        isOpen={isMenuOpen} 
        onClose={closeMenu} 
        onNavigate={handleViewChange}
      />
    </div>
  );
};

export default MobileApp;
