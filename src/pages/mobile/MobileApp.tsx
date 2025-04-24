
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleGuard } from '@/components/auth/RoleGuard';
import MobileLayout from '@/components/mobile/MobileLayout';
import SfdConnectionPage from './SfdConnectionPage';
import SfdAdhesionPage from './SfdAdhesionPage';
import SfdSelectorPage from '@/pages/SfdSelectorPage';
import AccountPage from '@/components/mobile/account/AccountPage';

const MobileApp: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MobileLayout />}>
        {/* Public routes */}
        <Route index element={<Navigate to="account" replace />} />
        <Route path="account" element={<AccountPage />} />
        
        {/* Protected SFD routes */}
        <Route
          path="sfd-connection"
          element={
            <RoleGuard allowedRoles={['user', 'client']}>
              <SfdConnectionPage />
            </RoleGuard>
          }
        />
        <Route
          path="sfd-adhesion/:sfdId"
          element={
            <RoleGuard allowedRoles={['user', 'client']}>
              <SfdAdhesionPage />
            </RoleGuard>
          }
        />
        <Route
          path="sfd-selection"
          element={
            <RoleGuard allowedRoles={['user', 'client']}>
              <SfdSelectorPage />
            </RoleGuard>
          }
        />
        
        <Route path="*" element={<Navigate to="account" replace />} />
      </Route>
    </Routes>
  );
};

export default MobileApp;
