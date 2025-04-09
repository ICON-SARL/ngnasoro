
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRolePermissions } from '@/hooks/useRolePermissions';

export interface ClientManagementSystemProps {
  staffRole?: string;
}

export const ClientManagementSystem: React.FC<ClientManagementSystemProps> = ({ staffRole }) => {
  const { user } = useAuth();
  const { canManageClients } = useRolePermissions();
  
  const hasAccess = canManageClients();
  
  if (!hasAccess) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-red-500 mb-2">Accès non autorisé</h2>
        <p className="text-gray-600">
          Vous n'avez pas les autorisations nécessaires pour gérer les clients.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center p-8 bg-blue-50 rounded-md">
        <h2 className="text-xl font-semibold mb-4">Gestion des Clients</h2>
        <p className="text-gray-600 mb-2">
          Interface de gestion des comptes clients en cours de développement.
        </p>
        <p className="text-sm text-blue-600">
          Cette interface permettra de créer, modifier et gérer les comptes clients de votre SFD.
        </p>
      </div>
    </div>
  );
};

export default ClientManagementSystem;
