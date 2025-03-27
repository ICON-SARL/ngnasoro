
import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import AuthProvider from './hooks/auth/AuthProvider';
import LoginPage from './pages/LoginPage';
import MobileFlowPage from './pages/MobileFlowPage';
import ProtectedRoute from './components/routes/ProtectedRoute';
import FundsManagementPage from './components/mobile/funds-management/FundsManagementPage';
import TransactionsPage from './components/mobile/transactions/TransactionsPage';
import TransactionDetails from './components/mobile/transactions/TransactionDetails';
import NotFound from './pages/NotFound';
import ClientsPage from './pages/ClientsPage';
import LoansPage from './pages/LoansPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/register" element={<LoginPage />} />
          
          {/* Mobile Flow Routes */}
          <Route 
            path="/mobile-flow"
            element={<ProtectedRoute component={MobileFlowPage} />}
          />
          
          <Route 
            path="/mobile-flow/*"
            element={<ProtectedRoute component={MobileFlowPage} />}
          />
          
          <Route 
            path="/mobile-flow/funds"
            element={<ProtectedRoute component={FundsManagementPage} />}
          />
          
          <Route 
            path="/mobile-flow/funds-management"
            element={<ProtectedRoute component={FundsManagementPage} />}
          />
          
          <Route 
            path="/mobile-flow/transactions"
            element={<ProtectedRoute component={TransactionsPage} />}
          />
          
          <Route 
            path="/mobile-flow/transactions/:id"
            element={<ProtectedRoute component={TransactionDetails} />}
          />
          
          <Route 
            path="/mobile-flow/welcome"
            element={<ProtectedRoute component={MobileFlowPage} />}
          />
          
          <Route 
            path="/mobile-flow/loan-application"
            element={<ProtectedRoute component={MobileFlowPage} />}
          />
          
          {/* Admin Routes */}
          <Route 
            path="/super-admin-dashboard"
            element={<ProtectedRoute component={SuperAdminDashboard} />}
          />
          
          <Route 
            path="/clients"
            element={<ProtectedRoute component={ClientsPage} />}
          />
          
          <Route 
            path="/loans"
            element={<ProtectedRoute component={LoansPage} />}
          />
          
          <Route 
            path="/transactions"
            element={<ProtectedRoute component={TransactionsPage} />}
          />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
