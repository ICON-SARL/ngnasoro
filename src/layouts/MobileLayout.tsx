
import React from 'react';
import MobileNavigation from '@/components/mobile/MobileNavigation';

const MobileLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
      <MobileNavigation />
    </div>
  );
};

export default MobileLayout;
