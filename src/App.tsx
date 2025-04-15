
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
import SfdAdhesionPage from '@/pages/mobile/SfdAdhesionPage';
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
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import RoleGuard from '@/components/RoleGuard';
import { UserRole } from '@/hooks/auth/types';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import SfdAdhesionRequestsPage from '@/pages/SfdAdhesionRequestsPage';
import RoleTestingPage from '@/pages/RoleTestingPage';

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
              <Route path="/" element={<Navigate to="/auth" replace />} />
              
              {/* Authentication Routes */}
              <Route path="/auth" element={<LoginPage />} />
              <Route path="/login" element={<AuthRedirectPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin/auth" element={<AdminLoginPage />} />
              <Route path="/sfd/auth" element={<LoginPage isSfdAdmin={true} />} />
              <Route path="/client/auth" element={<ClientLoginPage />} />
              <Route path="/access-denied" element={<AccessDeniedPage />} />
              
              {/* Admin Routes */}
              <Route path="/super-admin-dashboard/*" element={
                <ProtectedRoute requireAdmin={true}>
                  <RoleGuard requiredRole={UserRole.SuperAdmin}>
                    <SuperAdminDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/sfd-management" element={
                <ProtectedRoute requireAdmin={true}>
                  <RoleGuard requiredRole={UserRole.SuperAdmin}>
                    <SfdManagementPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/audit-logs" element={
                <ProtectedRoute requireAdmin={true}>
                  <RoleGuard requiredRole={UserRole.SuperAdmin}>
                    <AuditLogsPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              
              {/* Credit Approval page accessible to both Super Admin and SFD Admin */}
              <Route path="/credit-approval" element={
                <ProtectedRoute>
                  <CreditApprovalPage />
                </ProtectedRoute>
              } />
              
              {/* SFD Admin Routes */}
              <Route path="/agency-dashboard/*" element={
                <ProtectedRoute requireSfdAdmin={true}>
                  <RoleGuard requiredRole={UserRole.SfdAdmin}>
                    <AgencyDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/sfd-loans" element={
                <ProtectedRoute requireSfdAdmin={true}>
                  <RoleGuard requiredRole={UserRole.SfdAdmin}>
                    <SfdLoansPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/sfd-clients" element={
                <ProtectedRoute requireSfdAdmin={true}>
                  <RoleGuard requiredRole={UserRole.SfdAdmin}>
                    <ClientsPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/sfd-adhesion-requests" element={
                <ProtectedRoute requireSfdAdmin={true}>
                  <RoleGuard requiredRole={UserRole.SfdAdmin}>
                    <SfdAdhesionRequestsPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/sfd-transactions" element={
                <ProtectedRoute requireSfdAdmin={true}>
                  <RoleGuard requiredRole={UserRole.SfdAdmin}>
                    <TransactionsPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/sfd-subsidy-requests" element={
                <ProtectedRoute requireSfdAdmin={true}>
                  <RoleGuard requiredRole={UserRole.SfdAdmin}>
                    <SfdSubsidyRequestsPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              
              <Route path="/sfd-meref-request" element={
                <ProtectedRoute requireSfdAdmin={true}>
                  <RoleGuard requiredRole={UserRole.SfdAdmin}>
                    <SfdMerefRequestPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              
              {/* Client/User Routes - Add role checks to prevent admin access */}
              <Route path="/mobile-flow/main" element={
                <ProtectedRoute>
                  <RoleGuard requiredRole={UserRole.Client}>
                    <MobileMainPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              <Route path="/mobile-flow/transfer" element={
                <ProtectedRoute>
                  <RoleGuard requiredRole={UserRole.Client}>
                    <TransferPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              <Route path="/mobile-flow/loans" element={
                <ProtectedRoute>
                  <RoleGuard requiredRole={UserRole.Client}>
                    <MobileLoansPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              <Route path="/mobile-flow/my-loans" element={
                <ProtectedRoute>
                  <RoleGuard requiredRole={UserRole.Client}>
                    <MobileMyLoansPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              <Route path="/mobile-flow/loan-details" element={
                <ProtectedRoute>
                  <RoleGuard requiredRole={UserRole.Client}>
                    <LoanDetailsPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              <Route path="/mobile-flow/payment" element={
                <ProtectedRoute>
                  <RoleGuard requiredRole={UserRole.Client}>
                    <PaymentPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              <Route path="/mobile-flow/account" element={
                <ProtectedRoute>
                  <RoleGuard requiredRole={UserRole.Client}>
                    <AccountPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              <Route path="/mobile-flow/sfd-adhesion/:sfdId" element={
                <ProtectedRoute>
                  <RoleGuard requiredRole={UserRole.Client}>
                    <SfdAdhesionPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              <Route path="/mobile-flow/*" element={
                <ProtectedRoute>
                  <RoleGuard requiredRole={UserRole.Client}>
                    <MobileFlowPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              
              {/* New role testing route */}
              <Route path="/role-testing" element={
                <ProtectedRoute requireAdmin={true}>
                  <RoleGuard requiredRole={UserRole.SuperAdmin}>
                    <RoleTestingPage />
                  </RoleGuard>
                </ProtectedRoute>
              } />
              
              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
            <Toaster />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
