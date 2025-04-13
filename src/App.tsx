import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/hooks/use-toast';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ClientLoansPage from '@/pages/ClientLoansPage';
import LoanApplicationPage from '@/pages/LoanApplicationPage';
import SFDAdminPage from '@/pages/SFDAdminPage';
import SFDManagementPage from '@/pages/SFDManagementPage';
import ClientManagementPage from '@/pages/ClientManagementPage';
import LoanManagementPage from '@/pages/LoanManagementPage';
import DashboardPage from '@/pages/DashboardPage';
import ProfilePage from '@/pages/ProfilePage';
import SFDSelectorPage from '@/pages/SFDSelectorPage';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import MobileMyLoansPage from '@/pages/mobile/MobileMyLoansPage';
import MobileSavingsPage from '@/pages/mobile/MobileSavingsPage';
import MobileLoanDetailsPage from '@/pages/mobile/MobileLoanDetailsPage';
import MobileDepositPage from '@/pages/mobile/MobileDepositPage';
import MobileWithdrawPage from '@/pages/mobile/MobileWithdrawPage';
import MobileTransactionsPage from '@/pages/mobile/MobileTransactionsPage';
import MobileAccountSettingsPage from '@/pages/mobile/MobileAccountSettingsPage';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/auth" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/loans" element={<ClientLoansPage />} />
              <Route path="/loans/apply" element={<LoanApplicationPage />} />
              <Route path="/sfd-admin" element={<SFDAdminPage />} />
              <Route path="/sfd-management" element={<SFDManagementPage />} />
              <Route path="/client-management" element={<ClientManagementPage />} />
              <Route path="/loan-management" element={<LoanManagementPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/sfd-selector" element={<SFDSelectorPage />} />
              
              {/* Mobile Flow Routes */}
              <Route path="/mobile-flow/loans" element={<MobileLoansPage />} />
              <Route path="/mobile-flow/my-loans" element={<MobileMyLoansPage />} />
              <Route path="/mobile-flow/savings" element={<MobileSavingsPage />} />
              <Route path="/mobile-flow/loan/:id" element={<MobileLoanDetailsPage />} />
              <Route path="/mobile-flow/deposit" element={<MobileDepositPage />} />
              <Route path="/mobile-flow/withdraw" element={<MobileWithdrawPage />} />
              <Route path="/mobile-flow/transactions" element={<MobileTransactionsPage />} />
              <Route path="/mobile-flow/account-settings" element={<MobileAccountSettingsPage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
