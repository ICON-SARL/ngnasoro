
import React, { useState } from 'react';
import { LoanManagement } from '@/components/sfd/LoanManagement';
import { AgencyHeader } from '@/components/AgencyHeader';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { useAuth } from '@/hooks/useAuth';

const LoansPage = () => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? <SuperAdminHeader /> : <AgencyHeader />}
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Prêts</h1>
          <p className="text-muted-foreground">Gestion et suivi des prêts</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <LoanManagement />
        </div>
      </div>
    </div>
  );
};

export default LoansPage;
