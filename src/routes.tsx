
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
// Modified imports to use correct paths
import MobileFlowPage from './pages/MobileFlowPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import SfdLoginPage from './pages/SfdLoginPage';
import AuthRedirectPage from './pages/AuthRedirectPage';
import SfdSetupPage from './pages/SfdSetupPage';
import SfdSelectorPage from './pages/SfdSelectorPage';
import CreditApprovalPage from './pages/CreditApprovalPage';
import PremiumDashboardPage from './pages/PremiumDashboard';
import SfdManagementPage from './pages/admin/SfdManagementPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import ProtectedRoute from './components/routes/ProtectedRoute';
import PermissionProtectedRoute from './components/routes/PermissionProtectedRoute';
import PrivateLayout from './components/layouts/PrivateLayout';
import NotFound from './pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth" element={<LoginPage />} />
      <Route path="/login" element={<AuthRedirectPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/auth" element={<AdminLoginPage />} />
      <Route path="/sfd/auth" element={<SfdLoginPage />} />
      <Route path="/sfd-selector" element={<SfdSelectorPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<Navigate to="/mobile-flow" replace />} />
      
      {/* Mobile Flow Routes */}
      <Route path="/mobile-flow/*" element={
        <ProtectedRoute>
          <MobileFlowPage />
        </ProtectedRoute>
      } />
      
      {/* SFD Setup Route */}
      <Route path="/sfd-setup" element={
        <ProtectedRoute>
          <PrivateLayout>
            <SfdSetupPage />
          </PrivateLayout>
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/super-admin-dashboard" element={
        <ProtectedRoute requireAdmin={true}>
          <PremiumDashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/credit-approval" element={
        <ProtectedRoute requireAdmin={true}>
          <CreditApprovalPage />
        </ProtectedRoute>
      } />
      <Route path="/sfd-management" element={
        <ProtectedRoute requireAdmin={true}>
          <SfdManagementPage />
        </ProtectedRoute>
      } />
      
      {/* Fallback Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
