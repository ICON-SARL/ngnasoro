import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainDashboard } from '../dashboard';
import ProfilePage from '../profile/ProfilePage';
import LoanDetailsPage from '../LoanDetailsPage';
import LoanActivityPage from '../LoanActivityPage';
import LoanApplicationPage from '../loan-application/LoanApplicationPage';
import PaymentOptionsPage from '../payment-options/PaymentOptionsPage';
import FundsManagementPage from '../funds-management/FundsManagementPage';
import { SecurePaymentTab } from '../secure-payment'; // Import named export

interface MobileFlowRoutesProps {
  onAction: (action: string, data?: any) => void;
  account: any; // Replace 'any' with the actual type of 'account'
  transactions: any[]; // Replace 'any[]' with the actual type of 'transactions'
  transactionsLoading: boolean;
  toggleMenu: () => void;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  handlePaymentSubmit: (data: { recipient: string; amount: number; note: string }) => Promise<void>;
}

const MobileFlowRoutes = ({ 
  onAction,
  account,
  transactions,
  transactionsLoading,
  toggleMenu,
  showWelcome,
  setShowWelcome,
  handlePaymentSubmit
}: MobileFlowRoutesProps) => {
  return (
    <Routes>
      {/* Redirect root to main dashboard */}
      <Route path="/" element={<Navigate to="/mobile-flow/main" replace />} />
      
      {/* Main dashboard */}
      <Route path="/main" element={
        <MainDashboard 
          onAction={onAction} 
          account={account} 
          transactions={transactions} 
          transactionsLoading={transactionsLoading} 
          toggleMenu={toggleMenu} 
        />
      } />
      
      {/* User profile page */}
      <Route path="/profile" element={<ProfilePage />} />
      
      {/* Loan-related pages */}
      <Route path="/loan/:id" element={<LoanDetailsPage />} />
      <Route path="/loan-activity" element={<LoanActivityPage />} />
      <Route path="/loan-application" element={<LoanApplicationPage />} />
      
      {/* Payment and funds pages */}
      <Route path="/payment-options" element={<PaymentOptionsPage />} />
      <Route path="/funds-management" element={<FundsManagementPage />} />
      
      {/* Make sure secure payment route is updated to use the named export */}
      <Route path="/secure-payment" element={<SecurePaymentTab />} />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/mobile-flow/main" replace />} />
    </Routes>
  );
};

export default MobileFlowRoutes;
