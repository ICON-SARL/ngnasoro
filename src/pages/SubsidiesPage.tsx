
import React, { useState } from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { SubsidyRequestManagement } from '@/components/admin/subsidy/SubsidyRequestManagement';

const SubsidiesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Gestion des Subventions</h2>
          <p className="text-muted-foreground">
            Gérez les demandes de prêt subventionné et allocations aux SFDs partenaires
          </p>
        </div>
        
        <SubsidyRequestManagement />
      </main>
    </div>
  );
};

export default SubsidiesPage;
