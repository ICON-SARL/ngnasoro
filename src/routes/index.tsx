
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthRoutes } from './authRoutes';
import { AdminRoutes } from './adminRoutes';
import { SfdAdminRoutes } from './sfdAdminRoutes';
import { ClientRoutes } from './clientRoutes';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root Route */}
      <Route path="/" element={<Navigate to="/auth" replace />} />
      
      {/* Auth Routes */}
      <AuthRoutes />
      
      {/* Admin Routes */}
      <AdminRoutes />
      
      {/* SFD Admin Routes */}
      <SfdAdminRoutes />
      
      {/* Client/User Routes */}
      <ClientRoutes />
      
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default AppRoutes;
