
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Account } from '@/types/transactions';
import MainDashboard from '../dashboard/MainDashboard';
import WelcomeScreen from '../WelcomeScreen';
import ProfilePage from '../profile/ProfilePage';
import SplashScreen from '../SplashScreen';
import SfdSelectorPage from '@/pages/SfdSelectorPage';
import SfdSetupPage from '@/pages/SfdSetupPage';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import MobileLoanPlansPage from '@/pages/mobile/MobileLoanPlansPage';
import MobileLoanSimulatorPage from '@/pages/mobile/MobileLoanSimulatorPage';
import MobileLoanApplicationPage from '@/pages/mobile/MobileLoanApplicationPage';
import MobileMyLoansPage from '@/pages/mobile/MobileMyLoansPage';
import MobileLoanDetailsPage from '@/pages/mobile/MobileLoanDetailsPage';
import SfdConnectionPage from '@/pages/mobile/SfdConnectionPage';
import LoanProcessFlowPage from '@/pages/mobile/LoanProcessFlowPage';

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
  console.log("Rendering MobileFlowRoutes with account:", account);
  
  return (
    <Routes>
      <Route path="splash" element={
        <SplashScreen onComplete={() => onAction('Start')} />
      } />
      
      <Route path="welcome" element={
        <WelcomeScreen onStart={() => onAction('Start')} />
      } />
      
      <Route path="main" element={
        <MainDashboard
          account={account}
          transactions={transactions}
          transactionsLoading={transactionsLoading}
          onAction={onAction}
          toggleMenu={toggleMenu}
        />
      } />
      
      <Route path="profile" element={
        <ProfilePage />
      } />
      
      <Route path="sfd-selector" element={
        <SfdSelectorPage />
      } />
      
      <Route path="sfd-setup" element={
        <SfdSetupPage />
      } />
      
      <Route path="sfd-connection" element={
        <SfdConnectionPage />
      } />
      
      {/* Routes de prêt */}
      <Route path="loans" element={
        <MobileLoansPage />
      } />
      
      <Route path="loan-plans" element={
        <MobileLoanPlansPage />
      } />
      
      <Route path="loan-simulator" element={
        <MobileLoanSimulatorPage />
      } />
      
      <Route path="loan-application" element={
        <MobileLoanApplicationPage />
      } />
      
      <Route path="my-loans" element={
        <MobileMyLoansPage />
      } />
      
      <Route path="loan-details/:id" element={
        <MobileLoanDetailsPage />
      } />
      
      <Route path="loan-process-flow" element={
        <LoanProcessFlowPage />
      } />
      
      {/* Default route - redirect to main dashboard */}
      <Route index element={<Navigate to="main" replace />} />
      
      {/* Catch-all route - fallback to main dashboard */}
      <Route path="*" element={<Navigate to="main" replace />} />
    </Routes>
  );
};

export default MobileFlowRoutes;
