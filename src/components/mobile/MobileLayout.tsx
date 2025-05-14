
import React from 'react';
import MobileNavigation from '@/components/mobile/MobileNavigation';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <main className="container mx-auto">
        {children}
      </main>
      <MobileNavigation />
    </div>
  );
};

export default MobileLayout;
