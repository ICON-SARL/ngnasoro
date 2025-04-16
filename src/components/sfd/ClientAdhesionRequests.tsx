
import React, { useEffect } from 'react';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';
import { AdhesionRequestsTable } from './AdhesionRequestsTable';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/ui/loader';

export const ClientAdhesionRequests: React.FC = () => {
  const { user } = useAuth();
  const { 
    adhesionRequests, 
    isLoadingAdhesionRequests, 
    fetchAdhesionRequests,
    refetchAdhesionRequests
  } = useClientAdhesions();
  
  // Get sfdId from user metadata
  const sfdId = user?.user_metadata?.sfd_id;
  
  useEffect(() => {
    if (user && sfdId) {
      console.log(`Fetching adhesion requests for SFD: ${sfdId}`);
      fetchAdhesionRequests(sfdId);
    }
  }, [user, sfdId, fetchAdhesionRequests]);
  
  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Vous devez être connecté pour accéder à cette page.</p>
      </div>
    );
  }
  
  if (isLoadingAdhesionRequests) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size="lg" />
        <span className="ml-3 text-lg">Chargement des demandes...</span>
      </div>
    );
  }
  
  return (
    <AdhesionRequestsTable 
      requests={adhesionRequests} 
      isLoading={isLoadingAdhesionRequests}
      onStatusChange={refetchAdhesionRequests}
    />
  );
};
