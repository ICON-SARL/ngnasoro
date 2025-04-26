import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SfdClient } from '@/types/sfdClients';
import { useNavigate } from 'react-router-dom';

interface ClientsResponse {
  clients: SfdClient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function useSfdClientManagement() {
  const { activeSfdId, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const navigate = useNavigate();

  // Get all clients with pagination and filtering
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sfd-clients', activeSfdId, statusFilter, currentPage, itemsPerPage],
    queryFn: async (): Promise<ClientsResponse> => {
      try {
        if (!activeSfdId) {
          throw new Error('Aucune SFD active sélectionnée');
        }

        console.log(`Fetching clients for SFD ID: ${activeSfdId}, page ${currentPage}`);

        const { data, error } = await supabase.functions.invoke('sfd-clients', {
          body: { 
            action: 'getClients',
            sfdId: activeSfdId,
            statusFilter,
            page: currentPage,
            limit: itemsPerPage,
          }
        });

        if (error) {
          console.error('Error fetching clients:', error);
          throw error;
        }

        return data as ClientsResponse;
      } catch (err: any) {
        console.error('Error in client fetch query:', err);
        toast({
          title: 'Erreur de chargement',
          description: err.message || 'Impossible de charger les clients',
          variant: 'destructive',
        });
        throw err;
      }
    },
    enabled: !!activeSfdId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // Fix: Properly handle undefined data.clients with a fallback empty array
  const filteredClients = (data?.clients || []).filter(client =>
    searchTerm === '' || 
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  // Create a new client
  const createClient = useMutation({
    mutationFn: async (clientData: {
      full_name: string;
      email?: string;
      phone?: string;
      address?: string;
      id_number?: string;
      id_type?: string;
      notes?: string;
    }) => {
      if (!activeSfdId) {
        throw new Error('Aucune SFD active sélectionnée');
      }

      // Check for potential duplicates before creating
      const { data: existingClients } = await supabase
        .from('sfd_clients')
        .select('id, full_name, email, phone')
        .eq('sfd_id', activeSfdId)
        .or(`email.eq.${clientData.email},phone.eq.${clientData.phone}`);

      // If potential duplicates are found, warn but don't block
      if (existingClients && existingClients.length > 0) {
        console.warn('Potential duplicate client detected:', existingClients);
        // We'll show a warning but still proceed with creation
      }

      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: {
          action: 'createClient',
          sfdId: activeSfdId,
          clientData: {
            ...clientData,
            // Add validation timestamp
            created_at: new Date().toISOString(),
          }
        }
      });

      if (error) {
        console.error('Error creating client:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Client créé avec succès',
        description: 'Le nouveau client a été ajouté avec succès',
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });
      
      // Redirect to the clients list page
      navigate('/sfd-clients');
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur lors de la création',
        description: error.message || 'Impossible de créer le client',
        variant: 'destructive',
      });
    }
  });

  // Validate client with improved error handling
  const validateClient = useMutation({
    mutationFn: async ({ clientId, notes }: { clientId: string; notes?: string }) => {
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: {
          action: 'validateClient',
          clientId,
          validatedBy: user?.id,
          notes
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Client validé',
        description: 'Le client a été validé avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de valider le client',
        variant: 'destructive',
      });
    }
  });

  // Reject client
  const rejectClient = useMutation({
    mutationFn: async ({ clientId, reason }: { clientId: string; reason?: string }) => {
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: {
          action: 'rejectClient',
          clientId,
          validatedBy: user?.id,
          rejectionReason: reason
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Client rejeté',
        description: 'Le client a été rejeté',
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de rejeter le client',
        variant: 'destructive',
      });
    }
  });

  // Delete client
  const deleteClient = useMutation({
    mutationFn: async (clientId: string) => {
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: {
          action: 'deleteClient',
          clientId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Client supprimé',
        description: 'Le client a été supprimé avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le client',
        variant: 'destructive',
      });
    }
  });

  // Get client details
  const getClientDetails = async (clientId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: {
          action: 'getClientDetails',
          clientId
        }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de charger les détails du client',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    clients: filteredClients,
    totalClients: data?.pagination?.total || 0,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages: data?.pagination?.pages || 0,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    activeSfdId,
    createClient,
    validateClient,
    rejectClient,
    deleteClient,
    getClientDetails,
    refetch,
  };
}
