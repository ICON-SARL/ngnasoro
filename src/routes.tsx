
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import MobileFlowPage from './pages/mobile/MobileFlowPage';
import FundsManagementPage from './pages/mobile/FundsManagementPage';
import MobileDiagnosticsPage from './pages/mobile/MobileDiagnosticsPage';
import MobileLoanApplicationPage from './pages/mobile/MobileLoanApplicationPage';
import LoanDetailsPage from './pages/mobile/LoanDetailsPage';
import SfdLoansPage from './pages/SfdLoansPage';
import LoansPage from './pages/LoansPage';
import SfdAdhesionPage from './pages/mobile/SfdAdhesionPage';
import SfdSelectorPage from './pages/SfdSelectorPage';
import ProfilePage from '@/components/mobile/profile/ProfilePage';
import { LoanActivityPage } from './pages/mobile/LoanActivityPage';
import SfdConnectionPage from './pages/mobile/SfdConnectionPage';
import MobileLoanPlansPage from './pages/mobile/MobileLoanPlansPage';
import MobileMyLoansPage from './pages/mobile/MobileMyLoansPage';
import SplashScreen from './components/mobile/SplashScreen';
import KycVerificationHistoryPage from './pages/KycVerificationHistoryPage';
import HomeLoanPage from './components/mobile/loan/HomeLoanPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import PermissionTestPage from './pages/PermissionTestPage';
import MobileApp from './pages/mobile/MobileApp';
import { authRoutes } from './components/Router';

const router = createBrowserRouter([
  // Main App routes
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <div>Welcome to the App</div>,
      },
      // Import auth routes from the Router component
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
      // SFD routes
      {
        path: 'sfd-loans',
        element: <SfdLoansPage />,
      },
      {
        path: 'loans',
        element: <LoansPage />,
      },
    ],
  },
  
  // Mobile Flow routes
  {
    path: '/mobile-flow',
    element: <MobileFlowPage />,
    children: [
      {
        index: true,
        element: <SplashScreen />,
      },
      {
        path: 'splash',
        element: <SplashScreen />
      },
      {
        path: 'dashboard',
        element: <div>Mobile Dashboard</div>,
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
        path: 'loan-activity',
        element: <LoanActivityPage />,
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
        path: 'funds-management',
        element: <FundsManagementPage />,
      },
      {
        path: 'loan-plans',
        element: <MobileLoanPlansPage />,
      },
      {
        path: 'loan-application',
        element: <MobileLoanApplicationPage />,
      },
      {
        path: 'my-loans',
        element: <MobileMyLoansPage />,
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
        path: 'kyc',
        element: <KycVerificationHistoryPage />,
      },
      {
        path: '*',
        element: <div>Mobile Page Not Found</div>,
      },
    ],
  },
  
  // Mobile App routes
  {
    path: '/mobile-app',
    element: <MobileApp />,
    children: [
      {
        index: true,
        element: <div>Mobile App Home</div>,
      },
      {
        path: '*',
        element: <div>Mobile App Page Not Found</div>,
      },
    ],
  },
]);

export default router;
