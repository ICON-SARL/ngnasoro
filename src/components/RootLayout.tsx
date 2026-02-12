import React from 'react';
import { Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/components/ScrollToTop';

const RootLayout: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <div className="page-transition">
        <Outlet />
      </div>
    </>
  );
};

export default RootLayout;
