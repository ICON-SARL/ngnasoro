
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
import PremiumDashboardPage from './pages/PremiumDashboard';
import CreditApprovalPage from './pages/CreditApprovalPage';
import AppRoutes from './routes';

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
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
