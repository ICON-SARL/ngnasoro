
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ClientDashboardPage from '@/pages/ClientDashboardPage';
import ClientLoansPage from '@/pages/ClientLoansPage';
import ProfilePage from '@/pages/ProfilePage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import { RoleGuard } from '@/components/RoleGuard';
import { UserRole } from '@/utils/auth/roleTypes';

const ClientRoutes = () => {
  return (
    <Routes>
      <Route 
        path="dashboard" 
        element={
          <RoleGuard requiredRole={UserRole.CLIENT}>
            <ClientDashboardPage />
          </RoleGuard>
        } 
      />
      <Route 
        path="loans" 
        element={
          <RoleGuard requiredRole={UserRole.CLIENT}>
            <ClientLoansPage />
          </RoleGuard>
        } 
      />
      <Route 
        path="profile" 
        element={
          <RoleGuard requiredRole={UserRole.CLIENT}>
            <ProfilePage />
          </RoleGuard>
        } 
      />
      <Route path="access-denied" element={<AccessDeniedPage />} />
      <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
    </Routes>
  );
};

export default ClientRoutes;
