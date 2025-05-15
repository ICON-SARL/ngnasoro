
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import MobileLayout from '@/components/mobile/MobileLayout';
import AccountPage from '@/components/mobile/account/AccountPage';

const MobileApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AccountPage />
    </div>
  );
};

export default MobileApp;
