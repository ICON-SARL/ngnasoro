
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card } from '@/components/ui/card';
import { SfdRoleManager } from '@/components/sfd/roles';
import { useAuth } from '@/hooks/useAuth';

const SfdRoleManagementPage = () => {
  const { isSfdAdmin } = useAuth();
  
  // Redirect if not sfd_admin
  if (!isSfdAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Accès non autorisé</h1>
          <p className="mt-2">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion des Rôles Personnel SFD</h1>
          <p className="text-muted-foreground">
            Définissez les rôles et permissions pour le personnel de votre SFD
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <SfdRoleManager />
        </div>
      </div>
    </div>
  );
}

export default SfdRoleManagementPage;
