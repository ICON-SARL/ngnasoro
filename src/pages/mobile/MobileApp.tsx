
import React from 'react';
import { Outlet } from 'react-router-dom';
import { RoleGuard } from '@/components/auth/RoleGuard';
import MobileLayout from '@/components/mobile/MobileLayout';
import AccountPage from '@/components/mobile/account/AccountPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';

const MobileApp: React.FC = () => {
  return (
    <MobileLayout>
      <Outlet />
    </MobileLayout>
  );
};

export default MobileApp;
