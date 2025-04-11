
import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import MainDashboard from '../dashboard/MainDashboard';
import TransactionsPage from '../transactions/TransactionsPage';
import LoanDetailsPage from '../LoanDetailsPage';
import LoanProcessPage from '../LoanProcessPage';
import LoanApplicationPage from '../loan-application/LoanApplicationPage';
import LoanSetupPage from '../LoanSetupPage';
import LoanAgreementPage from '../LoanAgreementPage';
import LoanDisbursementPage from '../LoanDisbursementPage';
import SecurePaymentTab from '../secure-payment/SecurePaymentTab';
import PaymentTabContent from '../PaymentTabContent';
import ProfilePage from '../profile/ProfilePage';
import FundsManagementPage from '../funds-management/FundsManagementPage';
import WelcomeScreen from '../WelcomeScreen';
import { Account, Transaction } from '@/types/transactions';

interface MobileFlowRoutesProps {
  onAction: (action: string, data?: any) => void;
  account: Account;
  transactions: any[];
  transactionsLoading?: boolean;
  toggleMenu: () => void;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  handlePaymentSubmit: (data: { recipient: string, amount: number, note: string }) => Promise<void>;
  isBalanceRefreshing?: boolean;
  onRefreshBalance?: () => void;
}

const MobileFlowRoutes: React.FC<MobileFlowRoutesProps> = ({
  onAction,
  account,
  transactions,
  transactionsLoading = false,
  toggleMenu,
  showWelcome,
  setShowWelcome,
  handlePaymentSubmit,
  isBalanceRefreshing,
  onRefreshBalance
}) => {
  const location = useLocation();
  
  // Hide welcome screen if user navigates to a different page
  useEffect(() => {
    if (showWelcome && location.pathname !== '/mobile-flow/main') {
      setShowWelcome(false);
    }
  }, [location, showWelcome, setShowWelcome]);
  
  return (
    <Routes>
      <Route path="/main" element={
        <MainDashboard 
          account={account} 
          transactions={transactions} 
          transactionsLoading={transactionsLoading}
          toggleMenu={toggleMenu}
          showWelcome={showWelcome}
          setShowWelcome={setShowWelcome}
        />
      } />
      
      <Route path="/transactions" element={
        <TransactionsPage 
          transactions={transactions} 
          isLoading={transactionsLoading} 
        />
      } />
      
      <Route path="/funds-management" element={
        <FundsManagementPage 
          balanceAmount={account.balance}
          isBalanceRefreshing={isBalanceRefreshing}
          onRefreshBalance={onRefreshBalance}
        />
      } />
      
      <Route path="/loan-details" element={<LoanDetailsPage />} />
      <Route path="/loan-process" element={<LoanProcessPage />} />
      <Route path="/loan-application" element={<LoanApplicationPage />} />
      <Route path="/loan-setup" element={<LoanSetupPage />} />
      <Route path="/loan-agreement" element={<LoanAgreementPage />} />
      <Route path="/loan-disbursement" element={<LoanDisbursementPage />} />
      
      <Route path="/secure-payment" element={
        <SecurePaymentTab 
          handlePaymentSubmit={handlePaymentSubmit} 
          account={account}
        />
      } />
      
      <Route path="/payment" element={<PaymentTabContent />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
};

export default MobileFlowRoutes;
