
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import RoleGuard from '@/components/RoleGuard';
import SfdDashboardPage from '@/pages/SfdDashboardPage';
import SfdRoleManagementPage from '@/pages/SfdRoleManagementPage';
import SystemPermissionsPage from '@/pages/SystemPermissionsPage';

export const SfdRoutes = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={
          <RoleGuard requiredRole="sfd_admin">
            <SfdDashboardPage />
          </RoleGuard>
        }
      />
      <Route
        path="roles"
        element={
          <RoleGuard requiredRole="sfd_admin">
            <SfdRoleManagementPage />
          </RoleGuard>
        }
      />
      <Route
        path="permissions"
        element={
          <RoleGuard requiredRole="sfd_admin">
            <SystemPermissionsPage />
          </RoleGuard>
        }
      />
    </Routes>
  );
};

export default SfdRoutes;
