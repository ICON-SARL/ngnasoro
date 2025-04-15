
import { createBrowserRouter } from 'react-router-dom';
import AuthenticationPage from '@/pages/AuthenticationPage';
import LoanApplicationPage from '@/pages/LoanApplicationPage';
import ClientLoansPage from '@/pages/ClientLoansPage';
import MainDashboard from '@/components/mobile/MainDashboard';
import MobileHomePage from '@/pages/mobile/MobileHomePage';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import MobileLoanPlansPage from '@/pages/mobile/MobileLoanPlansPage';
import MobileLoanApplicationPage from '@/pages/mobile/MobileLoanApplicationPage';
import MobileLoansListPage from '@/pages/mobile/MobileLoansListPage';
import { mobileRoutes } from './mobile.routes';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthenticationPage />,
  },
  {
    path: '/auth',
    element: <AuthenticationPage />,
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
  ...mobileRoutes
]);
