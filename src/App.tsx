import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { HomePage } from '@/pages/HomePage';
import { LocalizationProvider } from '@/contexts/LocalizationContext';
import { useAuth } from '@/hooks/useAuth';
import { SignInPage } from '@/pages/SignInPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { MobileLayout } from '@/layouts/MobileLayout';
import { LoanRequestPage } from '@/pages/LoanRequestPage';
import { SfdDashboard } from '@/pages/SfdDashboard';
import { SuperAdminDashboard } from '@/pages/SuperAdminDashboard';
import { AdminManagementPage } from '@/components/admin/management/AdminManagementPage';
import { SfdManagementPage } from '@/pages/SfdManagementPage';
import { AddSfdPage } from '@/pages/AddSfdPage';
import { AuditLogsPage } from '@/pages/AuditLogsPage';
import { CreditApprovalPage } from '@/pages/CreditApprovalPage';

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const { session } = useAuth();

  // Authentication check
  const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    return session ? children : <Navigate to="/sign-in" />;
  };

  // Redirect authenticated users away from sign-in/sign-up
  const GuestRoute = ({ children }: { children: React.ReactNode }) => {
    return session ? <Navigate to="/" /> : children;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <LocalizationProvider>
            <Toaster />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/sign-in" element={<GuestRoute><SignInPage /></GuestRoute>} />
              <Route path="/sign-up" element={<GuestRoute><SignUpPage /></GuestRoute>} />
              <Route path="/profile" element={<AuthRoute><ProfilePage /></AuthRoute>} />
              <Route path="/loan-request" element={<AuthRoute><LoanRequestPage /></AuthRoute>} />
              <Route path="/sfd-dashboard" element={<AuthRoute><SfdDashboard /></AuthRoute>} />
              <Route path="/admin-dashboard" element={<AuthRoute><SuperAdminDashboard /></AuthRoute>} />
              <Route path="/admin-management" element={<AuthRoute><AdminManagementPage /></AuthRoute>} />
              <Route path="/sfd-management" element={<SfdManagementPage />} />
              <Route path="/add-sfd" element={<AddSfdPage />} />
              <Route path="/audit-logs" element={<AuthRoute><AuditLogsPage /></AuthRoute>} />
              <Route path="/credit-approval" element={<AuthRoute><CreditApprovalPage /></AuthRoute>} />
            </Routes>
          </LocalizationProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
