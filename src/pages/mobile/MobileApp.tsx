
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleGuard } from '@/components/auth/RoleGuard';
import MobileLayout from '@/components/mobile/MobileLayout';
import AccountPage from '@/components/mobile/account/AccountPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';

const MobileApp: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MobileLayout />}>
        {/* Public routes */}
        <Route index element={<Navigate to="account" replace />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="account" replace />} />
      </Route>
    </Routes>
  );
};

export default MobileApp;
