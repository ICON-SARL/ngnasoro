
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import PermissionTestPage from '@/pages/PermissionTestPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import MobileFlowPage from '@/pages/MobileFlowPage';
import { UserRole } from '@/utils/auth/roleTypes';
import AgencyManagementPage from '@/pages/admin/AgencyManagementPage';
import SfdManagementPage from '@/pages/admin/SfdManagementPage';

// Creating a MobileRouter component that can be exported
export const MobileRouter = () => {
  return (
    <Routes>
      {/* Mobile routes can be defined here */}
      <Route path="/" element={<div>Mobile Home</div>} />
      <Route path="/main" element={<div>Mobile Main</div>} />
      <Route path="/loan-activity" element={<div>Loan Activity</div>} />
      <Route path="*" element={<div>Mobile Page Not Found</div>} />
    </Routes>
  );
};

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Page */}
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        
        {/* Mobile Flow */}
        <Route path="/mobile-flow/*" element={<MobileFlowPage />} />
        
        {/* Agency Management Pages */}
        <Route path="/agency-dashboard" element={
          <ProtectedRoute>
            <AgencyManagementPage />
          </ProtectedRoute>
        } />
        
        {/* SFD Management Pages */}
        <Route path="/sfd-management" element={
          <ProtectedRoute requiredRoles={['admin', 'superadmin']}>
            <SfdManagementPage />
          </ProtectedRoute>
        } />
        
        {/* Permission Test Page */}
        <Route path="/permission-test" element={<PermissionTestPage />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
