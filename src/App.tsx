import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/Footer';
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
import SfdLoginPage from '@/pages/SfdLoginPage';
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
import RoleTestingPage from '@/pages/RoleTestingPage';
import SplashScreen from '@/components/mobile/SplashScreen';
import SfdClientDetailPage from '@/pages/SfdClientDetailPage';
import { NotificationsOverlay } from '@/components/mobile/NotificationsOverlay';
import MobileDepositPage from '@/pages/mobile/MobileDepositPage';

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
            <div className="flex flex-col min-h-screen">
              <div className="flex-grow">
                <Routes>
                  <Route path="/" element={<SplashScreen onComplete={() => null} />} />
                  
                  <Route path="/auth" element={<LoginPage />} />
                  <Route path="/login" element={<AuthRedirectPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/admin/auth" element={<AdminLoginPage />} />
                  <Route path="/sfd/auth" element={<SfdLoginPage />} />
                  <Route path="/client/auth" element={<ClientLoginPage />} />
                  <Route path="/access-denied" element={<AccessDeniedPage />} />
                  
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
                  
                  <Route path="/credit-approval" element={
                    <ProtectedRoute>
                      <CreditApprovalPage />
                    </ProtectedRoute>
                  } />
                  
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
                  
                  <Route path="/sfd-clients/:clientId" element={
                    <ProtectedRoute requireSfdAdmin={true}>
                      <RoleGuard requiredRole={UserRole.SfdAdmin}>
                        <SfdClientDetailPage />
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
                      <MobileFlowPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/mobile-flow/deposit" element={
                    <ProtectedRoute>
                      <MobileDepositPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/mobile-flow/*" element={
                    <ProtectedRoute>
                      <MobileFlowPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/role-testing" element={
                    <ProtectedRoute requireAdmin={true}>
                      <RoleGuard requiredRole={UserRole.SuperAdmin}>
                        <RoleTestingPage />
                      </RoleGuard>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
                <NotificationsOverlay />
                <Toaster />
              </div>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
