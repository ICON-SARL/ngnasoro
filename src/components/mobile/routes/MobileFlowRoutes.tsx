
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import WelcomeScreen from '@/components/mobile/WelcomeScreen';
import MainDashboard from '@/components/mobile/dashboard/MainDashboard';
import PaymentTabContent from '@/components/mobile/PaymentTabContent';
import ScheduleTransferTab from '@/components/mobile/ScheduleTransferTab';
import { Button } from '@/components/ui/button';
import SecurePaymentTab from '@/components/mobile/secure-payment';
import HomeLoanPage from '@/components/mobile/HomeLoanPage';
import LoanActivityPage from '@/components/mobile/LoanActivityPage';
import LoanDetailsPage from '@/components/mobile/LoanDetailsPage';
import LoanSetupPage from '@/components/mobile/LoanSetupPage';
import LoanProcessFlow from '@/components/mobile/LoanProcessFlow';
import LoanApplicationForm from '@/components/mobile/loan/LoanApplicationForm';
import LoanTrackingPage from '@/components/mobile/loan/LoanTrackingPage';
import NotificationsPage from '@/components/mobile/notifications/NotificationsPage';

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
  const location = useLocation();
  const currentPath = location.pathname;
  
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };
  
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/mobile-flow/main" replace />} />
      <Route path="/welcome" element={
        <WelcomeScreen onStart={() => onAction('Start')} />
      } />
      <Route path="/main" element={
        <MainDashboard 
          onAction={onAction} 
          account={account}
          transactions={transactions}
          transactionsLoading={transactionsLoading}
          toggleMenu={toggleMenu}
        />
      } />
      <Route path="/payment" element={
        <PaymentTabContent onSubmit={handlePaymentSubmit} onBack={handleBack} />
      } />
      <Route path="/schedule-transfer" element={
        <ScheduleTransferTab onBack={handleBack} />
      } />
      <Route path="/secure-payment" element={
        <SecurePaymentTab onBack={handleBack} />
      } />
      <Route path="/home-loan" element={<HomeLoanPage />} />
      <Route path="/loan-activity" element={<LoanActivityPage />} />
      <Route path="/loan-details" element={
        <LoanDetailsPage onBack={handleBack} />
      } />
      <Route path="/loan-details/:loanId" element={
        <LoanDetailsPage onBack={handleBack} />
      } />
      <Route path="/loan-setup" element={<LoanSetupPage />} />
      <Route path="/loan-process" element={
        <LoanProcessFlow onBack={handleBack} />
      } />
      <Route path="/loan-process/:loanId" element={
        <LoanProcessFlow onBack={handleBack} />
      } />
      
      {/* Nouvelles routes pour les écrans demandés */}
      <Route path="/loan-application" element={
        <LoanApplicationForm />
      } />
      <Route path="/loan-tracking/:loanId" element={
        <LoanTrackingPage />
      } />
      <Route path="/notifications" element={
        <NotificationsPage />
      } />
      
      <Route path="*" element={
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-xl font-semibold mb-4">Page introuvable</h2>
          <Button onClick={() => onAction('Home')}>
            Retour à l'accueil
          </Button>
        </div>
      } />
    </Routes>
  );
};

export default MobileFlowRoutes;
