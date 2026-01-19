
import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from './components/RootLayout';
import Index from './pages/Index';
import OnboardingPage from './pages/OnboardingPage';
import LandingPage from './pages/LandingPage';
import SfdListPage from './pages/SfdListPage';
import FAQLandingPage from './pages/FAQLandingPage';
import ContactPage from './pages/ContactPage';
import CGUPage from './pages/legal/CGUPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import LegalMentionsPage from './pages/legal/LegalMentionsPage';
import MobileFlowPage from './pages/mobile/MobileFlowPage';
import MobileDashboardPage from './pages/mobile/MobileDashboardPage';
import WelcomePage from './pages/mobile/WelcomePage';
import { ErrorBoundary } from './components/ErrorBoundary';
import MobileLoansPage from './pages/mobile/MobileLoansPage';
import MobileProfilePage from './pages/mobile/MobileProfilePage';
import FundsManagementPage from './pages/mobile/FundsManagementPage';
import MobileDiagnosticsPage from './pages/mobile/MobileDiagnosticsPage';
import MobileLoanApplicationPage from './pages/mobile/MobileLoanApplicationPage';
import LoanDetailsPage from './pages/mobile/LoanDetailsPage';
import MobileMyLoansPage from './pages/mobile/MobileMyLoansPage';
import UnifiedLoansPage from './pages/mobile/UnifiedLoansPage';
import MobileLoanDetailsPage from './pages/mobile/MobileLoanDetailsPage';
import LoanRepaymentPage from './pages/mobile/LoanRepaymentPage';
import MobileLoanPlansPage from './pages/mobile/MobileLoanPlansPage';
import MobileLoanSimulatorPage from './pages/mobile/MobileLoanSimulatorPage';
import SfdSelectorPage from './pages/SfdSelectorPage';
import SfdSelectionPage from './pages/mobile/SfdSelectionPage';
import SfdAdhesionPage from './pages/mobile/SfdAdhesionPage';
import SupportPage from './pages/mobile/SupportPage';
import FAQPage from './pages/mobile/FAQPage';
import AccountsPage from './pages/mobile/AccountsPage';
import VaultsPage from './pages/mobile/VaultsPage';
import VaultsHubPage from './pages/mobile/VaultsHubPage';
import CreateVaultPage from './pages/mobile/CreateVaultPage';
import VaultDetailsPage from './pages/mobile/VaultDetailsPage';
import CollaborativeVaultsPage from './pages/mobile/CollaborativeVaultsPage';
import CreateCollaborativeVaultPage from './pages/mobile/CreateCollaborativeVaultPage';
import CollaborativeVaultDetailsPage from './pages/mobile/CollaborativeVaultDetailsPage';
import SfdLoginPage from './pages/SfdLoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import SfdClientsPage from './pages/SfdClientsPage';
import LoansPage from './pages/LoansPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SystemSettingsPage from './pages/admin/SystemSettingsPage';
import ClientAdhesionManagementPage from './pages/admin/ClientAdhesionManagementPage';
import KycUpgradePage from './pages/KycUpgradePage';
import MEREFDashboard from './pages/dashboards/MEREFDashboard';
import SfdAdminDashboard from './pages/dashboards/SfdAdminDashboard';
import CashierDashboard from './pages/dashboards/CashierDashboard';
import SfdManagementPage from './pages/SfdManagementPage';
import SfdApprovalManagementPage from './pages/SfdApprovalManagementPage';
import { SfdHeader } from './components/sfd/SfdHeader';
import RoleGuard from './components/RoleGuard';
import { MerefAdminLayout } from './components/admin/meref/layout/MerefAdminLayout';
import SubsidyApprovalsPage from './pages/meref/SubsidyApprovalsPage';
import LoansMonitoringPage from './pages/meref/LoansMonitoringPage';
import ReportsGenerationPage from './pages/meref/ReportsGenerationPage';
import CreditsApprovalsPage from './pages/meref/CreditsApprovalsPage';
import ApprovalsHistoryPage from './pages/meref/ApprovalsHistoryPage';
import SfdsManagementPage from './pages/meref/SfdsManagementPage';
import AdminsManagementPage from './pages/meref/AdminsManagementPage';
import UsersManagementPage from './pages/meref/UsersManagementPage';
import TontinesMonitoringPage from './pages/meref/TontinesMonitoringPage';
import MobileMoneyMonitoringPage from './pages/meref/MobileMoneyMonitoringPage';
import ReportsHistoryPage from './pages/meref/ReportsHistoryPage';
import MerefSystemSettingsPage from './pages/meref/MerefSystemSettingsPage';
import AuditLogsPage from './pages/meref/AuditLogsPage';
import MobileNotificationsPage from './pages/mobile/MobileNotificationsPage';
import SfdSetupPage from './pages/SfdSetupPage';
import JoinSfdPage from './pages/mobile/JoinSfdPage';
import SfdTransactionsPage from './pages/sfd/SfdTransactionsPage';
import SfdSubsidyRequestsPage from './pages/sfd/SfdSubsidyRequestsPage';
import SfdSettingsPage from './pages/sfd/SfdSettingsPage';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Default entry point - redirect to landing
      {
        path: '/',
        element: <Index />,
      },
      {
        path: '/landing',
        element: <LandingPage />,
      },
      {
        path: '/sfd-partners',
        element: <SfdListPage />,
      },
      {
        path: '/faq',
        element: <FAQLandingPage />,
      },
      {
        path: '/contact',
        element: <ContactPage />,
      },
      {
        path: '/legal/cgu',
        element: <CGUPage />,
      },
      {
        path: '/legal/privacy',
        element: <PrivacyPage />,
      },
      {
        path: '/legal/mentions',
        element: <LegalMentionsPage />,
      },
      
      // Onboarding route (première visite)
      {
        path: '/onboarding',
        element: <OnboardingPage />,
      },
  
  // Auth routes
  {
    path: '/auth',
    element: <LoginPage />,
  },
  {
    path: '/admin/auth',
    element: <AdminLoginPage />,
  },
  {
    path: '/sfd/auth',
    element: <SfdLoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/pending-approval',
    element: <PendingApprovalPage />,
  },
  {
    path: '/sfd-selection',
    element: <SfdSelectionPage />,
  },
  
  // Super Admin routes
  {
    path: '/super-admin-dashboard',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <MerefAdminLayout />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <SuperAdminDashboard /> },
    ],
  },
  {
    path: '/meref/approvals/sfds',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <MerefAdminLayout />
      </RoleGuard>
    ),
    children: [{ index: true, element: <SfdApprovalManagementPage /> }],
  },
  {
    path: '/meref/approvals/subsidies',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <MerefAdminLayout />
      </RoleGuard>
    ),
    children: [{ index: true, element: <SubsidyApprovalsPage /> }],
  },
  {
    path: '/meref/monitoring/loans',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <MerefAdminLayout />
      </RoleGuard>
    ),
    children: [{ index: true, element: <LoansMonitoringPage /> }],
  },
  {
    path: '/meref/reports/generate',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <MerefAdminLayout />
      </RoleGuard>
    ),
    children: [{ index: true, element: <ReportsGenerationPage /> }],
  },
  {
    path: '/meref/approvals/credits',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <MerefAdminLayout />
      </RoleGuard>
    ),
    children: [{ index: true, element: <CreditsApprovalsPage /> }],
  },
  {
    path: '/meref/approvals/history',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <MerefAdminLayout />
      </RoleGuard>
    ),
    children: [{ index: true, element: <ApprovalsHistoryPage /> }],
  },
  {
    path: '/meref/management/sfds',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <MerefAdminLayout />
      </RoleGuard>
    ),
    children: [{ index: true, element: <SfdsManagementPage /> }],
  },
  {
    path: '/meref/management/admins',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <MerefAdminLayout />
      </RoleGuard>
    ),
    children: [{ index: true, element: <AdminsManagementPage /> }],
  },
  {
    path: '/meref/management/users',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <MerefAdminLayout />
      </RoleGuard>
    ),
    children: [{ index: true, element: <UsersManagementPage /> }],
  },
  {
    path: '/meref/monitoring/tontines',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <MerefAdminLayout />
      </RoleGuard>
    ),
    children: [{ index: true, element: <TontinesMonitoringPage /> }],
  },
  {
    path: '/meref/monitoring/mobile-money',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <MerefAdminLayout />
      </RoleGuard>
    ),
    children: [{ index: true, element: <MobileMoneyMonitoringPage /> }],
  },
  {
    path: '/meref/reports/history',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <MerefAdminLayout />
      </RoleGuard>
    ),
    children: [{ index: true, element: <ReportsHistoryPage /> }],
  },
  {
    path: '/meref/system/settings',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <MerefAdminLayout />
      </RoleGuard>
    ),
    children: [{ index: true, element: <MerefSystemSettingsPage /> }],
  },
  {
    path: '/meref/system/logs',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <MerefAdminLayout />
      </RoleGuard>
    ),
    children: [{ index: true, element: <AuditLogsPage /> }],
  },
  {
    path: '/admin/system-settings',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <SystemSettingsPage />
      </RoleGuard>
    ),
  },
  {
    path: '/sfd-management',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <SfdManagementPage />
      </RoleGuard>
    ),
  },
  {
    path: '/sfd-approval',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <SfdApprovalManagementPage />
      </RoleGuard>
    ),
  },
  
  // SFD Admin routes
  {
    path: '/agency-dashboard',
    element: (
      <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied">
        <SfdAdminDashboard />
      </RoleGuard>
    ),
  },
  {
    path: '/cashier-dashboard',
    element: (
      <RoleGuard requiredRole="cashier" fallbackPath="/access-denied">
        <CashierDashboard />
      </RoleGuard>
    ),
  },
  {
    path: '/sfd-clients',
    element: (
      <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied">
        <SfdClientsPage />
      </RoleGuard>
    ),
  },
  {
    path: '/sfd-loans',
    element: (
      <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied">
        <LoansPage />
      </RoleGuard>
    ),
  },
  {
    path: '/sfd-transactions',
    element: (
      <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied">
        <SfdTransactionsPage />
      </RoleGuard>
    ),
  },
  {
    path: '/sfd-adhesion-requests',
    element: (
      <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied">
        <ClientAdhesionManagementPage />
      </RoleGuard>
    ),
  },
  {
    path: '/sfd-subsidy-requests',
    element: (
      <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied">
        <SfdSubsidyRequestsPage />
      </RoleGuard>
    ),
  },
  {
    path: '/sfd-settings',
    element: (
      <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied">
        <SfdSettingsPage />
      </RoleGuard>
    ),
  },
  
  // Redirection /mobile → /mobile-flow/dashboard
  {
    path: '/mobile',
    element: <Navigate to="/mobile-flow/dashboard" replace />,
  },
  
  // Mobile client routes
  {
    path: '/mobile-flow',
    element: (
      <RoleGuard requiredRole="client" fallbackPath="/access-denied">
        <MobileFlowPage />
      </RoleGuard>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      // Onboarding désactivé - accès direct au dashboard
      // {
      //   path: 'welcome',
      //   element: <WelcomePage />,
      // },
      {
        path: 'dashboard',
        element: <MobileDashboardPage />,
      },
      {
        path: 'main',
        element: <Navigate to="/mobile-flow/dashboard" replace />,
      },
      {
        path: 'profile',
        element: <MobileProfilePage />,
      },
      {
        path: 'kyc-upgrade',
        element: <KycUpgradePage />,
      },
      {
        path: 'loans',
        element: <MobileLoansPage />,
      },
      {
        path: 'my-loans',
        element: <MobileMyLoansPage />,
      },
      {
        path: 'funds-management',
        element: <FundsManagementPage />,
      },
      {
        path: 'diagnostics',
        element: <MobileDiagnosticsPage />,
      },
        {
          path: 'loans/:loanId',
          element: <MobileLoanDetailsPage />,
        },
        {
          path: 'loan/:loanId/repayment',
          element: <LoanRepaymentPage />,
        },
        {
          path: 'loan-plans',
          element: <MobileLoanPlansPage />,
        },
        {
          path: 'loan-simulator',
          element: <MobileLoanSimulatorPage />,
        },
        {
          path: 'loan-application',
          element: <MobileLoanApplicationPage />,
        },
      {
        path: 'loan-application/:planId',
        element: <MobileLoanApplicationPage />,
      },
      {
        path: 'loan-details/:loanId',
        element: <LoanDetailsPage />,
      },
      {
        path: 'sfd-selector',
        element: <SfdSelectorPage />,
      },
      {
        path: 'sfd-adhesion/:sfdId',
        element: <SfdAdhesionPage />,
      },
      {
        path: 'join-sfd',
        element: <JoinSfdPage />,
      },
      {
        path: 'support',
        element: <SupportPage />,
      },
      {
        path: 'faq',
        element: <FAQPage />,
      },
      {
        path: 'notifications',
        element: <MobileNotificationsPage />,
      },
      {
        path: 'accounts',
        element: <AccountsPage />,
      },
      {
        path: 'vaults-hub',
        element: <VaultsHubPage />,
      },
      {
        path: 'vaults',
        element: <VaultsPage />,
      },
      {
        path: 'create-vault',
        element: <CreateVaultPage />,
      },
        {
          path: 'vault/:vaultId',
          element: <VaultDetailsPage />,
        },
        {
          path: 'collaborative-vaults',
          element: <CollaborativeVaultsPage />,
        },
        {
          path: 'create-collaborative-vault',
          element: <CreateCollaborativeVaultPage />,
        },
        {
          path: 'collaborative-vault/:vaultId',
          element: <CollaborativeVaultDetailsPage />,
        },
    ],
  },
  
  // SFD Management route for clients
  {
    path: '/sfd-setup',
    element: (
      <RoleGuard requiredRole="client" fallbackPath="/access-denied">
        <SfdSetupPage />
      </RoleGuard>
    ),
  },
  
  // Error pages
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/access-denied',
    element: <AccessDeniedPage />,
  },
  ],
}]);

export default router;
