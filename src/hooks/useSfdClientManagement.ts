
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SfdClient } from '@/types/sfdClients';
import { sfdClientManagementApi } from '@/utils/api/modules/sfdClientManagementApi';
import { useAuth } from './useAuth';
import { useSfdDataAccess } from './useSfdDataAccess';
import { useToast } from './use-toast';

export function useSfdClientManagement() {
  const { user } = useAuth();
  const { activeSfdId } = useSfdDataAccess();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  // Récupération des clients de la SFD avec filtres et pagination
  const { 
    data: clientsData = { clients: [], totalCount: 0 }, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['sfd-clients', activeSfdId, searchTerm, statusFilter, page, pageSize],
    queryFn: async () => {
      if (!activeSfdId) {
        console.log('No active SFD ID, cannot fetch clients');
        return { clients: [], totalCount: 0 };
      }
      
      try {
        const clients = await sfdClientManagementApi.getClients(
          activeSfdId,
          {
            searchTerm: searchTerm || undefined,
            status: statusFilter || undefined,
            page,
            limit: pageSize
          }
        );
        
        return { 
          clients: clients || [], 
          totalCount: clients?.length || 0 // This should ideally come from the API as a separate count
        };
      } catch (err) {
        console.error('Error fetching clients:', err);
        throw err;
      }
    },
    enabled: !!activeSfdId,
  });

  // Mutation pour la validation en masse des clients
  const batchValidateClients = useMutation({
    mutationFn: async (options: { notes?: string }) => {
      if (!user || !activeSfdId || selectedClients.length === 0) {
        throw new Error('Paramètres manquants pour la validation en masse');
      }
      
      return await sfdClientManagementApi.batchValidateClients({
        clientIds: selectedClients,
        validatedBy: user.id,
        notes: options.notes
      });
    },
    onSuccess: () => {
      toast({
        title: 'Clients validés',
        description: `${selectedClients.length} clients ont été validés avec succès`,
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients', activeSfdId] });
      setSelectedClients([]);
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible de valider les clients: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation pour le rejet en masse des clients
  const batchRejectClients = useMutation({
    mutationFn: async (options: { rejectionReason?: string }) => {
      if (!user || !activeSfdId || selectedClients.length === 0) {
        throw new Error('Paramètres manquants pour le rejet en masse');
      }
      
      return await sfdClientManagementApi.batchRejectClients({
        clientIds: selectedClients,
        validatedBy: user.id,
        rejectionReason: options.rejectionReason
      });
    },
    onSuccess: () => {
      toast({
        title: 'Clients rejetés',
        description: `${selectedClients.length} clients ont été rejetés`,
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients', activeSfdId] });
      setSelectedClients([]);
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible de rejeter les clients: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation pour l'import en masse des clients
  const importClients = useMutation({
    mutationFn: async (clients: Omit<SfdClient, 'id' | 'created_at' | 'status' | 'kyc_level' | 'sfd_id'>[]) => {
      if (!user || !activeSfdId) {
        throw new Error('Paramètres manquants pour l\'import de clients');
      }
      
      return await sfdClientManagementApi.importClients({
        sfdId: activeSfdId,
        clients,
        importedBy: user.id
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Import réussi',
        description: `${data.count} clients ont été importés avec succès`,
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients', activeSfdId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur d\'import',
        description: `Impossible d'importer les clients: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Requête pour les analytiques clients
  const { data: clientAnalytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['sfd-client-analytics', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return null;
      
      return await sfdClientManagementApi.getClientAnalytics(activeSfdId);
    },
    enabled: !!activeSfdId,
  });

  // Gestion des sélections de clients
  const toggleClientSelection = (clientId: string) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    } else {
      setSelectedClients([...selectedClients, clientId]);
    }
  };

  const selectAllClients = () => {
    if (selectedClients.length === clientsData.clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clientsData.clients.map(client => client.id));
    }
  };

  return {
    clients: clientsData.clients,
    totalClients: clientsData.totalCount,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    activeSfdId,
    batchValidateClients,
    batchRejectClients,
    importClients,
    clientAnalytics,
    isLoadingAnalytics,
    selectedClients,
    toggleClientSelection,
    selectAllClients,
    hasSelectedClients: selectedClients.length > 0,
    refetch // Add the refetch function to the returned object
  };
}
