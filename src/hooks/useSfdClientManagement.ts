import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SfdClient } from '@/types/sfdClients';

interface ClientsQueryOptions {
  page?: number;
  pageSize?: number;
  status?: string | null;
  searchTerm?: string | null;
}

interface ClientCheckResult {
  exists: boolean;
  status?: string;
  full_name?: string;
}

export function useSfdClientManagement() {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [totalClients, setTotalClients] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Calculate pagination parameters
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // Get clients with pagination and filtering
  const { 
    data: clients = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['sfd-clients', activeSfdId, currentPage, itemsPerPage, statusFilter, searchTerm],
    queryFn: async () => {
      if (!activeSfdId) return { data: [], count: 0 };
      
      try {
        // First, get auth token for the edge function
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: 'Session expirée',
            description: 'Votre session a expiré. Veuillez vous reconnecter.',
            variant: 'destructive',
          });
          throw new Error('No active session');
        }
        
        // Call the edge function with authentication
        const { data, error } = await supabase.functions.invoke('sfd-clients', {
          body: { 
            action: 'getClients',
            sfdId: activeSfdId,
            status: statusFilter,
            searchTerm: searchTerm
          }
        });
        
        if (error) {
          console.error('Error from edge function:', error);
          throw error;
        }
        
        // Update pagination data
        const filteredData = data || [];
        setTotalClients(filteredData.length);
        setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
        
        // Return paginated slice
        return filteredData.slice(from, to + 1);
      } catch (err: any) {
        console.error('Error fetching clients:', err);
        
        // Show a friendly toast error message
        toast({
          title: 'Erreur de chargement',
          description: err.message || "Impossible de charger les clients. Veuillez réessayer.",
          variant: 'destructive',
          duration: 5000, // Show error messages for longer
        });
        
        return [];
      }
    },
    enabled: !!activeSfdId,
    retry: 1, // Retry once on failure
    refetchOnWindowFocus: false
  });

  // Check if client exists
  const checkClientExists = async (email: string): Promise<ClientCheckResult | null> => {
    if (!email || !activeSfdId) return null;
    
    try {
      // Using our SQL function through the supabase RPC mechanism
      const { data, error } = await supabase.functions.invoke('client-operations', { 
        body: {
          action: "checkClientExists",
          email: email,
          sfdId: activeSfdId
        }
      });
      
      if (error) throw error;
      return data as ClientCheckResult;
    } catch (err) {
      console.error('Error checking client existence:', err);
      return null;
    }
  };

  // Create client mutation
  const createClient = useMutation({
    mutationFn: async (clientData: {
      full_name: string;
      email?: string;
      phone?: string;
      address?: string;
      id_number?: string;
      id_type?: string;
      user_id?: string;
    }) => {
      if (!user || !activeSfdId) {
        toast({
          title: 'Erreur',
          description: 'Impossible de créer un client sans SFD active',
          variant: 'destructive'
        });
        throw new Error('No active SFD');
      }
      
      // If email is provided, check if client already exists
      if (clientData.email) {
        const existingClient = await checkClientExists(clientData.email);
        if (existingClient && existingClient.exists) {
          throw new Error(`Un client avec cet email (${clientData.email}) existe déjà dans cette SFD. Statut: ${existingClient.status || 'inconnu'}`);
        }
      }
      
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: {
          action: 'createClient',
          sfdId: activeSfdId,
          clientData
        }
      });
      
      if (error) throw error;
      
      // Handle error response from edge function
      if (data && data.error) {
        throw new Error(data.error);
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Client créé',
        description: 'Le client a été créé avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });
    },
    onError: (error: any) => {
      console.error('Error creating client:', error);
      // Error toasts are now handled in the calling component
    }
  });

  // Validate client mutation
  const validateClient = useMutation({
    mutationFn: async (clientId: string) => {
      if (!user || !activeSfdId) throw new Error('No active session or SFD');
      
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: {
          action: 'validateClient',
          sfdId: activeSfdId,
          clientId,
          validatedBy: user.id
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Client validé',
        description: 'Le client a été validé avec succès'
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || "Erreur lors de la validation du client",
        variant: 'destructive'
      });
    }
  });

  // Reject client mutation
  const rejectClient = useMutation({
    mutationFn: async ({ clientId, reason }: { clientId: string, reason?: string }) => {
      if (!user || !activeSfdId) throw new Error('No active session or SFD');
      
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: {
          action: 'rejectClient',
          sfdId: activeSfdId,
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
        description: 'La demande du client a été rejetée'
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || "Erreur lors du rejet du client",
        variant: 'destructive'
      });
    }
  });

  // Delete client mutation
  const deleteClient = useMutation({
    mutationFn: async (clientId: string) => {
      if (!activeSfdId) throw new Error('No active SFD');
      
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: {
          action: 'deleteClient',
          sfdId: activeSfdId,
          clientId
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Client supprimé',
        description: 'Le client a été supprimé avec succès'
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || "Erreur lors de la suppression du client",
        variant: 'destructive'
      });
    }
  });

  return {
    clients,
    totalClients,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
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
    refetch,
    checkClientExists
  };
}
