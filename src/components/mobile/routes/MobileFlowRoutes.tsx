
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

import WelcomeScreen from '@/components/mobile/WelcomeScreen';
import SecurePaymentTab from '@/components/mobile/secure-payment';
import PaymentTabContent from '@/components/mobile/PaymentTabContent';
import ScheduleTransferTab from '@/components/mobile/ScheduleTransferTab';
import InstantLoanPage from '@/components/mobile/InstantLoanPage';
import LoanActivityPage from '@/components/mobile/LoanActivityPage';
import LoanDetailsPage from '@/components/mobile/LoanDetailsPage';
import LoanSetupPage from '@/components/mobile/LoanSetupPage';
import LoanProcessFlow from '@/components/mobile/LoanProcessFlow';
import LoanDisbursementPage from '@/components/mobile/LoanDisbursementPage';
import LoanAgreementPage from '@/components/mobile/LoanAgreementPage';
import { PaymentOptions } from '@/components/PaymentOptions';
import { LatePaymentAlerts } from '@/components/LatePaymentAlerts';
import LoanApplicationFlow from '@/components/LoanApplicationFlow';
import MultiSFDAccounts from '@/components/MultiSFDAccounts';
import { SecurePaymentLayer } from '@/components/SecurePaymentLayer';
import ProfilePage from '@/components/mobile/profile/ProfilePage';

import MainDashboard from '../dashboard/MainDashboard';

// Lazy-loaded component
const FundsManagementPage = lazy(() => import('@/components/mobile/funds-management'));

interface MobileFlowRoutesProps {
  onAction: (action: string, data?: any) => void;
  account: any;
  transactions: any[];
  transactionsLoading: boolean;
  toggleMenu: () => void;
  showWelcome: boolean;
  setShowWelcome: React.Dispatch<React.SetStateAction<boolean>>;
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
  const navigate = useNavigate();
  
  return (
    <Routes>
      <Route path="welcome" element={<WelcomeScreen onStart={() => onAction('Start')} />} />
      <Route path="main" element={
        <MainDashboard 
          onAction={onAction}
          account={account}
          transactions={transactions}
          transactionsLoading={transactionsLoading}
          toggleMenu={toggleMenu}
        />
      } />
      <Route path="payment" element={
        <PaymentTabContent 
          onBack={() => navigate('/mobile-flow/main')} 
          onSubmit={handlePaymentSubmit}
        />
      } />
      <Route path="secure-payment" element={
        <SecurePaymentTab onBack={() => navigate('/mobile-flow/main')} />
      } />
      <Route path="funds-management" element={
        <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
          <FundsManagementPage />
        </Suspense>
      } />
      <Route path="schedule-transfer" element={
        <ScheduleTransferTab onBack={() => navigate('/mobile-flow/main')} />
      } />
      <Route path="home-loan" element={<InstantLoanPage />} />
      <Route path="loan-activity" element={<LoanActivityPage />} />
      <Route path="loan-details" element={
        <LoanDetailsPage onBack={() => navigate('/mobile-flow/home-loan')} />
      } />
      <Route path="loan-setup" element={<LoanSetupPage />} />
      <Route path="loan-disbursement" element={<LoanDisbursementPage />} />
      <Route path="loan-agreement" element={<LoanAgreementPage />} />
      <Route path="payment-options" element={
        <div className="p-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4" 
            onClick={() => navigate('/mobile-flow/main')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
          <PaymentOptions />
        </div>
      } />
      <Route path="late-payments" element={
        <div className="p-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4" 
            onClick={() => navigate('/mobile-flow/main')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
          <LatePaymentAlerts />
        </div>
      } />
      <Route path="loan-application" element={
        <div>
          <div className="bg-white py-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-4" 
              onClick={() => navigate('/mobile-flow/main')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour
            </Button>
          </div>
          <LoanApplicationFlow />
        </div>
      } />
      <Route path="multi-sfd" element={
        <div className="p-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4" 
            onClick={() => navigate('/mobile-flow/main')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
          <MultiSFDAccounts />
        </div>
      } />
      <Route path="secure-layer" element={
        <div className="p-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4" 
            onClick={() => navigate('/mobile-flow/main')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
          <SecurePaymentLayer />
        </div>
      } />
      <Route path="loan-process" element={
        <LoanProcessFlow onBack={() => navigate('/mobile-flow/main')} />
      } />
      <Route path="profile" element={
        <ProfilePage />
      } />
      <Route path="" element={<Navigate to="/mobile-flow/welcome" replace />} />
      <Route path="*" element={<Navigate to="/mobile-flow/welcome" replace />} />
    </Routes>
  );
};

export default MobileFlowRoutes;
