
import React from 'react';
import { SfdDashboard } from '@/components/sfd/SfdDashboard';
import { SfdHeader } from '@/components/sfd/SfdHeader';

const SfdDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      <div className="container mx-auto py-6 px-4">
        <SfdDashboard />
      </div>
    </div>
  );
};

export default SfdDashboardPage;
