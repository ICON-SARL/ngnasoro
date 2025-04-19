
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/auth/AuthContext';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import PermissionTestPage from '@/pages/PermissionTestPage';
import MobileFlowPage from '@/pages/MobileFlowPage';
import SfdAdhesionPage from '@/pages/mobile/SfdAdhesionPage';
import SfdSelectorPage from '@/pages/SfdSelectorPage';
import { LoanActivityPage } from '@/pages/mobile/LoanActivityPage';
import ProfilePage from '@/components/mobile/profile/ProfilePage';
import SfdConnectionPage from '@/pages/mobile/SfdConnectionPage';
import FundsManagementPage from '@/pages/mobile/FundsManagementPage';
import LoanPlansPage from '@/pages/mobile/LoanPlansPage';
import MobileMyLoansPage from '@/pages/mobile/MobileMyLoansPage';
import LoanDetailsPage from '@/pages/mobile/LoanDetailsPage';
import SplashScreen from '@/components/mobile/SplashScreen';
import AdminLoginPage from '@/pages/AdminLoginPage';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import SfdAdminDashboardPage from '@/pages/SfdAdminDashboardPage';
import CreditApprovalPage from '@/pages/CreditApprovalPage';
import AuditLogsPage from '@/pages/AuditLogsPage';
import AdminMerefFundingPage from '@/pages/AdminMerefFundingPage';
import UsersManagementPage from '@/pages/UsersManagementPage';
import RoleTestingPage from '@/pages/RoleTestingPage';

// Create a new QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/auth" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/access-denied" element={<AccessDeniedPage />} />
            <Route path="/permission-test" element={<PermissionTestPage />} />
            
            {/* Admin Auth Routes */}
            <Route path="/admin/auth" element={<AdminLoginPage />} />
            <Route path="/sfd/auth" element={<AdminLoginPage />} />
            
            {/* Admin Dashboard Routes */}
            <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
            <Route path="/credit-approval" element={<CreditApprovalPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/sfd-management" element={<AdminMerefFundingPage />} />
            <Route path="/admin/users" element={<UsersManagementPage />} />
            <Route path="/role-testing" element={<RoleTestingPage />} />
            
            {/* Mobile Flow Routes */}
            <Route path="/mobile-flow/*" element={<MobileFlowPage />} />
            
            {/* Direct Mobile Routes */}
            <Route path="/sfd-selector" element={<SfdSelectorPage />} />
            <Route path="/sfd-adhesion/:sfdId" element={<SfdAdhesionPage />} />
            <Route path="/sfd-connection" element={<SfdConnectionPage />} />
            <Route path="/loan-activity" element={<LoanActivityPage />} />
            <Route path="/funds-management" element={<FundsManagementPage />} />
            <Route path="/loan-plans" element={<LoanPlansPage />} />
            <Route path="/my-loans" element={<MobileMyLoansPage />} />
            <Route path="/loan-details/:loanId" element={<LoanDetailsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Catch all route */}
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
