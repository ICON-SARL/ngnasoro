
import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import AuthProvider from './hooks/auth/AuthProvider';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MobileFlowPage from './pages/MobileFlowPage';
import ProtectedRoute from './components/routes/ProtectedRoute';
import FundsManagementPage from './components/mobile/funds-management/FundsManagementPage';
import TransactionsPage from './components/mobile/transactions/TransactionsPage';
import TransactionDetails from './components/mobile/transactions/TransactionDetails';
import NotFound from './pages/NotFound';
import ClientsPage from './pages/ClientsPage';
import LoansPage from './pages/LoansPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import LoanActivityPage from './components/mobile/LoanActivityPage';
import LoanProcessPage from './components/mobile/LoanProcessPage';
import Index from './pages/Index';
import AgencyDashboard from './pages/AgencyDashboard';
import CreditApprovalPage from './pages/CreditApprovalPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Landing et Auth Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* MEREF Super Admin Routes */}
          <Route 
            path="/super-admin-dashboard"
            element={<ProtectedRoute component={SuperAdminDashboard} requireAdmin={true} />}
          />
          
          <Route 
            path="/credit-approval" 
            element={<ProtectedRoute component={CreditApprovalPage} requireAdmin={true} />} 
          />
          
          {/* SFD Admin Dashboard Route */}
          <Route 
            path="/agency-dashboard"
            element={<ProtectedRoute component={AgencyDashboard} requireSfdAdmin={true} />}
          />
          
          <Route 
            path="/sfd-admin"
            element={<ProtectedRoute component={ClientsPage} requireSfdAdmin={true} />}
          />
          
          <Route 
            path="/sfd-dashboard"
            element={<ProtectedRoute component={LoansPage} requireSfdAdmin={true} />}
          />
          
          <Route 
            path="/clients"
            element={<ProtectedRoute component={ClientsPage} requireSfdAdmin={true} />}
          />
          
          <Route 
            path="/loans"
            element={<ProtectedRoute component={LoansPage} requireSfdAdmin={true} />}
          />
          
          {/* Mobile Flow Routes - Pour les utilisateurs standard */}
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
          
          <Route 
            path="/mobile-flow/loan-activity"
            element={<ProtectedRoute component={LoanActivityPage} />}
          />
          
          <Route 
            path="/mobile-flow/loan-process/:loanId"
            element={<ProtectedRoute component={LoanProcessPage} />}
          />
          
          {/* Shared Routes */}
          <Route 
            path="/transactions"
            element={<ProtectedRoute component={TransactionsPage} />}
          />
          
          <Route 
            path="/multi-sfd"
            element={<ProtectedRoute component={MobileFlowPage} />}
          />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
