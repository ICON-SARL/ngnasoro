
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { SfdManagement } from '@/components/admin/SfdManagement';
import { MerefSfdCommunication } from '@/components/admin/shared/MerefSfdCommunication';
import { AdminNotifications } from '@/components/admin/shared/AdminNotifications';
import { Footer } from '@/components';

const SfdManagementPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader 
        additionalComponents={
          <div className="flex items-center gap-2">
            <MerefSfdCommunication />
            <AdminNotifications />
          </div>
        } 
      />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Gestion des SFDs</h2>
          <p className="text-muted-foreground">
            Administrez les institutions de microfinance partenaires et leurs comptes administrateurs
          </p>
        </div>
        
        <SfdManagement />
      </main>
      
      <Footer />
    </div>
  );
};

export default SfdManagementPage;
