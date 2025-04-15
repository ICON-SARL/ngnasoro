
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { SfdManagementContainer } from '@/components/admin/sfd-management/SfdManagementContainer';
import { Footer } from '@/components';

export default function SfdManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion des SFDs</h1>
          <p className="text-muted-foreground">
            Administrer les institutions de microfinance partenaires
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <SfdManagementContainer />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
