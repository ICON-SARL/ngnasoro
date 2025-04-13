
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ClientLoansPage from '@/pages/ClientLoansPage';
import LoanApplicationPage from '@/pages/LoanApplicationPage';
import ProfilePage from '@/pages/ProfilePage';
import SfdSelectorPage from '@/pages/SFDSelector';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import MobileMyLoansPage from '@/pages/mobile/MobileMyLoansPage';
import MobileSavingsPage from '@/pages/mobile/MobileSavingsPage';
import MobileLoanDetailsPage from '@/pages/mobile/MobileLoanDetailsPage';
import MobileDepositPage from '@/pages/mobile/MobileDepositPage';
import MobileWithdrawPage from '@/pages/mobile/MobileWithdrawPage';
import MobileTransactionsPage from '@/pages/mobile/MobileTransactionsPage';
import MobileAccountSettingsPage from '@/pages/mobile/MobileAccountSettingsPage';
import MobileFlowPage from '@/pages/MobileFlowPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import ClientLoginPage from '@/pages/ClientLoginPage';
import SfdLoginPage from '@/pages/SfdLoginPage'; // Import the SfdLoginPage
import AuthRedirectPage from '@/pages/AuthRedirectPage';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import UsersManagementPage from '@/pages/UsersManagementPage';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            {/* Authentication Routes */}
            <Route path="/login" element={<AuthRedirectPage />} />
            <Route path="/auth" element={<ClientLoginPage />} />
            <Route path="/admin/auth" element={<AdminLoginPage />} />
            <Route path="/sfd/auth" element={<SfdLoginPage />} /> {/* Use the SfdLoginPage component instead of directly using SfdAuthUI */}
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Admin Dashboard Routes */}
            <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
            <Route path="/users-management" element={<UsersManagementPage />} />
            
            {/* Public Routes */}
            <Route path="/loans" element={<ClientLoansPage />} />
            <Route path="/loans/apply" element={<LoanApplicationPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/sfd-selector" element={<SfdSelectorPage />} />
            
            {/* Mobile Flow Routes - using /* to capture all nested routes */}
            <Route path="/mobile-flow/*" element={<MobileFlowPage />} />
            
            {/* Individual Mobile Pages */}
            <Route path="/mobile-flow/loans" element={<MobileLoansPage />} />
            <Route path="/mobile-flow/my-loans" element={<MobileMyLoansPage />} />
            <Route path="/mobile-flow/savings" element={<MobileSavingsPage />} />
            <Route path="/mobile-flow/loan/:id" element={<MobileLoanDetailsPage />} />
            <Route path="/mobile-flow/deposit" element={<MobileDepositPage />} />
            <Route path="/mobile-flow/withdraw" element={<MobileWithdrawPage />} />
            <Route path="/mobile-flow/transactions" element={<MobileTransactionsPage />} />
            <Route path="/mobile-flow/account-settings" element={<MobileAccountSettingsPage />} />
            
            {/* Redirect root to login redirect page */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
