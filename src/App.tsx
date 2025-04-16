
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import PermissionTestPage from '@/pages/PermissionTestPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import { UserRole } from '@/utils/auth/roleTypes';
import MobileFlowPage from '@/pages/mobile/MobileFlowPage';
import SfdSetupPage from '@/pages/SfdSetupPage';
import { AuthProvider } from '@/hooks/auth/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Page */}
            <Route path="/auth" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/access-denied" element={<AccessDeniedPage />} />
            
            {/* Permission Test Page */}
            <Route path="/permission-test" element={<PermissionTestPage />} />
            
            {/* Route spéciale qui ne nécessite pas une vérification stricte des rôles */}
            <Route path="/sfd-setup" element={<ProtectedRoute><SfdSetupPage /></ProtectedRoute>} />
            
            {/* Mobile Flow Routes */}
            <Route path="/mobile-flow/*" element={<ProtectedRoute><MobileFlowPage /></ProtectedRoute>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
