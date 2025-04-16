
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AuthRedirectPage from '@/pages/AuthRedirectPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import ClientLoginPage from '@/pages/ClientLoginPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';

export const AuthRoutes = () => {
  return (
    <>
      <Route path="/auth" element={<LoginPage />} />
      <Route path="/login" element={<AuthRedirectPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/auth" element={<AdminLoginPage />} />
      <Route path="/sfd/auth" element={<LoginPage isSfdAdmin={true} />} />
      <Route path="/client/auth" element={<ClientLoginPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />
    </>
  );
};
