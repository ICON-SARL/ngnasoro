
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from '@/utils/auth/roleTypes';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import { SfdDashboardPage } from '@/pages/SfdDashboardPage';
import { SfdClientsPage } from '@/pages/SfdClientsPage';
import { SfdLoansPage } from '@/pages/SfdLoansPage';
import SfdRoleManagementPage from '@/pages/SfdRoleManagementPage';

const SfdRoutes = () => {
  return (
    <Routes>
      <Route 
        path="dashboard" 
        element={
          <ProtectedRoute 
            component={SfdDashboardPage} 
            requiredRole={UserRole.SFD_ADMIN}
          />
        } 
      />
      
      <Route 
        path="loans" 
        element={
          <ProtectedRoute 
            component={SfdLoansPage} 
            requiredRole={UserRole.SFD_ADMIN}
            requiredPermission="manage_loans"
          />
        } 
      />
      
      <Route 
        path="clients" 
        element={
          <ProtectedRoute 
            component={SfdClientsPage} 
            requiredRole={UserRole.SFD_ADMIN}
            requiredPermission="manage_clients"
          />
        } 
      />
      
      <Route 
        path="role-management" 
        element={
          <ProtectedRoute 
            component={SfdRoleManagementPage} 
            requiredRole={UserRole.SFD_ADMIN}
            requiredPermission="manage_users"
          />
        } 
      />
      
      <Route path="access-denied" element={<AccessDeniedPage />} />
      <Route path="*" element={<Navigate to="/sfd/dashboard" replace />} />
    </Routes>
  );
};

export default SfdRoutes;
