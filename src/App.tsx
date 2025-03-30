
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth components
import { AuthProvider } from '@/hooks/auth';

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
import SfdSubsidyRequestPage from '@/pages/SfdSubsidyRequestPage';
import SfdTransactionsPage from '@/pages/SfdTransactionsPage';
import SfdClientsPage from '@/pages/SfdClientsPage';
import SfdLoansPage from '@/pages/SfdLoansPage';
import SfdAdminDashboard from '@/components/admin/SfdAdminDashboard';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import AuditLogsPage from '@/pages/AuditLogsPage';
import SubsidyRequestDetailPage from '@/pages/SubsidyRequestDetailPage';
import MobileFlow from '@/pages/MobileFlow';

// Role types and permissions
import { UserRole, PERMISSIONS } from '@/utils/auth/roleTypes';
import { initializeSupabase } from '@/utils/initSupabase';

// Initialize Supabase data structures
initializeSupabase();

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Authentication routes */}
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        
        {/* Specialized Auth routes */}
        <Route path="/auth/client" element={<ClientLoginPage />} />
        <Route path="/sfd/auth" element={<SfdLoginPage />} />
        <Route path="/admin/auth" element={<AdminLoginPage />} />
        
        {/* Access denied page */}
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
        
        {/* Client routes */}
        <Route
          path="/mobile-flow/*"
          element={
            <ProtectedRoute component={MobileFlow} />
          }
        />
        
        {/* Legacy protected routes for backward compatibility */}
        <Route
          path="/agency-dashboard"
          element={
            <PermissionProtectedRoute 
              component={SfdAdminDashboard} 
              requiredRole={UserRole.SFD_ADMIN}
              fallbackPath="/access-denied"
            />
          }
        />
        
        {/* Fallback routes */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
