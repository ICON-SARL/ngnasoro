
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense, ReactNode } from 'react';
import RootLayout from './components/RootLayout';
import Index from './pages/Index';
import OnboardingPage from './pages/OnboardingPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import NotFoundPage from './pages/NotFoundPage';
import LoadingScreen from './components/ui/LoadingScreen';

// Lazy-loaded pages - Public
const SfdListPage = lazy(() => import('./pages/SfdListPage'));
const FAQLandingPage = lazy(() => import('./pages/FAQLandingPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CGUPage = lazy(() => import('./pages/legal/CGUPage'));
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage'));
const LegalMentionsPage = lazy(() => import('./pages/legal/LegalMentionsPage'));

// Lazy-loaded pages - Auth
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const SfdLoginPage = lazy(() => import('./pages/SfdLoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const PendingApprovalPage = lazy(() => import('./pages/PendingApprovalPage'));
const SfdSelectionPage = lazy(() => import('./pages/mobile/SfdSelectionPage'));
const AdhesionStatusPage = lazy(() => import('./pages/mobile/AdhesionStatusPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));
const AccessDeniedPage = lazy(() => import('./pages/AccessDeniedPage'));

// Lazy-loaded pages - Super Admin / MEREF
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const SfdApprovalManagementPage = lazy(() => import('./pages/SfdApprovalManagementPage'));
const SubsidyApprovalsPage = lazy(() => import('./pages/meref/SubsidyApprovalsPage'));
const LoansMonitoringPage = lazy(() => import('./pages/meref/LoansMonitoringPage'));
const ReportsGenerationPage = lazy(() => import('./pages/meref/ReportsGenerationPage'));
const CreditsApprovalsPage = lazy(() => import('./pages/meref/CreditsApprovalsPage'));
const ApprovalsHistoryPage = lazy(() => import('./pages/meref/ApprovalsHistoryPage'));
const SfdsManagementPage = lazy(() => import('./pages/meref/SfdsManagementPage'));
const AdminsManagementPage = lazy(() => import('./pages/meref/AdminsManagementPage'));
const UsersManagementPage = lazy(() => import('./pages/meref/UsersManagementPage'));
const TontinesMonitoringPage = lazy(() => import('./pages/meref/TontinesMonitoringPage'));
const MobileMoneyMonitoringPage = lazy(() => import('./pages/meref/MobileMoneyMonitoringPage'));
const ReportsHistoryPage = lazy(() => import('./pages/meref/ReportsHistoryPage'));
const MerefSystemSettingsPage = lazy(() => import('./pages/meref/MerefSystemSettingsPage'));
const AuditLogsPage = lazy(() => import('./pages/meref/AuditLogsPage'));
const MerefSfdLoansPage = lazy(() => import('./pages/meref/MerefSfdLoansPage'));
const SystemSettingsPage = lazy(() => import('./pages/admin/SystemSettingsPage'));
const SfdManagementPage = lazy(() => import('./pages/SfdManagementPage'));

// Lazy-loaded pages - SFD Admin
const SfdAdminDashboard = lazy(() => import('./pages/dashboards/SfdAdminDashboard'));
const CashierDashboard = lazy(() => import('./pages/dashboards/CashierDashboard'));
const SfdClientsPage = lazy(() => import('./pages/SfdClientsPage'));
const LoansPage = lazy(() => import('./pages/LoansPage'));
const ClientAdhesionManagementPage = lazy(() => import('./pages/admin/ClientAdhesionManagementPage'));
const SfdTransactionsPage = lazy(() => import('./pages/sfd/SfdTransactionsPage'));
const SfdSubsidyRequestsPage = lazy(() => import('./pages/sfd/SfdSubsidyRequestsPage'));
const SfdSettingsPage = lazy(() => import('./pages/sfd/SfdSettingsPage'));

// Lazy-loaded pages - Mobile
const MobileFlowPage = lazy(() => import('./pages/mobile/MobileFlowPage'));
const MobileDashboardPage = lazy(() => import('./pages/mobile/MobileDashboardPage'));
const MobileLoansPage = lazy(() => import('./pages/mobile/MobileLoansPage'));
const MobileProfilePage = lazy(() => import('./pages/mobile/MobileProfilePage'));
const FundsManagementPage = lazy(() => import('./pages/mobile/FundsManagementPage'));
const MobileDiagnosticsPage = lazy(() => import('./pages/mobile/MobileDiagnosticsPage'));
const MobileLoanApplicationPage = lazy(() => import('./pages/mobile/MobileLoanApplicationPage'));
const LoanDetailsPage = lazy(() => import('./pages/mobile/LoanDetailsPage'));
const MobileMyLoansPage = lazy(() => import('./pages/mobile/MobileMyLoansPage'));
const UnifiedLoansPage = lazy(() => import('./pages/mobile/UnifiedLoansPage'));
const MobileLoanDetailsPage = lazy(() => import('./pages/mobile/MobileLoanDetailsPage'));
const LoanRepaymentPage = lazy(() => import('./pages/mobile/LoanRepaymentPage'));
const MobileLoanPlansPage = lazy(() => import('./pages/mobile/MobileLoanPlansPage'));
const MobileLoanSimulatorPage = lazy(() => import('./pages/mobile/MobileLoanSimulatorPage'));
const SfdSelectorPage = lazy(() => import('./pages/SfdSelectorPage'));
const SfdAdhesionPage = lazy(() => import('./pages/mobile/SfdAdhesionPage'));
const SupportPage = lazy(() => import('./pages/mobile/SupportPage'));
const FAQPage = lazy(() => import('./pages/mobile/FAQPage'));
const AccountsPage = lazy(() => import('./pages/mobile/AccountsPage'));
const VaultsPage = lazy(() => import('./pages/mobile/VaultsPage'));
const VaultsHubPage = lazy(() => import('./pages/mobile/VaultsHubPage'));
const CreateVaultPage = lazy(() => import('./pages/mobile/CreateVaultPage'));
const VaultDetailsPage = lazy(() => import('./pages/mobile/VaultDetailsPage'));
const CollaborativeVaultsPage = lazy(() => import('./pages/mobile/CollaborativeVaultsPage'));
const CreateCollaborativeVaultPage = lazy(() => import('./pages/mobile/CreateCollaborativeVaultPage'));
const CollaborativeVaultDetailsPage = lazy(() => import('./pages/mobile/CollaborativeVaultDetailsPage'));
const KycUpgradePage = lazy(() => import('./pages/KycUpgradePage'));
const MobileNotificationsPage = lazy(() => import('./pages/mobile/MobileNotificationsPage'));
const SfdSetupPage = lazy(() => import('./pages/SfdSetupPage'));
const JoinSfdPage = lazy(() => import('./pages/mobile/JoinSfdPage'));
const MEREFDashboard = lazy(() => import('./pages/dashboards/MEREFDashboard'));

// Support Admin
const SupportAdminLayout = lazy(() => import('./components/support/SupportAdminLayout'));
const SupportAdminDashboard = lazy(() => import('./pages/SupportAdminDashboard'));
const SupportUsersPage = lazy(() => import('./pages/support/SupportUsersPage'));
const SupportSystemPage = lazy(() => import('./pages/support/SupportSystemPage'));
const SupportLogsPage = lazy(() => import('./pages/support/SupportLogsPage'));

// Lazy wrapper
const L = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<LoadingScreen message="Chargement..." />}>
    {children}
  </Suspense>
);

// Lazy-loaded RoleGuard
import RoleGuard from './components/RoleGuard';
import { MerefAdminLayout } from './components/admin/meref/layout/MerefAdminLayout';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Index /> },
      { path: '/landing', element: <LandingPage /> },
      { path: '/sfd-partners', element: <L><SfdListPage /></L> },
      { path: '/faq', element: <L><FAQLandingPage /></L> },
      { path: '/contact', element: <L><ContactPage /></L> },
      { path: '/legal/cgu', element: <L><CGUPage /></L> },
      { path: '/legal/privacy', element: <L><PrivacyPage /></L> },
      { path: '/legal/mentions', element: <L><LegalMentionsPage /></L> },
      { path: '/onboarding', element: <OnboardingPage /> },
      
      // Auth routes
      { path: '/auth', element: <LoginPage /> },
      { path: '/admin/auth', element: <L><AdminLoginPage /></L> },
      { path: '/sfd/auth', element: <L><SfdLoginPage /></L> },
      { path: '/forgot-password', element: <L><ForgotPasswordPage /></L> },
      { path: '/reset-password', element: <L><ResetPasswordPage /></L> },
      { path: '/pending-approval', element: <L><PendingApprovalPage /></L> },
      { path: '/sfd-selection', element: <L><SfdSelectionPage /></L> },
      { path: '/adhesion-status', element: <L><AdhesionStatusPage /></L> },
      
      // Super Admin routes
      {
        path: '/super-admin-dashboard',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><MerefAdminLayout /></RoleGuard>,
        children: [{ index: true, element: <L><SuperAdminDashboard /></L> }],
      },
      {
        path: '/meref/approvals/sfds',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><MerefAdminLayout /></RoleGuard>,
        children: [{ index: true, element: <L><SfdApprovalManagementPage /></L> }],
      },
      {
        path: '/meref/approvals/subsidies',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><MerefAdminLayout /></RoleGuard>,
        children: [{ index: true, element: <L><SubsidyApprovalsPage /></L> }],
      },
      {
        path: '/meref/monitoring/loans',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><MerefAdminLayout /></RoleGuard>,
        children: [{ index: true, element: <L><LoansMonitoringPage /></L> }],
      },
      {
        path: '/meref/reports/generate',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><MerefAdminLayout /></RoleGuard>,
        children: [{ index: true, element: <L><ReportsGenerationPage /></L> }],
      },
      {
        path: '/meref/approvals/credits',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><MerefAdminLayout /></RoleGuard>,
        children: [{ index: true, element: <L><CreditsApprovalsPage /></L> }],
      },
      {
        path: '/meref/approvals/history',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><MerefAdminLayout /></RoleGuard>,
        children: [{ index: true, element: <L><ApprovalsHistoryPage /></L> }],
      },
      {
        path: '/meref/management/sfds',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><MerefAdminLayout /></RoleGuard>,
        children: [{ index: true, element: <L><SfdsManagementPage /></L> }],
      },
      {
        path: '/meref/management/admins',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><MerefAdminLayout /></RoleGuard>,
        children: [{ index: true, element: <L><AdminsManagementPage /></L> }],
      },
      {
        path: '/meref/management/users',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><MerefAdminLayout /></RoleGuard>,
        children: [{ index: true, element: <L><UsersManagementPage /></L> }],
      },
      {
        path: '/meref/monitoring/tontines',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><MerefAdminLayout /></RoleGuard>,
        children: [{ index: true, element: <L><TontinesMonitoringPage /></L> }],
      },
      {
        path: '/meref/monitoring/mobile-money',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><MerefAdminLayout /></RoleGuard>,
        children: [{ index: true, element: <L><MobileMoneyMonitoringPage /></L> }],
      },
      {
        path: '/meref/reports/history',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><MerefAdminLayout /></RoleGuard>,
        children: [{ index: true, element: <L><ReportsHistoryPage /></L> }],
      },
      {
        path: '/meref/system/settings',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><MerefAdminLayout /></RoleGuard>,
        children: [{ index: true, element: <L><MerefSystemSettingsPage /></L> }],
      },
      {
        path: '/meref/system/logs',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><MerefAdminLayout /></RoleGuard>,
        children: [{ index: true, element: <L><AuditLogsPage /></L> }],
      },
      {
        path: '/meref/sfd-loans',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><MerefAdminLayout /></RoleGuard>,
        children: [{ index: true, element: <L><MerefSfdLoansPage /></L> }],
      },
      {
        path: '/admin/system-settings',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><L><SystemSettingsPage /></L></RoleGuard>,
      },
      {
        path: '/sfd-management',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><L><SfdManagementPage /></L></RoleGuard>,
      },
      {
        path: '/sfd-approval',
        element: <RoleGuard requiredRole="admin" fallbackPath="/access-denied"><L><SfdApprovalManagementPage /></L></RoleGuard>,
      },
      
      // SFD Admin routes
      {
        path: '/agency-dashboard',
        element: <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied"><L><SfdAdminDashboard /></L></RoleGuard>,
      },
      {
        path: '/cashier-dashboard',
        element: <RoleGuard requiredRole="cashier" fallbackPath="/access-denied"><L><CashierDashboard /></L></RoleGuard>,
      },
      {
        path: '/sfd-clients',
        element: <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied"><L><SfdClientsPage /></L></RoleGuard>,
      },
      {
        path: '/sfd-loans',
        element: <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied"><L><LoansPage /></L></RoleGuard>,
      },
      {
        path: '/sfd-transactions',
        element: <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied"><L><SfdTransactionsPage /></L></RoleGuard>,
      },
      {
        path: '/sfd-adhesion-requests',
        element: <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied"><L><ClientAdhesionManagementPage /></L></RoleGuard>,
      },
      {
        path: '/sfd-subsidy-requests',
        element: <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied"><L><SfdSubsidyRequestsPage /></L></RoleGuard>,
      },
      {
        path: '/sfd-settings',
        element: <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied"><L><SfdSettingsPage /></L></RoleGuard>,
      },
      
      // Mobile redirect
      { path: '/mobile', element: <Navigate to="/mobile-flow/dashboard" replace /> },
      
      // Mobile client routes
      {
        path: '/mobile-flow',
        element: <RoleGuard requiredRole="client" fallbackPath="/access-denied"><L><MobileFlowPage /></L></RoleGuard>,
        errorElement: <ErrorBoundary />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <MobileDashboardPage /> },
          { path: 'main', element: <Navigate to="/mobile-flow/dashboard" replace /> },
          { path: 'profile', element: <MobileProfilePage /> },
          { path: 'kyc-upgrade', element: <KycUpgradePage /> },
          { path: 'loans', element: <MobileLoansPage /> },
          { path: 'my-loans', element: <MobileMyLoansPage /> },
          { path: 'funds-management', element: <FundsManagementPage /> },
          { path: 'diagnostics', element: <MobileDiagnosticsPage /> },
          { path: 'loans/:loanId', element: <MobileLoanDetailsPage /> },
          { path: 'loan/:loanId/repayment', element: <LoanRepaymentPage /> },
          { path: 'loan-plans', element: <MobileLoanPlansPage /> },
          { path: 'loan-simulator', element: <MobileLoanSimulatorPage /> },
          { path: 'loan-application', element: <MobileLoanApplicationPage /> },
          { path: 'loan-application/:planId', element: <MobileLoanApplicationPage /> },
          { path: 'loan-details/:loanId', element: <LoanDetailsPage /> },
          { path: 'sfd-selector', element: <SfdSelectorPage /> },
          { path: 'sfd-adhesion/:sfdId', element: <SfdAdhesionPage /> },
          { path: 'join-sfd', element: <JoinSfdPage /> },
          { path: 'adhesion-status', element: <AdhesionStatusPage /> },
          { path: 'support', element: <SupportPage /> },
          { path: 'faq', element: <FAQPage /> },
          { path: 'notifications', element: <MobileNotificationsPage /> },
          { path: 'accounts', element: <AccountsPage /> },
          { path: 'vaults-hub', element: <VaultsHubPage /> },
          { path: 'vaults', element: <VaultsPage /> },
          { path: 'create-vault', element: <CreateVaultPage /> },
          { path: 'vault/:vaultId', element: <VaultDetailsPage /> },
          { path: 'collaborative-vaults', element: <CollaborativeVaultsPage /> },
          { path: 'create-collaborative-vault', element: <CreateCollaborativeVaultPage /> },
          { path: 'collaborative-vault/:vaultId', element: <CollaborativeVaultDetailsPage /> },
        ],
      },
      
      // SFD Setup
      {
        path: '/sfd-setup',
        element: <RoleGuard requiredRole="client" fallbackPath="/access-denied"><L><SfdSetupPage /></L></RoleGuard>,
      },
      
      // Support Admin routes
      {
        path: '/support-admin-dashboard',
        element: <RoleGuard requiredRole="support_admin" fallbackPath="/access-denied"><L><SupportAdminLayout /></L></RoleGuard>,
        children: [
          { index: true, element: <SupportAdminDashboard /> },
          { path: 'users', element: <SupportUsersPage /> },
          { path: 'system', element: <SupportSystemPage /> },
          { path: 'logs', element: <SupportLogsPage /> },
        ],
      },
      
      // Error pages
      { path: '/unauthorized', element: <L><UnauthorizedPage /></L> },
      { path: '/access-denied', element: <L><AccessDeniedPage /></L> },
      
      // Catch-all 404
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
