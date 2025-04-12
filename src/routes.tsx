
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SavingsPage from './pages/SavingsPage';
import ProfilePage from './pages/ProfilePage';
import SfdSetupPage from './pages/SfdSetupPage';
import SFDSelector from './pages/SFDSelector';
import MobileLayout from './components/layouts/MobileLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PrivateLayout from './components/layouts/PrivateLayout';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/sfd-selector" element={<SFDSelector />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Navigate to="/mobile-flow/main" replace /></ProtectedRoute>} />
      
      {/* Mobile Flow Routes */}
      <Route path="/mobile-flow" element={<ProtectedRoute><MobileLayout /></ProtectedRoute>}>
        <Route path="main" element={<MainPage />} />
        <Route path="savings" element={<SavingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      
      {/* SFD Setup Route */}
      <Route path="/sfd-setup" element={<ProtectedRoute><PrivateLayout><SfdSetupPage /></PrivateLayout></ProtectedRoute>} />
      
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/mobile-flow/main" replace />} />
    </Routes>
  );
};

export default AppRoutes;
