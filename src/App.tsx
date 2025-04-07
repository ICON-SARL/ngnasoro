
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from '@/hooks/auth';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import CreditApprovalPage from '@/pages/CreditApprovalPage';
import TransactionsPage from '@/pages/TransactionsPage';
import TransactionPage from '@/pages/TransactionPage';
import SfdLoansPage from '@/pages/SfdLoansPage';
import SubsidiesPage from '@/pages/SubsidiesPage';
import SfdSubsidyPage from '@/pages/SfdSubsidyPage';

// Auth Route Guard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  // Use a dummy user for demo purposes if necessary
  const { session, loading } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/transactions" 
        element={
          <ProtectedRoute>
            <TransactionsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/transactions/:id" 
        element={
          <ProtectedRoute>
            <TransactionPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/credit-approval" 
        element={
          <ProtectedRoute>
            <CreditApprovalPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/subsidies" 
        element={
          <ProtectedRoute>
            <SubsidiesPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/sfd/loans" 
        element={
          <ProtectedRoute>
            <SfdLoansPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/sfd/subsidies" 
        element={
          <ProtectedRoute>
            <SfdSubsidyPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
