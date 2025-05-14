
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import SfdSelectorPage from '@/pages/SfdSelectorPage';
import { AuthProvider } from '@/hooks/auth/AuthContext';
import RoleGuard from '@/components/RoleGuard';
import SfdAdhesionFormPage from '@/pages/mobile/SfdAdhesionFormPage';

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes mobiles */}
        <Route path="/mobile-flow">
          <Route path="sfd-selection" element={<SfdSelectorPage />} />
          <Route path="sfd-adhesion/:sfdId" element={<SfdAdhesionFormPage />} />
        </Route>

        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/mobile-flow/account" replace />} />
      </Routes>
    </AuthProvider>
  );
}
