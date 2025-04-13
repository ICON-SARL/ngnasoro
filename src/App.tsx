
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import SuperAdminDashboardPage from '@/pages/SuperAdminDashboardPage';
import SfdManagementPage from '@/pages/SfdManagementPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';

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
            
            {/* Super Admin (MEREF) Routes */}
            <Route 
              path="/super-admin-dashboard" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SuperAdminDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sfd-management" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SfdManagementPage />
                </ProtectedRoute>
              } 
            />
            
            {/* SFD Routes */}
            <Route 
              path="/agency-dashboard" 
              element={
                <ProtectedRoute requireSfdAdmin={true}>
                  <AgencyDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sfd-loans" 
              element={
                <ProtectedRoute requireSfdAdmin={true}>
                  <SfdLoansPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sfd-clients" 
              element={
                <ProtectedRoute requireSfdAdmin={true}>
                  <SfdClientsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sfd-transactions" 
              element={
                <ProtectedRoute requireSfdAdmin={true}>
                  <SfdTransactionsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sfd-subsidy-requests" 
              element={
                <ProtectedRoute requireSfdAdmin={true}>
                  <SfdSubsidyRequestsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sfd-settings" 
              element={
                <ProtectedRoute requireSfdAdmin={true}>
                  <SfdSettingsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Mobile Flow (Use existing Router component) */}
            <Route path="/mobile-flow/*" element={<MobileRouter />} />
            
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            
            {/* Not found page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LocalizationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
