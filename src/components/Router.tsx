
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import PermissionTestPage from '@/pages/PermissionTestPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import { UserRole } from '@/utils/auth/roleTypes';
import AgencyManagementPage from '@/pages/admin/AgencyManagementPage';
import SfdManagementPage from '@/pages/admin/SfdManagementPage';
import SfdAdminDashboard from '@/components/sfd/SfdAdminDashboard';
import MobileFlowPage from '@/pages/mobile/MobileFlowPage';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        
        <Route path="/mobile-flow/*" element={<MobileFlowPage />} />
        
        <Route 
          path="/agency-dashboard" 
          element={
            <ProtectedRoute requiredRoles={[UserRole.SFD_ADMIN]}>
              <SfdAdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/sfd-management" 
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SFD_ADMIN]}>
              <SfdManagementPage />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/permission-test" element={<PermissionTestPage />} />
        
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
