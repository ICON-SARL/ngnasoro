
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { DashboardStats } from '@/components/sfd/dashboard/DashboardStats';

const AgencyDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SfdHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Tableau de bord SFD</h1>
          <p className="text-muted-foreground">Gestion de votre SFD et de ses services</p>
        </div>
        
        <DashboardStats />
      </main>
    </div>
  );
};

export default AgencyDashboard;
