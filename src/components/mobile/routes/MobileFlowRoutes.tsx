
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Account } from '@/types/transactions';
import MainDashboard from '../dashboard/MainDashboard';
import WelcomeScreen from '../WelcomeScreen';
import ProfilePage from '../profile/ProfilePage';
import SplashScreen from '../SplashScreen';
import SfdSelectorPage from '@/pages/SfdSelectorPage';

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
      
      {/* Default route - redirect to main dashboard */}
      <Route index element={<Navigate to="main" replace />} />
      
      {/* Catch-all route - fallback to main dashboard */}
      <Route path="*" element={<Navigate to="main" replace />} />
    </Routes>
  );
};

export default MobileFlowRoutes;
