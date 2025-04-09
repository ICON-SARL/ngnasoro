
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MobileHome from '@/components/mobile/MobileHome';
import MobileNavbar from '@/components/mobile/MobileNavbar';
import AccountPage from '@/components/mobile/AccountPage';
import LoanDetailsPage from '@/components/mobile/LoanDetailsPage';
import ApplyForLoanPage from '@/components/mobile/ApplyForLoanPage';
import PaymentOptionsPage from '@/components/mobile/payment-options/PaymentOptionsPage';
import FundsManagementPage from '@/components/mobile/funds-management/FundsManagementPage';
import SecurePaymentTab from '@/components/mobile/secure-payment/SecurePaymentTab';

const MobileFlow: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-auto">
        <Routes>
          <Route path="/" element={<MobileHome />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/loan/:id" element={<LoanDetailsPage />} />
          <Route path="/apply-loan" element={<ApplyForLoanPage />} />
          <Route path="/payment-options" element={<PaymentOptionsPage />} />
          <Route path="/funds-management" element={<FundsManagementPage />} />
          <Route path="/secure-payment" element={<SecurePaymentTab />} />
        </Routes>
      </div>
      <MobileNavbar />
    </div>
  );
};

export default MobileFlow;
