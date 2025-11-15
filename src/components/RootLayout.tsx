import React from 'react';
import { Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/components/ScrollToTop';

const RootLayout: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
};

export default RootLayout;
