
import React from 'react';
import { ClientManagement } from '@/components/sfd/ClientManagement';
import { ClientAnalysisPanel } from '@/components/sfd/client-management/ClientAnalysisPanel';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

export const ClientManagementSystem = () => {
  const { activeSfdId, isLoading } = useSfdDataAccess();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Gestion des clients</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ClientManagement />
        </div>
        
        <div className="space-y-6">
          {activeSfdId && <ClientAnalysisPanel sfdId={activeSfdId} />}
        </div>
      </div>
    </div>
  );
};
