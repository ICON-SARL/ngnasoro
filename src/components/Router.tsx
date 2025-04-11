
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Auth and Public Components
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';

// Protected Components
import ProfilePage from '@/pages/ProfilePage';
import SfdDashboardPage from '@/pages/SfdDashboardPage';
import SuperAdminDashboardPage from '@/pages/SuperAdminDashboardPage';
import LoansPage from '@/pages/LoansPage';
import SettingsPage from '@/pages/SettingsPage';
import SfdClientsPage from '@/pages/SfdClientsPage';
import ClientsPage from '@/pages/ClientsPage';
import ClientDetailPage from '@/pages/ClientDetailPage';
import SfdAccountPage from '@/pages/SfdAccountPage';
import SfdManagementPage from '@/pages/SfdManagementPage';
import SfdSubsidiesPage from '@/pages/SfdSubsidiesPage';
import SfdRequestPage from '@/pages/SfdRequestPage';
import LoanApplicationPage from '@/pages/LoanApplicationPage';

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/admin/auth" element={<AuthPage />} />
      <Route path="/sfd/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/dashboard" element={<SfdDashboardPage />} />
      <Route path="/admin-dashboard" element={<SuperAdminDashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/loans" element={<LoansPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/sfd-clients" element={<SfdClientsPage />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/clients/:clientId" element={<ClientDetailPage />} />
      <Route path="/sfd-account/:sfdId" element={<SfdAccountPage />} />
      <Route path="/sfd-management" element={<SfdManagementPage />} />
      <Route path="/subsidies" element={<SfdSubsidiesPage />} />
      <Route path="/request" element={<SfdRequestPage />} />
      <Route path="/loan-application" element={<LoanApplicationPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
