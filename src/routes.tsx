
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import SfdAdhesionFormPage from '@/pages/mobile/SfdAdhesionFormPage';
import SfdSelectorPage from '@/pages/SfdSelectorPage';
import SfdAdhesionRequestsPage from '@/pages/SfdAdhesionRequestsPage';
import { AuthProvider } from '@/hooks/auth/AuthContext';
import RoleGuard from '@/components/RoleGuard';

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes mobiles */}
        <Route path="/mobile-flow">
          {/* ... autres routes existantes ... */}
          <Route path="sfd-selection" element={<SfdSelectorPage />} />
          <Route path="sfd-adhesion/:sfdId" element={<SfdAdhesionFormPage />} />
        </Route>

        {/* Pages administratives SFD */}
        <Route 
          path="/sfd-adhesion-requests" 
          element={
            <RoleGuard requiredRole="sfd_admin">
              <SfdAdhesionRequestsPage />
            </RoleGuard>
          } 
        />

        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/mobile-flow/account" replace />} />
      </Routes>
    </AuthProvider>
  );
}
