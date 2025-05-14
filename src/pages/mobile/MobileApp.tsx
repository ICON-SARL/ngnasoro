
import React from 'react';
import { Outlet } from 'react-router-dom';
import MobileLayout from '@/components/mobile/MobileLayout';

const MobileApp: React.FC = () => {
  return (
    <MobileLayout>
      <Outlet />
    </MobileLayout>
  );
};

export default MobileApp;
