import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import LoanApplicationPage from '@/pages/LoanApplicationPage';
import ClientLoansPage from '@/pages/ClientLoansPage';
import MainDashboard from '@/components/mobile/MainDashboard';
import MobileHomePage from '@/pages/MobileHomePage';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import MobileLoanPlansPage from '@/pages/mobile/MobileLoanPlansPage';
import MobileLoanApplicationPage from '@/pages/mobile/MobileLoanApplicationPage';
import MobileLoansListPage from '@/pages/mobile/MobileLoansListPage';
import { mobileRoutes } from './mobile.routes';
import { SfdManagementPage } from '@/pages/SfdManagementPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/auth',
    element: <LoginPage />,
  },
  {
    path: '/loans/apply',
    element: <LoanApplicationPage />,
  },
  {
    path: '/client/loans',
    element: <ClientLoansPage />,
  },
  {
    path: '/mobile-flow/main',
    element: <MobileHomePage />,
  },
  {
    path: '/sfd-management',
    element: <SfdManagementPage />
  },
  ...mobileRoutes
]);
