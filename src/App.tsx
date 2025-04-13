
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import SfdLoginPage from './pages/SfdLoginPage';
import AuthRedirectPage from './pages/AuthRedirectPage';
import MobileFlowPage from './pages/MobileFlowPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth" element={<LoginPage />} />
            <Route path="/login" element={<AuthRedirectPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/auth" element={<AdminLoginPage />} />
            <Route path="/sfd/auth" element={<SfdLoginPage />} />
            
            {/* Mobile Flow Main Route */}
            <Route path="/mobile-flow/*" element={<MobileFlowPage />} />
            
            {/* Default route */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            
            {/* Fallback - redirect to auth */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
