
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SfdAuthUI from '@/components/auth/SfdAuthUI';
import RoleGuard from '@/components/RoleGuard';
import { UserRole } from '@/hooks/auth/types';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import { SfdDashboard } from '@/components/sfd/SfdDashboard';
import SfdClientsPage from '@/pages/SfdClientsPage';
import SfdLoansPage from '@/pages/SfdLoansPage';

const SfdRoutes = () => {
  return (
    <Routes>
      <Route path="auth" element={<SfdAuthUI />} />
      <Route 
        path="dashboard" 
        element={
          <RoleGuard 
            requiredRole={UserRole.SFD_ADMIN}
          >
            <SfdDashboard />
          </RoleGuard>
        } 
      />
      <Route 
        path="clients" 
        element={
          <RoleGuard 
            requiredRole={UserRole.SFD_ADMIN}
          >
            <SfdClientsPage />
          </RoleGuard>
        } 
      />
      <Route 
        path="loans" 
        element={
          <RoleGuard 
            requiredRole={UserRole.SFD_ADMIN}
          >
            <SfdLoansPage />
          </RoleGuard>
        } 
      />
      <Route path="access-denied" element={<AccessDeniedPage />} />
      <Route path="*" element={<Navigate to="/sfd/dashboard" replace />} />
    </Routes>
  );
};

export default SfdRoutes;
