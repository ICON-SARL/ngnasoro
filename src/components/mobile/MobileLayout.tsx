import React from 'react';
import { Outlet } from 'react-router-dom';
import MobileNavigation from '@/components/mobile/MobileNavigation';

const MobileLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <main>
        <Outlet />
      </main>
      <MobileNavigation />
    </div>
  );
};

export default MobileLayout;
