import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MobileMainPage from '@/components/mobile/MobileMainPage';
import MobileAccountPage from '@/components/mobile/MobileAccountPage';
import MobileTransferPage from '@/components/mobile/MobileTransferPage';
import MobileSecurePaymentPage from '@/components/mobile/secure-payment/MobileSecurePaymentPage';
import MobileLoanDetailsPage from '@/components/mobile/LoanDetailsPage';
import LoanActivityPage from '@/components/mobile/LoanActivityPage';
import LoanProcessPage from '@/components/mobile/LoanProcessPage';
import LoanAgreementPage from '@/components/mobile/LoanAgreementPage';
import MobileLoanApplicationPage from '@/pages/mobile/MobileLoanApplicationPage';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import MobileMyLoansPage from '@/pages/mobile/MobileMyLoansPage';

export const MobileRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/main" replace />} />
      <Route path="/main" element={<MobileMainPage />} />
      <Route path="/account" element={<MobileAccountPage />} />
      <Route path="/transfer" element={<MobileTransferPage />} />
      <Route path="/payment" element={<MobileSecurePaymentPage />} />
      <Route path="/loan-details" element={<MobileLoanDetailsPage />} />
      <Route path="/loans" element={<MobileLoansPage />} />
      <Route path="/my-loans" element={<MobileMyLoansPage />} />
      <Route path="/loan-activity" element={<LoanActivityPage />} />
      <Route path="/loan-process" element={<LoanProcessPage />} />
      <Route path="/loan-agreement" element={<LoanAgreementPage />} />
      <Route path="/loan-application" element={<MobileLoanApplicationPage />} />
      <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  );
};
