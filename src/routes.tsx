
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
// Modified imports to use correct paths
import MobileFlowPage from './pages/MobileFlowPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SfdSetupPage from './pages/SfdSetupPage';
import SfdSelectorPage from './pages/SfdSelectorPage';
import SfdManagementPage from './pages/SfdManagementPage';
import ProtectedRoute from './components/routes/ProtectedRoute';
import PrivateLayout from './components/layouts/PrivateLayout';
import LoansPage from './pages/LoansPage';
import SfdClientsPage from './pages/SfdClientsPage';
import SfdAdhesionRequestsPage from './pages/SfdAdhesionRequestsPage';
import SfdTransactionsPage from './pages/SfdTransactionsPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/sfd-selector" element={<SfdSelectorPage />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Navigate to="/mobile-flow" replace /></ProtectedRoute>} />
      
      {/* Mobile Flow Routes */}
      <Route path="/mobile-flow/*" element={<ProtectedRoute><MobileFlowPage /></ProtectedRoute>} />
      
      {/* SFD Setup Route */}
      <Route path="/sfd-setup" element={<ProtectedRoute><PrivateLayout><SfdSetupPage /></PrivateLayout></ProtectedRoute>} />
      
      {/* SFD Admin Routes */}
      <Route path="/agency-dashboard" element={<ProtectedRoute><PrivateLayout><SfdManagementPage /></PrivateLayout></ProtectedRoute>} />
      <Route path="/sfd-loans" element={<ProtectedRoute><PrivateLayout><LoansPage /></PrivateLayout></ProtectedRoute>} />
      <Route path="/sfd-clients" element={<ProtectedRoute><PrivateLayout><SfdClientsPage /></PrivateLayout></ProtectedRoute>} />
      <Route path="/sfd-adhesion-requests" element={<ProtectedRoute><PrivateLayout><SfdAdhesionRequestsPage /></PrivateLayout></ProtectedRoute>} />
      <Route path="/sfd-transactions" element={<ProtectedRoute><PrivateLayout><SfdTransactionsPage /></PrivateLayout></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/sfd-management" element={<ProtectedRoute><SfdManagementPage /></ProtectedRoute>} />
      
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/mobile-flow" replace />} />
    </Routes>
  );
};

export default AppRoutes;
