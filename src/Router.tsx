import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import PermissionTestPage from '@/pages/PermissionTestPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import { AuthProvider } from '@/hooks/auth/AuthContext';
import SfdDashboard from './pages/SfdDashboard';
import LoanDetailsPage from './pages/LoanDetailsPage';
import LoansPage from './pages/LoansPage';
import ClientsPage from './pages/ClientsPage';
import SfdClientsPage from './pages/SfdClientsPage';
import ClientDetailsPage from './pages/ClientDetailsPage';
import MobileFlowPage from './pages/MobileFlowPage';
import MobileWelcomePage from './pages/MobileWelcomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import ClientLoginPage from './pages/ClientLoginPage';

import LoanPlansPage from './components/mobile/loan/LoanPlansPage';
import PaymentPage from './pages/mobile/PaymentPage';
import AccountPage from './pages/mobile/AccountPage';
import MobileLoansPage from './pages/mobile/MobileLoansPage';
import MobileMyLoansPage from './pages/mobile/MobileMyLoansPage';
import MobileMainPage from './pages/mobile/MobileMainPage';
import SfdAdhesionPage from './pages/mobile/SfdAdhesionPage';
import SfdSetupPage from './pages/SfdSetupPage';

const Router = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/client-login" element={<ClientLoginPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          
          <Route path="/permission-test" element={<PermissionTestPage />} />
          
          <Route path="/sfd-setup" element={<ProtectedRoute><SfdSetupPage /></ProtectedRoute>} />
          
          <Route path="/mobile-flow" element={<ProtectedRoute><MobileFlowPage /></ProtectedRoute>}>
            <Route path="welcome" element={<MobileWelcomePage />} />
            <Route path="main" element={<MobileMainPage />} />
            <Route path="loans" element={<MobileLoansPage />} />
            <Route path="loan-plans" element={<LoanPlansPage />} />
            <Route path="my-loans" element={<MobileMyLoansPage />} />
            <Route path="loan-details/:id" element={<LoanDetailsPage />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="sfd-adhesion/:sfdId" element={<SfdAdhesionPage />} />
            <Route path="*" element={<Navigate to="main" replace />} />
          </Route>

          <Route path="/" element={<ProtectedRoute><SfdDashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><SfdDashboard /></ProtectedRoute>} />
          <Route path="/loans" element={<ProtectedRoute><LoansPage /></ProtectedRoute>} />
          <Route path="/loan/:loanId" element={<ProtectedRoute><LoanDetailsPage /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
          <Route path="/sfd-clients" element={<ProtectedRoute><SfdClientsPage /></ProtectedRoute>} />
          <Route path="/client/:clientId" element={<ProtectedRoute><ClientDetailsPage /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Router;
