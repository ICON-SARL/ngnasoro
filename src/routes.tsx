
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import AuthRedirectPage from './pages/AuthRedirectPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SfdSetupPage from './pages/SfdSetupPage';
import SfdSelectorPage from './pages/SfdSelectorPage';
import SfdManagementPage from './pages/admin/SfdManagementPage';
import ProtectedRoute from './components/routes/ProtectedRoute';
import PrivateLayout from './components/layouts/PrivateLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import SfdLoginPage from './pages/SfdLoginPage';
import ClientLoginPage from './pages/ClientLoginPage';
import MobileFlowPage from './pages/MobileFlowPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Authentication Routes with specific types */}
      <Route path="/auth" element={<AuthRedirectPage />} />
      <Route path="/admin/auth" element={<AdminLoginPage />} />
      <Route path="/sfd/auth" element={<SfdLoginPage />} />
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
      <Route path="/sfd-management" element={<ProtectedRoute requireAdmin><SfdManagementPage /></ProtectedRoute>} />
      <Route path="/agency-dashboard" element={<ProtectedRoute requireSfdAdmin><PrivateLayout><div>Tableau de bord de l'agence</div></PrivateLayout></ProtectedRoute>} />
      <Route path="/super-admin-dashboard" element={<ProtectedRoute requireAdmin><PrivateLayout><div>Tableau de bord admin</div></PrivateLayout></ProtectedRoute>} />
      
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default AppRoutes;
