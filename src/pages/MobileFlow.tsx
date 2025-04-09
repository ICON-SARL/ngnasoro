
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import MobileNavigation from '@/components/MobileNavigation';
import MobileHeader from '@/components/mobile/MobileHeader';
import ProfilePage from '@/components/mobile/profile/ProfilePage';
import LoanDetailsPage from '@/components/mobile/LoanDetailsPage';
import PaymentOptionsPage from '@/components/mobile/payment-options/PaymentOptionsPage';
import FundsManagementPage from '@/components/mobile/funds-management/FundsManagementPage';
import SecurePaymentTab from '@/components/mobile/secure-payment/SecurePaymentTab';
import { MainDashboard } from '@/components/mobile/dashboard';
import LoanApplicationPage from '@/components/mobile/loan-application/LoanApplicationPage';
import LoanActivityPage from '@/components/mobile/LoanActivityPage';

const MobileFlow: React.FC = () => {
  // Get authentication context to check if user is logged in
  const { user } = useAuth();
  
  // If user is not authenticated, we would handle that in a parent component

  // Default account for the MainDashboard component
  const defaultAccount = {
    id: 'default-account',
    user_id: user?.id || 'default-user',
    balance: 0,
    currency: 'FCFA',
    updated_at: new Date().toISOString()
  };

  return (
    <div className="flex flex-col h-full min-h-screen w-full">
      <MobileHeader />
      <div className="flex-grow overflow-auto pb-16 w-full">
        <Routes>
          {/* Redirect root to main dashboard */}
          <Route path="/" element={<Navigate to="/mobile-flow/main" replace />} />
          
          {/* Main dashboard */}
          <Route path="/main" element={
            <MainDashboard 
              onAction={() => {}} 
              account={defaultAccount} 
              transactions={[]} 
              transactionsLoading={false} 
              toggleMenu={() => {}} 
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
          <Route path="/secure-payment" element={<SecurePaymentTab />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/mobile-flow/main" replace />} />
        </Routes>
      </div>
      <MobileNavigation onAction={() => {}} />
    </div>
  );
};

export default MobileFlow;
