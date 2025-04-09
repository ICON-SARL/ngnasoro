
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { useAuth } from '@/hooks/useAuth';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { ClientManagementSystem } from '@/components/sfd/ClientManagementSystem';

export const SfdClientsPage = () => {
  const { user, activeSfdId } = useAuth();
  const { canManageClients } = useRolePermissions();
  
  // Get the staff role from user_metadata (if any)
  const staffRole = user?.user_metadata?.staff_role;
  
  // Check if the user can access this page
  const hasAccess = canManageClients();
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SfdHeader />
        <div className="container mx-auto py-6 px-4">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600">Accès Refusé</h1>
              <p className="mt-2 text-gray-600">
                Vous n'avez pas les permissions nécessaires pour accéder à la gestion des clients.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion des Clients</h1>
          <p className="text-muted-foreground">
            Gérez les comptes clients et leurs informations
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <ClientManagementSystem staffRole={staffRole} />
        </div>
      </div>
    </div>
  );
};

export default SfdClientsPage;
