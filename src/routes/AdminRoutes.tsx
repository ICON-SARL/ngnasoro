
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLoginPage from '@/pages/AdminLoginPage';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import SfdManagementPage from '@/pages/SfdManagementPage';
import UsersManagementPage from '@/pages/UsersManagementPage';
import AdminRoleManagementPage from '@/pages/AdminRoleManagementPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import AccessDeniedPage from '@/pages/AccessDeniedPage';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="auth" element={<AdminLoginPage />} />
      <Route 
        path="dashboard" 
        element={
          <ProtectedRoute 
            component={SuperAdminDashboard} 
            requireAdmin={true} 
          />
        } 
      />
      <Route 
        path="sfd-management" 
        element={
          <ProtectedRoute 
            component={SfdManagementPage} 
            requireAdmin={true} 
          />
        } 
      />
      <Route 
        path="users-management" 
        element={
          <ProtectedRoute 
            component={UsersManagementPage} 
            requireAdmin={true} 
          />
        } 
      />
      <Route 
        path="role-management" 
        element={
          <ProtectedRoute 
            component={AdminRoleManagementPage} 
            requireAdmin={true} 
          />
        } 
      />
      <Route path="access-denied" element={<AccessDeniedPage />} />
      <Route path="*" element={<Navigate to="/admin/auth" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
