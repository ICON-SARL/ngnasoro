
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SfdClient } from '@/types/sfdClients';
import { useNavigate } from 'react-router-dom';

export function useSfdClientManagement() {
  const { activeSfdId, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalClients, setTotalClients] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['sfd-clients', activeSfdId, searchTerm, statusFilter, currentPage, itemsPerPage],
    queryFn: async () => {
      if (!activeSfdId) {
        console.log('No active SFD ID, cannot fetch clients');
        return [];
      }
      
      try {
        const { data, error } = await supabase.functions.invoke('sfd-clients', {
          body: { 
            action: 'getClients',
            sfdId: activeSfdId,
            searchTerm,
            status: statusFilter,
            page: currentPage,
            pageSize: itemsPerPage
          }
        });
        
        if (error) throw error;
        
        // Update pagination data based on returned clients
        if (Array.isArray(data)) {
          setTotalClients(data.length);
          setTotalPages(Math.ceil(data.length / itemsPerPage));
        }
        
        return data || [];
      } catch (err) {
        console.error('Error fetching clients:', err);
        throw err;
      }
    },
    enabled: !!activeSfdId
  });

  const createClient = useMutation({
    mutationFn: async (clientData: Omit<SfdClient, 'id' | 'created_at' | 'status' | 'kyc_level' | 'sfd_id'>) => {
      if (!activeSfdId) throw new Error('No active SFD ID');
      
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: {
          action: 'createClient',
          sfdId: activeSfdId,
          clientData
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Client créé',
        description: 'Le nouveau client a été ajouté avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la création du client',
        variant: 'destructive',
      });
    }
  });

  const validateClient = useMutation({
    mutationFn: async ({ clientId, notes }: { clientId: string; notes?: string }) => {
      if (!user) throw new Error('Utilisateur non authentifié');
      console.log('Validating client:', clientId);
      
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: {
          action: 'validateClient',
          clientId,
          validatedBy: user.id,
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

  const rejectClient = useMutation({
    mutationFn: async ({ clientId, reason }: { clientId: string; reason?: string }) => {
      if (!user) throw new Error('Utilisateur non authentifié');
      
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: {
          action: 'rejectClient',
          clientId,
          validatedBy: user.id,
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
  
  // Add refetch function to manually refresh data
  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey: ['sfd-clients', activeSfdId, searchTerm, statusFilter] });
  };

  return {
    clients,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    createClient,
    validateClient,
    rejectClient,
    deleteClient,
    getClientDetails,
    // Pagination properties
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalClients,
    totalPages,
    // Manual refetch
    refetch
  };
}
