
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import AuthenticationGuard from '@/components/AuthenticationGuard';
import AnonymousOnlyGuard from '@/components/AnonymousOnlyGuard';
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
  },
  {
    path: "/register",
    element: (
      <AnonymousOnlyGuard>
        <RegistrationPage />
      </AnonymousOnlyGuard>
    ),
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
  },
  {
    path: "/mobile-flow/sfd-selector",
    element: <SfdSelectorPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
