
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import App from './App';
import { Outlet } from 'react-router-dom';
import MobileFlowPage from './pages/mobile/MobileFlowPage';
import FundsManagementPage from './pages/mobile/FundsManagementPage';
import MobileDiagnosticsPage from './pages/mobile/MobileDiagnosticsPage';
import MobileLoanApplicationPage from './pages/mobile/MobileLoanApplicationPage';
import LoanDetailsPage from './pages/mobile/LoanDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import PermissionTestPage from './pages/PermissionTestPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import MobileApp from './pages/mobile/MobileApp';
import AccountPage from './components/mobile/account/AccountPage';
import SfdAdhesionPage from './pages/mobile/SfdAdhesionPage';
import SfdSelectorPage from './pages/SfdSelectorPage';
import { LoanActivityPage } from './pages/mobile/LoanActivityPage';
import ProfilePage from './components/mobile/profile/ProfilePage';
import SfdConnectionPage from './pages/mobile/SfdConnectionPage';
import MobileLoanPlansPage from './pages/mobile/MobileLoanPlansPage';
import MobileMyLoansPage from './pages/mobile/MobileMyLoansPage';
import SplashScreen from './components/mobile/SplashScreen';
import KycVerificationHistoryPage from './pages/KycVerificationHistoryPage';
import KYCVerification from './pages/KYCVerification';
import MobileLoansPage from './pages/mobile/MobileLoansPage';
import HomeLoanPage from './components/mobile/loan/HomeLoanPage';
import TransferPage from './pages/mobile/TransferPage';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <div>Welcome to the App</div>,
      },
      {
        path: 'auth',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'access-denied',
        element: <AccessDeniedPage />,
      },
      {
        path: 'permission-test',
        element: <PermissionTestPage />,
      },
      {
        path: 'dashboard',
        element: <div>Dashboard Page</div>,
      },
      {
        path: 'admin',
        children: [
          {
            path: 'loan-plans',
            element: <div>Admin Loan Plans</div>,
          },
        ],
      },
    ],
  },
  // Mobile routes
  {
    path: '/mobile-flow',
    element: <MobileFlowPage />,
    children: [
      {
        path: 'dashboard',
        element: <MobileApp />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'loans',
        element: <HomeLoanPage />,
      },
      {
        path: 'funds-management',
        element: <FundsManagementPage />,
      },
      {
        path: 'transactions',
        element: <div>Transactions</div>,
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
        path: 'diagnostics',
        element: <MobileDiagnosticsPage />,
      },
      {
        path: 'sfd-adhesion/:sfdId',
        element: <SfdAdhesionPage />,
      },
      {
        path: 'sfd-selector',
        element: <SfdSelectorPage />,
      },
      {
        path: 'sfd-connection',
        element: <SfdConnectionPage />,
      },
      {
        path: 'loan-activity',
        element: <LoanActivityPage />,
      },
      {
        path: 'loan-plans',
        element: <MobileLoanPlansPage />,
      },
      {
        path: 'my-loans',
        element: <MobileMyLoansPage />,
      },
      {
        path: 'kyc',
        element: <KycVerificationHistoryPage />,
      },
      {
        path: 'transfers',
        element: <TransferPage />,
      },
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />,
      },
      {
        index: true,
        element: <MobileApp />,
      },
    ],
  },
  {
    path: '/kyc',
    element: <KYCVerification />,
  },
  {
    path: '*',
    element: <div>Page Not Found</div>,
  },
];

const router = createBrowserRouter(routes);

export default router;
