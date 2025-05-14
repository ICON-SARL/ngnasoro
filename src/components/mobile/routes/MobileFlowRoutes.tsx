
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Account } from '@/types/transactions';
import MainDashboard from '../dashboard/MainDashboard';
import FundsManagementView from '../funds/FundsManagementView';
import WelcomeScreen from '../WelcomeScreen';
import ProfilePage from '../profile/ProfilePage';
import SplashScreen from '../SplashScreen';
import SfdSelectorPage from '@/pages/SfdSelectorPage';
import SfdAdhesionPage from '@/pages/mobile/SfdAdhesionPage';
import SecurePaymentTab from '../secure-payment/SecurePaymentTab';
import TransferPage from '@/pages/mobile/TransferPage';

interface MobileFlowRoutesProps {
  onAction: (action: string, data?: any) => void;
  account: Account | null;
  transactions: any[];
  transactionsLoading: boolean;
  toggleMenu: () => void;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  handlePaymentSubmit: (data: { recipient: string, amount: number, note: string }) => Promise<void>;
}

// Convert this to a component that returns route elements, not a Router component
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
    <>
      {/* These are the individual routes that can be used in a Routes component */}
      <Route path="splash" element={<SplashScreen onComplete={() => onAction('Start')} />} />
      <Route path="welcome" element={<WelcomeScreen onStart={() => onAction('Start')} />} />
      <Route path="main" element={
        <MainDashboard
          account={account}
          transactions={transactions}
          transactionsLoading={transactionsLoading}
          onAction={onAction}
          toggleMenu={toggleMenu}
        />
      } />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="sfd-selector" element={<SfdSelectorPage />} />
      <Route path="sfd-adhesion/:sfdId" element={<SfdAdhesionPage />} />
      <Route path="funds-management" element={<FundsManagementView />} />
      <Route path="secure-payment" element={<SecurePaymentTab />} />
      <Route path="transfers" element={<TransferPage />} />
      <Route index element={<Navigate to="main" replace />} />
      <Route path="*" element={<Navigate to="main" replace />} />
    </>
  );
};

export default MobileFlowRoutes;
