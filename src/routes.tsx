
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
// Modified imports to use correct paths
import MobileFlowPage from './pages/MobileFlowPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SfdSetupPage from './pages/SfdSetupPage';
import SfdSelectorPage from './pages/SfdSelectorPage';
import SfdManagementPage from './pages/admin/SfdManagementPage';
import ProtectedRoute from './components/routes/ProtectedRoute';
import PrivateLayout from './components/layouts/PrivateLayout';

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
      
      {/* Admin Routes */}
      <Route path="/sfd-management" element={<ProtectedRoute><SfdManagementPage /></ProtectedRoute>} />
      <Route path="/agency-dashboard" element={<ProtectedRoute requireSfdAdmin><PrivateLayout><div>Tableau de bord de l'agence</div></PrivateLayout></ProtectedRoute>} />
      
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/mobile-flow" replace />} />
    </Routes>
  );
};

export default AppRoutes;
