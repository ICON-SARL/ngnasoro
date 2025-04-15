import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthenticationGuard from '@/components/AuthenticationGuard';
import AnonymousOnlyGuard from '@/components/AnonymousOnlyGuard';
import ErrorBoundary from '@/components/ErrorBoundary';
import RouteErrorBoundary from '@/components/RouteErrorBoundary';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ProfilePage from './pages/ProfilePage';
import MobileLayout from './layouts/MobileLayout';
import FinancialSnapshot from './pages/mobile/FinancialSnapshot';
import SfdSavings from './pages/mobile/SfdSavings';
import SfdLoans from './pages/mobile/SfdLoans';
import SfdSelectorPage from './pages/SfdSelectorPage';

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <AnonymousOnlyGuard>
        <LoginPage />
      </AnonymousOnlyGuard>
    ),
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/register",
    element: (
      <AnonymousOnlyGuard>
        <RegistrationPage />
      </AnonymousOnlyGuard>
    ),
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/mobile-flow/profile",
    element: (
      <AuthenticationGuard>
        <MobileLayout>
          <ProfilePage />
        </MobileLayout>
      </AuthenticationGuard>
    ),
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/mobile-flow/main",
    element: (
      <AuthenticationGuard>
        <MobileLayout>
          <FinancialSnapshot />
        </MobileLayout>
      </AuthenticationGuard>
    ),
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/mobile-flow/sfd-savings",
    element: (
      <AuthenticationGuard>
        <MobileLayout>
          <SfdSavings />
        </MobileLayout>
      </AuthenticationGuard>
    ),
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/mobile-flow/sfd-loans",
    element: (
      <AuthenticationGuard>
        <MobileLayout>
          <SfdLoans />
        </MobileLayout>
      </AuthenticationGuard>
    ),
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/mobile-flow/sfd-selector",
    element: <SfdSelectorPage />,
    errorElement: <RouteErrorBoundary />
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
