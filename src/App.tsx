
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth components
import { AuthProvider } from '@/hooks/auth/AuthProvider';

// Route protection components
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import PermissionProtectedRoute from '@/components/routes/PermissionProtectedRoute';

// Pages
import LoginPage from '@/pages/LoginPage';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import SfdSubsidyRequestPage from '@/pages/SfdSubsidyRequestPage';
import SfdTransactionsPage from '@/pages/SfdTransactionsPage';
import SfdClientsPage from '@/pages/SfdClientsPage'; // Fixed import
import SfdLoansPage from '@/pages/SfdLoansPage';
import SfdAdminDashboard from '@/components/admin/SfdAdminDashboard';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import AuditLogsPage from '@/pages/AuditLogsPage';

// Role types and permissions
import { UserRole, PERMISSIONS } from '@/utils/auth/roleTypes';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        
        {/* Protected routes with permissions */}
        <Route 
          path="/super-admin-dashboard" 
          element={
            <PermissionProtectedRoute 
              component={SuperAdminDashboard} 
              requiredRole={UserRole.SUPER_ADMIN}
              fallbackPath="/access-denied"
            />
          } 
        />
        
        {/* SFD Admin routes */}
        <Route 
          path="/sfd-admin-dashboard" 
          element={
            <PermissionProtectedRoute 
              component={SfdAdminDashboard} 
              requiredRole={UserRole.SFD_ADMIN}
              fallbackPath="/access-denied"
            />
          } 
        />
        
        {/* SFD functionality routes */}
        <Route 
          path="/sfd-subsidy-requests" 
          element={
            <PermissionProtectedRoute 
              component={SfdSubsidyRequestPage} 
              requiredPermission={PERMISSIONS.REQUEST_SUBSIDIES}
              fallbackPath="/access-denied"
            />
          } 
        />
        
        <Route 
          path="/sfd-transactions" 
          element={
            <PermissionProtectedRoute 
              component={SfdTransactionsPage} 
              requiredPermission={PERMISSIONS.VIEW_SFD}
              fallbackPath="/access-denied"
            />
          } 
        />
        
        <Route 
          path="/sfd-clients" 
          element={
            <PermissionProtectedRoute 
              component={SfdClientsPage} 
              requiredPermission={PERMISSIONS.VIEW_CLIENTS}
              fallbackPath="/access-denied"
            />
          } 
        />
        
        <Route 
          path="/sfd-loans" 
          element={
            <PermissionProtectedRoute 
              component={SfdLoansPage} 
              requiredPermission={PERMISSIONS.VIEW_LOANS}
              fallbackPath="/access-denied"
            />
          } 
        />

        {/* Audit Logs page */}
        <Route
          path="/audit-logs"
          element={
            <PermissionProtectedRoute
              component={AuditLogsPage}
              requiredPermission={PERMISSIONS.VIEW_AUDIT_LOGS}
              fallbackPath="/access-denied"
            />
          }
        />
        
        {/* Legacy protected routes for backward compatibility */}
        <Route
          path="/agency-dashboard"
          element={<ProtectedRoute component={SfdAdminDashboard} />}
        />
        
        {/* Fallback route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
