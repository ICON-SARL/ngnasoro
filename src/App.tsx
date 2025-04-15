
import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from '@/hooks/auth/AuthContext';
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
import WelcomeScreen from './components/mobile/WelcomeScreen';
import NotFoundPage from './pages/NotFoundPage';
import AuthRedirectPage from './pages/AuthRedirectPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ClientLoginPage from './pages/ClientLoginPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthRedirectPage />,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/login",
    element: <AuthRedirectPage />,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/auth",
    element: (
      <AnonymousOnlyGuard>
        <ClientLoginPage />
      </AnonymousOnlyGuard>
    ),
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/admin/auth",
    element: (
      <AnonymousOnlyGuard>
        <AdminLoginPage />
      </AnonymousOnlyGuard>
    ),
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/sfd/auth",
    element: (
      <AnonymousOnlyGuard>
        <LoginPage isSfdAdmin={true} />
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
    path: "/mobile-flow/welcome",
    element: (
      <WelcomeScreen onStart={() => window.location.href = '/mobile-flow/main'} />
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
  {
    path: "*",
    element: <NotFoundPage />,
    errorElement: <RouteErrorBoundary />
  }
]);

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
