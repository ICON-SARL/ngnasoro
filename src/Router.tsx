
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
import AdminLoginPage from './pages/AdminLoginPage';
import ClientLoginPage from './pages/ClientLoginPage';

const Router = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Pages */}
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/client-login" element={<ClientLoginPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><SfdDashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><SfdDashboard /></ProtectedRoute>} />
          <Route path="/loans" element={<ProtectedRoute><LoansPage /></ProtectedRoute>} />
          <Route path="/loan/:loanId" element={<ProtectedRoute><LoanDetailsPage /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
          <Route path="/sfd-clients" element={<ProtectedRoute><SfdClientsPage /></ProtectedRoute>} />
          <Route path="/client/:clientId" element={<ProtectedRoute><ClientDetailsPage /></ProtectedRoute>} />
          
          {/* Mobile Flow */}
          <Route path="/mobile-flow/*" element={<ProtectedRoute><MobileFlowPage /></ProtectedRoute>} />
          
          {/* Permission Test Page */}
          <Route path="/permission-test" element={<PermissionTestPage />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Router;
