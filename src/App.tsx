
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import MobileMainPage from '@/components/mobile/MobileMainPage';
import TransferPage from '@/pages/mobile/TransferPage';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import MobileMyLoansPage from '@/pages/mobile/MobileMyLoansPage';
import LoanDetailsPage from '@/pages/mobile/LoanDetailsPage';
import PaymentPage from '@/pages/mobile/PaymentPage';
import AccountPage from '@/pages/mobile/AccountPage';
import MobileFlowPage from '@/pages/MobileFlowPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/auth/AuthContext';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AuthRedirectPage from '@/pages/AuthRedirectPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import ClientLoginPage from '@/pages/ClientLoginPage';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import AgencyDashboard from '@/pages/AgencyDashboard';
import SfdSubsidyRequestsPage from '@/pages/SfdSubsidyRequestsPage';
import ClientsPage from '@/pages/ClientsPage';
import TransactionsPage from '@/pages/TransactionsPage';
import SfdLoansPage from '@/pages/SfdLoansPage';
import SfdMerefRequestPage from '@/pages/SfdMerefRequestPage';
import CreditApprovalPage from '@/pages/CreditApprovalPage';
import SfdManagementPage from '@/pages/SfdManagementPage';
import AuditLogsPage from '@/pages/AuditLogsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/mobile-flow/main" replace />} />
              
              <Route path="/auth" element={<LoginPage />} />
              <Route path="/login" element={<AuthRedirectPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin/auth" element={<AdminLoginPage />} />
              <Route path="/sfd/auth" element={<LoginPage isSfdAdmin={true} />} />
              <Route path="/client/auth" element={<ClientLoginPage />} />
              
              <Route path="/super-admin-dashboard/*" element={<SuperAdminDashboard />} />
              <Route path="/agency-dashboard/*" element={<AgencyDashboard />} />
              
              <Route path="/credit-approval" element={<CreditApprovalPage />} />
              <Route path="/sfd-management" element={<SfdManagementPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              
              <Route path="/sfd-loans" element={<SfdLoansPage />} />
              <Route path="/sfd-clients" element={<ClientsPage />} />
              <Route path="/sfd-transactions" element={<TransactionsPage />} />
              <Route path="/sfd-subsidy-requests" element={<SfdSubsidyRequestsPage />} />
              <Route path="/sfd-meref-request" element={<SfdMerefRequestPage />} />
              
              <Route path="/mobile-flow/main" element={<MobileMainPage />} />
              <Route path="/mobile-flow/transfer" element={<TransferPage />} />
              <Route path="/mobile-flow/loans" element={<MobileLoansPage />} />
              <Route path="/mobile-flow/my-loans" element={<MobileMyLoansPage />} />
              <Route path="/mobile-flow/loan-details" element={<LoanDetailsPage />} />
              <Route path="/mobile-flow/payment" element={<PaymentPage />} />
              <Route path="/mobile-flow/account" element={<AccountPage />} />
              <Route path="/mobile-flow/*" element={<MobileFlowPage />} />
              
              <Route path="*" element={<Navigate to="/mobile-flow/main" replace />} />
            </Routes>
            <Toaster />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
