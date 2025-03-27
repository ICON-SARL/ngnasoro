
import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import AuthProvider from './hooks/auth/AuthProvider';
import LoginPage from './pages/LoginPage';
import MobileFlowPage from './pages/MobileFlowPage';
import ProtectedRoute from './components/routes/ProtectedRoute';
import FundsManagementPage from './components/mobile/funds-management/FundsManagementPage';
import TransactionsPage from './components/mobile/transactions/TransactionsPage';
import TransactionDetails from './components/mobile/transactions/TransactionDetails';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<LoginPage />} />
          
          <Route 
            path="/mobile-flow/*"
            element={<ProtectedRoute component={MobileFlowPage} />}
          />
          
          <Route 
            path="/mobile-flow/funds"
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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
