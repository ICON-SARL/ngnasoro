
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Auth and Public Components
import LoginPage from '@/pages/LoginPage';
import ClientLoginPage from '@/pages/ClientLoginPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import SfdAuthUI from '@/components/auth/SfdAuthUI';
import AdminAuthUI from '@/components/auth/AdminAuthUI';

// Protected Components
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import PermissionProtectedRoute from '@/components/routes/PermissionProtectedRoute';
import ProfilePage from '@/pages/ProfilePage';
import MobileFlowPage from '@/pages/MobileFlowPage';
import SfdSetupPage from '@/pages/SfdSetupPage';
import SfdSetupAssistantPage from '@/pages/SfdSetupAssistantPage';
import UserProfilePage from '@/pages/UserProfilePage';

// Admin Components
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import AgencyDashboard from '@/pages/AgencyDashboard';
import AuditLogsPage from '@/pages/AuditLogsPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import ClientsPage from '@/pages/ClientsPage';
import SfdClientsPage from '@/pages/SfdClientsPage';
import LoansPage from '@/pages/LoansPage';
import MerefSubsidyRequestPage from '@/pages/MerefSubsidyRequestPage';
import NotFound from '@/pages/NotFound';
import SfdManagementPage from '@/pages/SfdManagementPage';

const Router = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<LoginPage />} />
      <Route path="/auth" element={<ClientLoginPage />} />
      <Route path="/sfd/auth" element={<SfdAuthUI />} />
      <Route path="/admin/auth" element={<AdminAuthUI />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />
      
      {/* Auth routes - Using a different pattern for protected routes */}
      <Route path="/user-profile/:userId" element={
        <ProtectedRoute>
          <UserProfilePage />
        </ProtectedRoute>
      } />
      
      {/* Protected routes */}
      <Route path="/mobile-flow/*" element={
        <ProtectedRoute>
          <MobileFlowPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/sfd-setup" element={
        <ProtectedRoute>
          <SfdSetupAssistantPage />
        </ProtectedRoute>
      } />
      
      {/* Admin routes */}
      <Route
        path="/super-admin-dashboard"
        element={
          <PermissionProtectedRoute requiredPermission="view_dashboard">
            <SuperAdminDashboard />
          </PermissionProtectedRoute>
        }
      />
      <Route
        path="/agency-dashboard"
        element={
          <PermissionProtectedRoute requiredRole="sfd_admin">
            <AgencyDashboard />
          </PermissionProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PermissionProtectedRoute requiredPermission="manage_users">
            <AuditLogsPage />
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
      
      {/* Loan management */}
      <Route
        path="/loans"
        element={
          <PermissionProtectedRoute 
            requiredPermission="manage_loans"
          >
            <LoansPage />
          </PermissionProtectedRoute>
        }
      />
      
      {/* Subsidy request routes */}
      <Route
        path="/sfd-subsidy-requests"
        element={
          <PermissionProtectedRoute 
            requiredRole="sfd_admin"
          >
            <MerefSubsidyRequestPage />
          </PermissionProtectedRoute>
        }
      />
      
      {/* SFD Management Page */}
      <Route
        path="/sfd-management"
        element={
          <PermissionProtectedRoute 
            requiredPermission="manage_sfds"
          >
            <SfdManagementPage />
          </PermissionProtectedRoute>
        }
      />
      
      {/* Not found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;
