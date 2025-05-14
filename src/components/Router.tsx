
import React from 'react';
import { Route } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import PermissionTestPage from '@/pages/PermissionTestPage';

// Export the routes as individual route elements that can be included in the main routes configuration
export const authRoutes = (
  <>
    <Route path="/auth" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/access-denied" element={<AccessDeniedPage />} />
    <Route path="/permission-test" element={<PermissionTestPage />} />
  </>
);

// This component is now just a collection of routes, not a router
const Router = () => {
  return <>{authRoutes}</>;
};

export default Router;
