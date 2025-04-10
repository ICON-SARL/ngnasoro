
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WelcomePage from '@/components/mobile/welcome/WelcomePage';
import MainPage from '@/components/mobile/main/MainPage';
import ProfilePage from '@/components/mobile/profile/ProfilePage';
import PaymentPage from '@/components/mobile/payment/PaymentPage';
import TransactionsPage from '@/components/mobile/transactions/TransactionsPage';
import SecurePaymentPage from '@/components/mobile/payment/SecurePaymentPage';
import SfdAccountsPage from '@/pages/mobile/SfdAccountsPage';

interface MobileFlowRoutesProps {
  onAction: (action: string, data?: any) => void;
  account: any;
  transactions: any[];
  transactionsLoading: boolean;
  toggleMenu: () => void;
  showWelcome: boolean;
  setShowWelcome: (value: boolean) => void;
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
      <Route path="welcome" element={<WelcomePage onAction={onAction} />} />
      <Route path="main" element={
        <MainPage 
          account={account} 
          transactions={transactions} 
          isLoading={transactionsLoading} 
          toggleMenu={toggleMenu}
        />
      } />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="profile/sfd-accounts" element={<SfdAccountsPage />} />
      <Route path="payment" element={<PaymentPage onPaymentSubmit={handlePaymentSubmit} />} />
      <Route path="transactions" element={<TransactionsPage transactions={transactions} isLoading={transactionsLoading} />} />
      <Route path="secure-payment" element={<SecurePaymentPage onPaymentSubmit={handlePaymentSubmit} />} />
    </Routes>
  );
};

export default MobileFlowRoutes;
