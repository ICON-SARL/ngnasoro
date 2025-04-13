
import React from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { MerefFundRequestsManager } from '@/components/admin/meref/MerefFundRequestsManager';

const AdminMerefFundingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="container mx-auto p-4 md:p-6">
        <MerefFundRequestsManager />
      </main>
    </div>
  );
};

export default AdminMerefFundingPage;
