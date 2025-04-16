
import React from 'react';
import MobileNavigation from '../MobileNavigation';

interface MobileLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, showNavigation = true }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-20">
        {children}
      </div>
      {showNavigation && <MobileNavigation />}
    </div>
  );
};

export default MobileLayout;
