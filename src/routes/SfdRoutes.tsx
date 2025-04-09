
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SfdDashboardPage from '@/pages/SfdDashboardPage';
import SfdClientsPage from '@/pages/SfdClientsPage';
import SfdCreditsPage from '@/pages/SfdCreditsPage';
import SfdRoleManagementPage from '@/pages/SfdRoleManagementPage';
import SfdReportsPage from '@/pages/SfdReportsPage';
import SfdFonctionsAvanceesPage from '@/pages/SfdFonctionsAvanceesPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import { RoleGuard } from '@/components/RoleGuard';
import { UserRole } from '@/utils/auth/roleTypes';

const SfdRoutes = () => {
  return (
    <Routes>
      <Route 
        path="dashboard" 
        element={
          <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
            <SfdDashboardPage />
          </RoleGuard>
        } 
      />
      <Route 
        path="clients" 
        element={
          <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
            <SfdClientsPage />
          </RoleGuard>
        } 
      />
      <Route 
        path="credits" 
        element={
          <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
            <SfdCreditsPage />
          </RoleGuard>
        } 
      />
      <Route 
        path="role-management" 
        element={
          <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
            <SfdRoleManagementPage />
          </RoleGuard>
        } 
      />
      <Route 
        path="rapports" 
        element={
          <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
            <SfdReportsPage />
          </RoleGuard>
        } 
      />
      <Route 
        path="fonctions-avancees" 
        element={
          <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
            <SfdFonctionsAvanceesPage />
          </RoleGuard>
        } 
      />
      <Route path="access-denied" element={<AccessDeniedPage />} />
      <Route path="*" element={<Navigate to="/sfd/dashboard" replace />} />
    </Routes>
  );
};

export default SfdRoutes;
