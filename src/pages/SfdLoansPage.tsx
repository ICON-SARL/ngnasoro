
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { useAuth } from '@/hooks/useAuth';
import { useRolePermissions } from '@/hooks/useRolePermissions';

export const SfdLoansPage = () => {
  const { user, activeSfdId } = useAuth();
  const { canApproveLoan } = useRolePermissions();
  
  // Get the staff role from user_metadata (if any)
  const staffRole = user?.user_metadata?.staff_role;
  
  // Check if user can approve loans
  const canApproveLoans = canApproveLoan(staffRole);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion des Prêts</h1>
          <p className="text-muted-foreground">
            {canApproveLoans 
              ? "Gérez et approuvez les demandes de prêts"
              : "Consultez les demandes de prêts"
            }
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <p className="text-center text-muted-foreground py-8">
            Fonctionnalité de gestion des prêts en cours de développement
          </p>
          
          {canApproveLoans && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mt-4">
              <p className="text-blue-700 font-medium">Vous avez les droits d'approbation des prêts</p>
              <p className="text-sm text-blue-600 mt-1">
                Cette interface vous permettra de valider les demandes de prêts soumises par les clients.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SfdLoansPage;
