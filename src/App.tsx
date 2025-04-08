
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Footer } from '@/components';

// Auth components
import { AuthProvider } from '@/hooks/auth/AuthContext';
import LoginPage from '@/pages/LoginPage';

// Import pages
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import MobileFlow from '@/pages/MobileFlow';
import SfdDashboardPage from '@/pages/SfdDashboardPage';
import SfdClientsPage from '@/pages/SfdClientsPage';
import SfdTransactionsPage from '@/pages/SfdTransactionsPage';
import SfdStatsPage from '@/pages/SfdStatsPage';
import SfdSettingsPage from '@/pages/SfdSettingsPage';
import SfdLoansPage from '@/pages/SfdLoansPage';
import SfdAdminListPage from '@/pages/SfdAdminListPage';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import SuperAdminSfdList from '@/pages/SuperAdminSfdList';
import CreditApprovalPage from '@/pages/CreditApprovalPage';
import NotFoundPage from '@/pages/NotFoundPage';
import MerefSubsidyRequestPage from '@/pages/MerefSubsidyRequestPage';
import MerefLoanManagementPage from '@/pages/MerefLoanManagementPage';

// Route protection components
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import PermissionProtectedRoute from '@/components/routes/PermissionProtectedRoute';

// Role types and permissions
import { UserRole, PERMISSIONS } from '@/utils/auth/roleTypes';

function AppWithFooter() {
  return (
    <>
      <AppRoutes />
      <Footer />
    </>
  );
}

// Main routes component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing page route */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/index" element={<Navigate to="/" replace />} />
      
      {/* Public Authentication routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      
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
      
      {/* SFD Admin routes */}
      <Route 
        path="/sfd-admin-dashboard" 
        element={
          <PermissionProtectedRoute 
            component={SfdDashboardPage} 
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
            component={SfdDashboardPage} 
            requiredRole={UserRole.SFD_ADMIN}
            fallbackPath="/access-denied"
          />
        }
      />

      <Route 
        path="/agency-clients" 
        element={
          <PermissionProtectedRoute 
            component={SfdClientsPage} 
            requiredPermission={PERMISSIONS.MANAGE_CLIENTS}
            fallbackPath="/access-denied"
          />
        }
      />
      
      <Route 
        path="/agency-transactions" 
        element={
          <PermissionProtectedRoute 
            component={SfdTransactionsPage} 
            requiredPermission={PERMISSIONS.ACCESS_SFD_DASHBOARD}
            fallbackPath="/access-denied"
          />
        } 
      />
      
      <Route 
        path="/agency-stats" 
        element={
          <PermissionProtectedRoute 
            component={SfdStatsPage} 
            requiredPermission={PERMISSIONS.ACCESS_SFD_DASHBOARD}
            fallbackPath="/access-denied"
          />
        } 
      />
      
      <Route 
        path="/agency-settings" 
        element={
          <PermissionProtectedRoute 
            component={SfdSettingsPage} 
            requiredPermission={PERMISSIONS.ACCESS_SFD_DASHBOARD}
            fallbackPath="/access-denied"
          />
        } 
      />
      
      <Route 
        path="/agency-loans" 
        element={
          <PermissionProtectedRoute 
            component={SfdLoansPage} 
            requiredPermission={PERMISSIONS.MANAGE_LOANS}
            fallbackPath="/access-denied"
          />
        } 
      />
      
      <Route 
        path="/agency-admins" 
        element={
          <PermissionProtectedRoute 
            component={SfdAdminListPage} 
            requiredPermission={PERMISSIONS.MANAGE_ADMINS}
            fallbackPath="/access-denied"
          />
        } 
      />
      
      <Route
        path="/meref-subsidy"
        element={
          <PermissionProtectedRoute 
            component={MerefSubsidyRequestPage} 
            requiredRole={UserRole.SFD_ADMIN}
            fallbackPath="/access-denied"
          />
        }
      />
      
      <Route
        path="/meref-loan-management"
        element={
          <PermissionProtectedRoute 
            component={MerefLoanManagementPage} 
            requiredRole={UserRole.SFD_ADMIN}
            fallbackPath="/access-denied"
          />
        }
      />
      
      <Route
        path="/super-admin-sfds"
        element={
          <PermissionProtectedRoute 
            component={SuperAdminSfdList} 
            requiredRole={UserRole.SUPER_ADMIN}
            fallbackPath="/access-denied"
          />
        }
      />
      
      {/* Mobile flow route */}
      <Route
        path="/mobile-flow/*"
        element={
          <ProtectedRoute component={MobileFlow} />
        }
      />
      
      {/* Fallback route */}
      <Route path="*" element={<NotFoundPage />} />
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
