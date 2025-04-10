import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Auth and Public Components
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import SfdAuthUI from '@/components/auth/SfdAuthUI';
import AdminAuthUI from '@/components/auth/AdminAuthUI';

// Protected Components
import ProtectedRoute from '@/components/ProtectedRoute';
import PermissionProtectedRoute from '@/components/PermissionProtectedRoute';
import ProfilePage from '@/pages/ProfilePage';
import DashboardPage from '@/pages/DashboardPage';
import MobileFlowPage from '@/pages/MobileFlowPage';
import SfdSetupPage from '@/pages/SfdSetupPage';
import SfdSetupAssistantPage from '@/pages/SfdSetupAssistantPage';
import SecurePaymentPage from '@/pages/SecurePaymentPage';
import UserProfilePage from '@/pages/UserProfilePage';

// Admin Components
import SuperAdminDashboardPage from '@/pages/SuperAdminDashboardPage';
import AgencyDashboardPage from '@/pages/AgencyDashboardPage';
import AdminUsersPage from '@/pages/AdminUsersPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import ClientsPage from '@/pages/ClientsPage';
import SfdClientsPage from '@/pages/SfdClientsPage';
import SfdLoansPage from '@/pages/SfdLoansPage';
import SfdSubsidyRequestsPage from '@/pages/SfdSubsidyRequestsPage';
import SfdDashboardPage from '@/pages/SfdDashboardPage';
import NotFoundPage from '@/pages/NotFoundPage';

const Router = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && window.location.pathname === '/auth') {
      // Redirect based on role
      if (user.app_metadata?.role === 'admin') {
        window.location.href = '/super-admin-dashboard';
      } else {
        window.location.href = '/mobile-flow/main';
      }
    }
  }, [user, loading]);
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/sfd/auth" element={<SfdAuthUI />} />
        <Route path="/admin/auth" element={<AdminAuthUI />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        
        {/* Auth routes */}
        <Route path="/user-profile/:userId" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
        
        {/* Protected routes */}
        <Route path="/mobile-flow/*" element={<ProtectedRoute><MobileFlowPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/sfd-setup" element={<ProtectedRoute><SfdSetupAssistantPage /></ProtectedRoute>} />
        
        {/* Admin routes */}
        <Route
          path="/super-admin-dashboard"
          element={
            <PermissionProtectedRoute requiredPermission="view_dashboard">
              <SuperAdminDashboardPage />
            </PermissionProtectedRoute>
          }
        />
        <Route
          path="/agency-dashboard"
          element={
            <PermissionProtectedRoute requiredPermission="view_agency_dashboard">
              <AgencyDashboardPage />
            </PermissionProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PermissionProtectedRoute requiredPermission="manage_users">
              <AdminUsersPage />
            </PermissionProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <PermissionProtectedRoute requiredPermission="manage_clients">
              <ClientsPage />
            </PermissionProtectedRoute>
          }
        />
        
        {/* SFD admin routes */}
        <Route
          path="/sfd-clients"
          element={
            <PermissionProtectedRoute 
              requiredPermission="manage_clients"
            >
              <SfdClientsPage />
            </PermissionProtectedRoute>
          }
        />
        
        {/* Not found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
