
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Footer } from '@/components';

// Landing page
import LandingPage from '@/pages/LandingPage';

// Auth components
import { AuthProvider } from '@/hooks/auth/AuthContext';

// Auth pages
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ClientLoginPage from '@/pages/ClientLoginPage';
import SfdLoginPage from '@/pages/SfdLoginPage';
import AdminLoginPage from '@/pages/AdminLoginPage';

// Route protection components
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import PermissionProtectedRoute from '@/components/routes/PermissionProtectedRoute';

// Pages
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import MerefSubsidyRequestPage from '@/pages/MerefSubsidyRequestPage';
import SfdTransactionsPage from '@/pages/SfdTransactionsPage';
import SfdClientsPage from '@/pages/SfdClientsPage';
import SfdLoansPage from '@/pages/SfdLoansPage';
import SfdAdminDashboard from '@/components/admin/SfdAdminDashboard';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import AuditLogsPage from '@/pages/AuditLogsPage';
import SubsidyRequestDetailPage from '@/pages/SubsidyRequestDetailPage';
import CreditApprovalPage from '@/pages/CreditApprovalPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/client/login" element={<ClientLoginPage />} />
        <Route path="/sfd/auth" element={<SfdLoginPage />} />
        <Route path="/admin/auth" element={<AdminLoginPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        
        {/* Protected routes */}
        <Route path="/super-admin-dashboard" element={
          <PermissionProtectedRoute requiredRole="admin">
            <SuperAdminDashboard />
          </PermissionProtectedRoute>
        } />
        
        <Route path="/agency-dashboard" element={
          <PermissionProtectedRoute requiredRole="sfd_admin">
            <SfdAdminDashboard />
          </PermissionProtectedRoute>
        } />

        <Route path="/credit-approval" element={
          <PermissionProtectedRoute requiredRole="admin">
            <CreditApprovalPage />
          </PermissionProtectedRoute>
        } />

        <Route path="/audit-logs" element={
          <PermissionProtectedRoute requiredRole="admin">
            <AuditLogsPage />
          </PermissionProtectedRoute>
        } />

        <Route path="/subsidy-request/:id" element={
          <PermissionProtectedRoute requiredRole="admin">
            <SubsidyRequestDetailPage />
          </PermissionProtectedRoute>
        } />

        {/* SFD Routes */}
        <Route path="/sfd/transactions" element={
          <PermissionProtectedRoute requiredRole="sfd_admin">
            <SfdTransactionsPage />
          </PermissionProtectedRoute>
        } />

        <Route path="/sfd/clients" element={
          <PermissionProtectedRoute requiredRole="sfd_admin">
            <SfdClientsPage />
          </PermissionProtectedRoute>
        } />

        <Route path="/sfd/loans" element={
          <PermissionProtectedRoute requiredRole="sfd_admin">
            <SfdLoansPage />
          </PermissionProtectedRoute>
        } />

        <Route path="/sfd/subsidies" element={
          <PermissionProtectedRoute requiredRole="sfd_admin">
            <MerefSubsidyRequestPage />
          </PermissionProtectedRoute>
        } />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <Footer />
    </AuthProvider>
  );
}

export default App;
