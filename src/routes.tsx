
import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom';
import App from './App';
import { MobileRouter, AuthRoutes } from './components/Router';
import MobileFlowPage from './pages/mobile/MobileFlowPage';
import FundsManagementPage from './pages/mobile/FundsManagementPage';
import MobileDiagnosticsPage from './pages/mobile/MobileDiagnosticsPage';
import MobileLoanApplicationPage from './pages/mobile/MobileLoanApplicationPage';
import LoanDetailsPage from './pages/mobile/LoanDetailsPage';
import SplashScreen from './components/mobile/SplashScreen';
import UnauthorizedPage from './pages/UnauthorizedPage';
import AccessDeniedPage from './pages/AccessDeniedPage';

const router = createBrowserRouter([
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
        element: <div>Authentication Page</div>,
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
      // Auth routes
      <AuthRoutes />,
      {
        path: 'access-denied',
        element: <AccessDeniedPage />
      },
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />
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
        element: <div>Mobile Dashboard</div>,
      },
      {
        path: 'profile',
        element: <div>Mobile Profile</div>,
      },
      {
        path: 'loans',
        element: <div>Mobile Loans</div>,
      },
      {
        path: 'funds-management',
        element: <FundsManagementPage />,
      },
      {
        path: 'transactions',
        element: <div>Mobile Transactions</div>,
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
        index: true,
        element: <SplashScreen />,
      },
      // Include all mobile routes
      <MobileRouter />,
    ],
  },
]);

export default router;
