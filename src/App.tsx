
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
import AgencyDashboardPage from '@/pages/AgencyDashboardPage';
import SfdLoginPage from '@/pages/SfdLoginPage';
import ClientLoginPage from '@/pages/ClientLoginPage';
import ClientsPage from '@/pages/sfd/ClientsPage';
import LoansPage from '@/pages/sfd/LoansPage';
import AdhesionRequestsPage from '@/pages/sfd/AdhesionRequestsPage';

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Splash and Auth Routes */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/auth" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/access-denied" element={<AccessDeniedPage />} />
            <Route path="/permission-test" element={<PermissionTestPage />} />
            
            {/* Admin Auth Routes - separate login pages for different admin types */}
            <Route path="/admin/auth" element={<AdminLoginPage />} />
            <Route path="/sfd/auth" element={<SfdLoginPage />} />
            <Route path="/client/auth" element={<ClientLoginPage />} />
            
            {/* Admin Dashboard Routes */}
            <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
            <Route path="/credit-approval" element={<CreditApprovalPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/sfd-management" element={<AdminMerefFundingPage />} />
            <Route path="/admin/users" element={<UsersManagementPage />} />
            <Route path="/role-testing" element={<RoleTestingPage />} />
            
            {/* SFD Admin Routes */}
            <Route path="/agency-dashboard" element={<AgencyDashboardPage />} />
            <Route path="/sfd-admin-dashboard" element={<SfdAdminDashboardPage />} />
            <Route path="/sfd-clients" element={<ClientsPage />} />
            <Route path="/sfd-loans" element={<LoansPage />} />
            <Route path="/sfd-adhesion-requests" element={<AdhesionRequestsPage />} />
            
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
