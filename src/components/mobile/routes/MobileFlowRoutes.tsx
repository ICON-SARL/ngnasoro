
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainDashboard } from '@/components/mobile/dashboard';
import ProfilePage from '@/components/mobile/profile/ProfilePage';
import SecurePaymentTab from '@/components/mobile/secure-payment';
import SfdSetupPage from '@/pages/SfdSetupPage';
import SfdClientsPage from '@/pages/SfdClientsPage';
import ScheduleTransferTab from '@/components/mobile/ScheduleTransferTab';
import FundsManagementPage from '@/components/mobile/funds-management/FundsManagementPage';
import PaymentOptionsPage from '@/components/mobile/payment-options/PaymentOptionsPage';
import LoanApplicationPage from '@/components/mobile/loan-application/LoanApplicationPage';
import LoanActivityPage from '@/components/mobile/LoanActivityPage';
import LoanDetailsPage from '@/components/mobile/LoanDetailsPage';
import LoanProcessPage from '@/components/mobile/LoanProcessPage';

interface MobileFlowRoutesProps {
  onAction: (action: string, data?: any) => void;
  account: any;
  transactions: any[];
  transactionsLoading: boolean;
  toggleMenu: () => void;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  handlePaymentSubmit: (data: { recipient: string, amount: number, note: string }) => Promise<void>;
}

const MobileFlowRoutes: React.FC<MobileFlowRoutesProps> = ({
  onAction,
  account,
  transactions,
  transactionsLoading,
  toggleMenu,
  showWelcome,
  setShowWelcome,
  handlePaymentSubmit
}) => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={<Navigate to="main" replace />} 
      />
      <Route 
        path="main" 
        element={
          <MainDashboard 
            onAction={onAction}
            account={account}
            transactions={transactions}
            transactionsLoading={transactionsLoading}
            toggleMenu={toggleMenu}
          />
        } 
      />
      <Route 
        path="profile" 
        element={<ProfilePage />} 
      />
      <Route 
        path="create-sfd" 
        element={<SfdSetupPage />} 
      />
      <Route 
        path="secure-payment" 
        element={<SecurePaymentTab />} 
      />
      <Route 
        path="sfd-clients" 
        element={<SfdClientsPage />} 
      />
      <Route 
        path="schedule-transfer" 
        element={<ScheduleTransferTab />} 
      />
      <Route 
        path="funds-management" 
        element={<FundsManagementPage />} 
      />
      <Route 
        path="payment-options" 
        element={<PaymentOptionsPage />} 
      />
      <Route 
        path="loan-application" 
        element={<LoanApplicationPage />} 
      />
      <Route 
        path="loan-activity" 
        element={<LoanActivityPage />} 
      />
      <Route 
        path="loan-details" 
        element={<LoanDetailsPage />} 
      />
      <Route 
        path="loan-process" 
        element={<LoanProcessPage />} 
      />
      <Route 
        path="*" 
        element={<Navigate to="main" replace />} 
      />
    </Routes>
  );
};

export default MobileFlowRoutes;
