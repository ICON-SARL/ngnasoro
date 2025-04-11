
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LoansPage from '@/pages/LoansPage';
import SfdDashboardPage from '@/pages/SfdDashboardPage';
import SfdAccountPage from '@/pages/SfdAccountPage';
import SfdClientsPage from '@/pages/SfdClientsPage';
import SfdSubsidiesPage from '@/pages/SfdSubsidiesPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import LandingPage from '@/pages/LandingPage';
import SettingsPage from '@/pages/SettingsPage';
import SfdRequestPage from '@/pages/SfdRequestPage';
import SuperAdminDashboardPage from '@/pages/SuperAdminDashboardPage';
import SfdManagementPage from '@/pages/SfdManagementPage';
import LoanApplicationPage from '@/pages/LoanApplicationPage';
import AuthPage from '@/pages/AuthPage';
import ProfilePage from '@/pages/ProfilePage';
import ClientsPage from '@/pages/ClientsPage';
import ClientDetailPage from '@/pages/ClientDetailPage';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import "@/global.css";

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <AuthProvider>
        <Router>
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
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
