
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
      {!isHomePage && <Footer />}
      <Toaster />
    </>
  );
};

// Main routes component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing page route */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/index" element={<LandingPage />} />
      
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
      
      {/* Credit Approval route */}
      <Route 
        path="/credit-approval" 
        element={
          <PermissionProtectedRoute 
            component={CreditApprovalPage} 
            requiredPermission={PERMISSIONS.APPROVE_CREDIT}
            fallbackPath="/access-denied"
          />
        } 
      />
      
      {/* Add Loan Application route */}
      <Route
        path="/loan-application"
        element={
          <ProtectedRoute component={LoanApplicationPage} />
        }
      />

      {/* Add MEREF Subsidy Request route - Modifier pour permettre l'accès avec le rôle SFD_ADMIN */}
      <Route
        path="/meref-subsidy-request"
        element={
          <PermissionProtectedRoute 
            component={MerefSubsidyRequestPage} 
            requiredRole={UserRole.SFD_ADMIN}
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
      
      {/* SFD dashboard routes */}
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

      {/* SFD functionality routes */}
      <Route 
        path="/sfd-subsidy-requests" 
        element={
          <PermissionProtectedRoute 
            component={SfdSubsidyRequestPage} 
            requiredRole={UserRole.SFD_ADMIN}
            fallbackPath="/access-denied"
          />
        } 
      />
      
      <Route 
        path="/sfd-transactions" 
        element={
          <PermissionProtectedRoute 
            component={SfdTransactionsPage} 
            requiredPermission={PERMISSIONS.ACCESS_SFD_DASHBOARD}
            fallbackPath="/access-denied"
          />
        } 
      />
      
      <Route 
        path="/sfd-clients" 
        element={
          <PermissionProtectedRoute 
            component={SfdClientsPage} 
            requiredPermission={PERMISSIONS.MANAGE_CLIENTS}
            fallbackPath="/access-denied"
          />
        } 
      />
      
      <Route 
        path="/sfd-loans" 
        element={
          <PermissionProtectedRoute 
            component={SfdLoansPage} 
            requiredPermission={PERMISSIONS.MANAGE_LOANS}
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
            requiredPermission={PERMISSIONS.EXPORT_DATA}
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
      
      {/* SFD Management route */}
      <Route path="/sfd-management" element={<SfdManagementPage />} />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
