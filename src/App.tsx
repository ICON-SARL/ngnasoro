
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { LocalizationProvider } from '@/contexts/LocalizationContext';
import { useAuth } from '@/hooks/useAuth';
import AdminManagement from '@/components/admin/AdminManagement';

// Import the page components directly without destructuring
import SfdManagementPage from '@/pages/SfdManagementPage';
import AddSfdPage from '@/pages/AddSfdPage';
import AuditLogsPage from '@/pages/AuditLogsPage';
import CreditApprovalPage from '@/pages/CreditApprovalPage';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';

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
              <Route path="/" element={<div>HomePage</div>} />
              <Route path="/sign-in" element={<GuestRoute><div>SignInPage</div></GuestRoute>} />
              <Route path="/sign-up" element={<GuestRoute><div>SignUpPage</div></GuestRoute>} />
              <Route path="/profile" element={<AuthRoute><div>ProfilePage</div></AuthRoute>} />
              <Route path="/loan-request" element={<AuthRoute><div>LoanRequestPage</div></AuthRoute>} />
              <Route path="/sfd-dashboard" element={<AuthRoute><div>SfdDashboard</div></AuthRoute>} />
              <Route path="/admin-dashboard" element={<AuthRoute><SuperAdminDashboard /></AuthRoute>} />
              <Route path="/admin-management" element={<AuthRoute><AdminManagement /></AuthRoute>} />
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
