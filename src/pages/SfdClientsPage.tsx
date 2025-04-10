
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { ClientManagementSystem } from '@/components/sfd/ClientManagementSystem';
import { ClientManagement } from '@/components/sfd/ClientManagement';
import { useSfdClients } from '@/hooks/useSfdClients';
import { Badge } from '@/components/ui/badge';

const SfdClientsPage = () => {
  const { isAdmin } = useAuth();
  const { clients } = useSfdClients();
  
  // Count pending requests
  const pendingRequestsCount = clients.filter(client => client.status === 'pending').length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? <SuperAdminHeader /> : <SfdHeader />}
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Gestion des Clients</h1>
              {pendingRequestsCount > 0 && (
                <Badge className="bg-amber-500">
                  {pendingRequestsCount} demande{pendingRequestsCount > 1 ? 's' : ''} en attente
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Gérez les clients de votre SFD et leurs demandes d'accès à N'gna sôrô
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <ClientManagement />
        </div>
      </div>
    </div>
  );
};

export default SfdClientsPage;
