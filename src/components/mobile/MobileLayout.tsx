
import React from 'react';
import { Outlet } from 'react-router-dom';
import MobileNavigation from '@/components/MobileNavigation';

const MobileLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <main className="container mx-auto">
        <Outlet />
      </main>
      <MobileNavigation />
    </div>
  );
};

export default MobileLayout;
