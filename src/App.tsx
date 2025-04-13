
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProfilePage from '@/pages/ProfilePage';
import SfdSelectorPage from '@/pages/SFDSelector';
import MobileFlowPage from '@/pages/MobileFlowPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import ClientLoginPage from '@/pages/ClientLoginPage';
import SfdLoginPage from '@/pages/SfdLoginPage';
import AuthRedirectPage from '@/pages/AuthRedirectPage';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import UsersManagementPage from '@/pages/UsersManagementPage';
import RoleGuard from '@/components/guards/RoleGuard';
import PermissionGuard from '@/components/guards/PermissionGuard';
import { UserRole, PERMISSIONS } from '@/utils/auth/roles';
import SfdLoansPage from '@/pages/SfdLoansPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import NotFoundPage from '@/pages/NotFoundPage';
import AuditLogsPage from '@/pages/AuditLogsPage';
import SfdManagementPage from '@/pages/SfdManagementPage';

// Create a client
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
            
            {/* Routes protégées - Super Admin (MEREF) */}
            <Route path="/super-admin-dashboard" element={
              <RoleGuard requiredRole={UserRole.SUPER_ADMIN}>
                <SuperAdminDashboard />
              </RoleGuard>
            } />
            <Route path="/credit-approval" element={
              <PermissionGuard requiredPermission={PERMISSIONS.VALIDATE_SFD_FUNDS}>
                <SfdManagementPage />
              </PermissionGuard>
            } />
            <Route path="/sfd-management" element={
              <PermissionGuard requiredPermission={PERMISSIONS.MANAGE_SFDS}>
                <SfdManagementPage />
              </PermissionGuard>
            } />
            <Route path="/admin/users" element={
              <PermissionGuard requiredPermission={PERMISSIONS.MANAGE_USERS}>
                <UsersManagementPage />
              </PermissionGuard>
            } />
            <Route path="/audit-logs" element={
              <RoleGuard requiredRole={UserRole.SUPER_ADMIN}>
                <AuditLogsPage />
              </RoleGuard>
            } />
            
            {/* Routes protégées - Admin SFD */}
            <Route path="/agency-dashboard" element={
              <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
                <ProfilePage />
              </RoleGuard>
            } />
            <Route path="/sfd-clients" element={
              <PermissionGuard requiredPermission={PERMISSIONS.MANAGE_CLIENTS}>
                <ProfilePage />
              </PermissionGuard>
            } />
            <Route path="/sfd-loans" element={
              <PermissionGuard requiredPermission={PERMISSIONS.MANAGE_SFD_LOANS}>
                <SfdLoansPage />
              </PermissionGuard>
            } />
            
            {/* Routes protégées - Client */}
            <Route path="/mobile-flow/*" element={
              <RoleGuard requiredRole={UserRole.CLIENT}>
                <MobileFlowPage />
              </RoleGuard>
            } />
            
            {/* Page d'accès refusé et 404 */}
            <Route path="/access-denied" element={<AccessDeniedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
