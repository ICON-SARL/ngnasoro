
import React from 'react';
import { Route } from 'react-router-dom';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import SfdManagementPage from '@/pages/SfdManagementPage';
import AuditLogsPage from '@/pages/AuditLogsPage';
import RoleTestingPage from '@/pages/RoleTestingPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import RoleGuard from '@/components/RoleGuard';
import { UserRole } from '@/hooks/auth/types';

export const AdminRoutes = () => {
  return (
    <>
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
      
      <Route path="/role-testing" element={
        <ProtectedRoute requireAdmin={true}>
          <RoleGuard requiredRole={UserRole.SuperAdmin}>
            <RoleTestingPage />
          </RoleGuard>
        </ProtectedRoute>
      } />
    </>
  );
};
