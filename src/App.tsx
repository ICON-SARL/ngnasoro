
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Footer } from '@/components';

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
import SfdSubsidyRequestPage from '@/pages/SfdSubsidyRequestPage';
import SfdTransactionsPage from '@/pages/SfdTransactionsPage';
import SfdClientsPage from '@/pages/SfdClientsPage';
import SfdLoansPage from '@/pages/SfdLoansPage';
import SfdAdminDashboard from '@/components/admin/SfdAdminDashboard';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import AuditLogsPage from '@/pages/AuditLogsPage';
import SubsidyRequestDetailPage from '@/pages/SubsidyRequestDetailPage';
import MobileFlow from '@/pages/MobileFlow';
import LoanApplicationPage from '@/pages/LoanApplicationPage';
import SfdManagementPage from '@/pages/SfdManagementPage';
import CreditApprovalPage from '@/pages/CreditApprovalPage';
import MerefSubsidyRequestPage from '@/pages/MerefSubsidyRequestPage';
import UsersManagementPage from '@/pages/UsersManagementPage';

// Role types and permissions
import { UserRole, PERMISSIONS } from '@/utils/auth/roleTypes';
import { initializeSupabase } from '@/utils/initSupabase';
import { Toaster } from "@/components/ui/toaster";

// Initialize Supabase data structures
initializeSupabase();

// Wrapper component that conditionally renders the Footer
const AppWithFooter = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/index';
  
  return (
    <>
      <AppRoutes />
      {isHomePage && <Footer />}
      <Toaster />
    </>
  );
};

// Main routes component
const AppRoutes = () => {
  return (
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
            requiredRole={UserRole.SUPER_ADMIN}
            fallbackPath="/access-denied"
          >
            <SuperAdminDashboard />
          </PermissionProtectedRoute>
        } 
      />
      
      {/* Credit Approval route */}
      <Route 
        path="/credit-approval" 
        element={
          <PermissionProtectedRoute 
            requiredPermission={PERMISSIONS.APPROVE_CREDIT}
            fallbackPath="/access-denied"
          >
            <CreditApprovalPage />
          </PermissionProtectedRoute>
        } 
      />
      
      {/* Add Loan Application route */}
      <Route
        path="/loan-application"
        element={
          <ProtectedRoute>
            <LoanApplicationPage />
          </ProtectedRoute>
        }
      />

      {/* Add MEREF Subsidy Request route - Modifier pour permettre l'accès avec le rôle SFD_ADMIN */}
      <Route
        path="/meref-subsidy-request"
        element={
          <PermissionProtectedRoute 
            requiredRole={UserRole.SFD_ADMIN}
            fallbackPath="/access-denied"
          >
            <MerefSubsidyRequestPage />
          </PermissionProtectedRoute>
        }
      />
      
      {/* SFD Admin routes */}
      <Route 
        path="/sfd-admin-dashboard" 
        element={
          <PermissionProtectedRoute 
            requiredRole={UserRole.SFD_ADMIN}
            fallbackPath="/access-denied"
          >
            <SfdAdminDashboard />
          </PermissionProtectedRoute>
        } 
      />
      
      {/* SFD functionality routes - Modifier pour utiliser le rôle plutôt que la permission */}
      <Route 
        path="/sfd-subsidy-requests" 
        element={
          <PermissionProtectedRoute 
            requiredRole={UserRole.SFD_ADMIN}
            fallbackPath="/access-denied"
          >
            <SfdSubsidyRequestPage />
          </PermissionProtectedRoute>
        } 
      />
      
      {/* Add Subsidy Request Detail route */}
      <Route 
        path="/sfd-subsidy-requests/:requestId" 
        element={
          <PermissionProtectedRoute 
            requiredRole={UserRole.SFD_ADMIN}
            fallbackPath="/access-denied"
          >
            <SubsidyRequestDetailPage />
          </PermissionProtectedRoute>
        } 
      />
      
      <Route 
        path="/sfd-transactions" 
        element={
          <PermissionProtectedRoute 
            requiredPermission={PERMISSIONS.ACCESS_SFD_DASHBOARD}
            fallbackPath="/access-denied"
          >
            <SfdTransactionsPage />
          </PermissionProtectedRoute>
        } 
      />
      
      <Route 
        path="/sfd-clients" 
        element={
          <PermissionProtectedRoute 
            requiredPermission={PERMISSIONS.MANAGE_CLIENTS}
            fallbackPath="/access-denied"
          >
            <SfdClientsPage />
          </PermissionProtectedRoute>
        } 
      />
      
      <Route 
        path="/sfd-loans" 
        element={
          <PermissionProtectedRoute 
            requiredPermission={PERMISSIONS.MANAGE_LOANS}
            fallbackPath="/access-denied"
          >
            <SfdLoansPage />
          </PermissionProtectedRoute>
        } 
      />

      {/* Audit Logs page */}
      <Route
        path="/audit-logs"
        element={
          <PermissionProtectedRoute
            requiredPermission={PERMISSIONS.EXPORT_DATA}
            fallbackPath="/access-denied"
          >
            <AuditLogsPage />
          </PermissionProtectedRoute>
        }
      />
      
      {/* Client routes */}
      <Route
        path="/mobile-flow/*"
        element={
          <ProtectedRoute>
            <MobileFlow />
          </ProtectedRoute>
        }
      />
      
      {/* Legacy protected routes for backward compatibility */}
      <Route
        path="/agency-dashboard"
        element={
          <PermissionProtectedRoute 
            requiredRole={UserRole.SFD_ADMIN}
            fallbackPath="/access-denied"
          >
            <SfdAdminDashboard />
          </PermissionProtectedRoute>
        }
      />
      
      {/* Admin Routes */}
      <Route path="/admin/users" element={
        <PermissionProtectedRoute 
          requiredPermission="manage_users"
          fallbackPath="/access-denied"
        >
          <UsersManagementPage />
        </PermissionProtectedRoute>
      } />
      
      {/* Fallback routes */}
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
      
      {/* SFD Management route */}
      <Route path="/sfd-management" element={<SfdManagementPage />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppWithFooter />
    </AuthProvider>
  );
}

export default App;
