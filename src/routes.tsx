import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import MobileLayout from '@/layouts/MobileLayout';
import SfdAdhesionFormPage from '@/pages/mobile/SfdAdhesionFormPage';
import SfdSelectorPage from '@/pages/SfdSelectorPage';
import SfdAdhesionRequestsPage from '@/pages/SfdAdhesionRequestsPage';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes mobiles */}
        <Route path="/mobile-flow" element={<MobileLayout />}>
          {/* ... autres routes existantes ... */}
          <Route path="sfd-selection" element={<SfdSelectorPage />} />
          <Route path="sfd-adhesion/:sfdId" element={<SfdAdhesionFormPage />} />
        </Route>

        {/* Pages administratives SFD */}
        <Route 
          path="/sfd-adhesion-requests" 
          element={
            <ProtectedRoute requiredRole="sfd_admin">
              <SfdAdhesionRequestsPage />
            </ProtectedRoute>
          } 
        />

        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/mobile-flow/account" replace />} />
      </Routes>
    </AuthProvider>
  );
}
