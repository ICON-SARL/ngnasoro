
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import Index from '@/pages/Index';

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="auth" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="" element={<Index />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default PublicRoutes;
