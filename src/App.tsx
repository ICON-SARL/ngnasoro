
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import { LocalizationProvider } from '@/contexts/LocalizationContext';

// Import existing pages
import SfdLoansPage from '@/pages/SfdLoansPage';
import SfdClientsPage from '@/pages/SfdClientsPage';
import SfdTransactionsPage from '@/pages/SfdTransactionsPage';
import SfdSubsidyRequestsPage from '@/pages/SfdSubsidyRequestsPage';
import SfdSettingsPage from '@/pages/SfdSettingsPage';
import AgencyDashboardPage from '@/pages/AgencyDashboardPage';
import { MobileRouter } from '@/components/Router';
import ClientAuthUI from '@/components/auth/ClientAuthUI';
import AdminAuthUI from '@/components/auth/AdminAuthUI';
import SfdAuthUI from '@/components/auth/SfdAuthUI';
import NotFound from '@/pages/NotFound';
import SplashScreen from '@/components/mobile/SplashScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <AuthProvider>
        <LocalizationProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth" element={<ClientAuthUI />} />
            <Route path="/admin/auth" element={<AdminAuthUI />} />
            <Route path="/sfd/auth" element={<SfdAuthUI />} />
            
            {/* Login routes */}
            <Route path="/login" element={<ClientAuthUI />} />
            <Route path="/register" element={<ClientAuthUI />} />
            
            {/* Splash screen at root level */}
            <Route path="/splash" element={<SplashScreen />} />
            
            {/* SFD Routes */}
            <Route path="/agency-dashboard" element={<AgencyDashboardPage />} />
            <Route path="/sfd-loans" element={<SfdLoansPage />} />
            <Route path="/sfd-clients" element={<SfdClientsPage />} />
            <Route path="/sfd-transactions" element={<SfdTransactionsPage />} />
            <Route path="/sfd-subsidy-requests" element={<SfdSubsidyRequestsPage />} />
            <Route path="/sfd-settings" element={<SfdSettingsPage />} />
            
            {/* Mobile Flow (Use existing Router component) */}
            <Route path="/mobile-flow/*" element={<MobileRouter />} />
            
            {/* Redirect root to login */}
            <Route path="/" element={<ClientAuthUI />} />
            
            {/* Not found page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LocalizationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
