
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
import MobileFlowPage from '@/pages/MobileFlowPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import ClientLoginPage from '@/pages/ClientLoginPage';
import SfdLoginPage from '@/pages/SfdLoginPage';
import AuthRedirectPage from '@/pages/AuthRedirectPage';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import UsersManagementPage from '@/pages/UsersManagementPage';
import RoleGuard from '@/components/RoleGuard';
import { UserRole } from '@/utils/auth/roleTypes';
import SfdAdminDashboard from '@/components/admin/SfdAdminDashboard';
import SfdClientsPage from '@/pages/SfdClientsPage';
import SfdSubsidyRequestsPage from '@/pages/SfdSubsidyRequestsPage';
import SfdLoansPage from '@/pages/SfdLoansPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import NotFoundPage from '@/pages/NotFoundPage';
import AuditLogsPage from '@/pages/AuditLogsPage';
import CreditApprovalPage from '@/pages/CreditApprovalPage';
import SfdManagementPage from '@/pages/SfdManagementPage';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            {/* Pages publiques */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<AuthRedirectPage />} />
            <Route path="/auth" element={<ClientLoginPage />} />
            <Route path="/admin/auth" element={<AdminLoginPage />} />
            <Route path="/sfd/auth" element={<SfdLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Pages protégées - Admin */}
            <Route path="/super-admin-dashboard" element={
              <RoleGuard requiredRole={UserRole.ADMIN}>
                <SuperAdminDashboard />
              </RoleGuard>
            } />
            <Route path="/credit-approval" element={
              <RoleGuard requiredRole={UserRole.ADMIN}>
                <CreditApprovalPage />
              </RoleGuard>
            } />
            <Route path="/sfd-management" element={
              <RoleGuard requiredRole={UserRole.ADMIN}>
                <SfdManagementPage />
              </RoleGuard>
            } />
            <Route path="/admin/users" element={
              <RoleGuard requiredRole={UserRole.ADMIN}>
                <UsersManagementPage />
              </RoleGuard>
            } />
            <Route path="/audit-logs" element={
              <RoleGuard requiredRole={UserRole.ADMIN}>
                <AuditLogsPage />
              </RoleGuard>
            } />
            
            {/* Pages protégées - SFD Admin */}
            <Route path="/agency-dashboard" element={
              <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
                <SfdAdminDashboard />
              </RoleGuard>
            } />
            <Route path="/sfd-clients" element={
              <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
                <SfdClientsPage />
              </RoleGuard>
            } />
            <Route path="/sfd-subsidy-requests" element={
              <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
                <SfdSubsidyRequestsPage />
              </RoleGuard>
            } />
            <Route path="/sfd-loans" element={
              <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
                <SfdLoansPage />
              </RoleGuard>
            } />
            
            {/* Pages protégées - Client */}
            <Route path="/mobile-flow/*" element={
              <RoleGuard requiredRole={UserRole.CLIENT}>
                <MobileFlowPage />
              </RoleGuard>
            } />
            
            {/* Page d'accès refusé */}
            <Route path="/access-denied" element={<AccessDeniedPage />} />
            
            {/* Page 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
