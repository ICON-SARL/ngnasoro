
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SfdClient } from '@/types/sfdClients';

export function useSfdClients() {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all clients for the current SFD
  const fetchClients = async (): Promise<SfdClient[]> => {
    if (!activeSfdId) {
      console.warn('No active SFD ID available, cannot fetch clients');
      return [];
    }
    
    console.log('Fetching clients for SFD ID:', activeSfdId);
    
    const { data, error } = await supabase
      .from('sfd_clients')
      .select('*')
      .eq('sfd_id', activeSfdId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les clients",
        variant: "destructive",
      });
      return [];
    }
    
    console.log('Clients fetched:', data?.length || 0);
    
    // Type assertion to ensure the status field is properly typed
    return (data || []) as SfdClient[];
  };
  
  const clientsQuery = useQuery({
    queryKey: ['sfd-clients', activeSfdId],
    queryFn: fetchClients,
    enabled: !!activeSfdId,
  });
  
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
      if (!activeSfdId) throw new Error("SFD ID non défini");
      
      const { data, error } = await supabase
        .from('sfd_clients')
        .insert({
          sfd_id: activeSfdId,
          full_name: clientData.full_name,
          email: clientData.email || null,
          phone: clientData.phone || null,
          address: clientData.address || null,
          id_number: clientData.id_number || null,
          id_type: clientData.id_type || null,
          notes: clientData.notes || null,
          status: 'pending' as const,
          kyc_level: 0
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as SfdClient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-clients', activeSfdId] });
      toast({
        title: "Client créé",
        description: "Le client a été créé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer le client: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Validate a client
  const validateClient = useMutation({
    mutationFn: async ({ clientId }: { clientId: string }) => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      
      const { data, error } = await supabase
        .from('sfd_clients')
        .update({
          status: 'validated' as const,
          validated_at: new Date().toISOString(),
          validated_by: user.id
        })
        .eq('id', clientId)
        .select()
        .single();
        
      if (error) throw error;
      return data as SfdClient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-clients', activeSfdId] });
      toast({
        title: "Client validé",
        description: "Le client a été validé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de valider le client: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Reject a client
  const rejectClient = useMutation({
    mutationFn: async ({ clientId }: { clientId: string }) => {
      const { data, error } = await supabase
        .from('sfd_clients')
        .update({
          status: 'rejected' as const
        })
        .eq('id', clientId)
        .select()
        .single();
        
      if (error) throw error;
      return data as SfdClient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-clients', activeSfdId] });
      toast({
        title: "Client rejeté",
        description: "Le client a été rejeté",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de rejeter le client: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  return {
    clients: clientsQuery.data || [],
    isLoading: clientsQuery.isLoading,
    isError: clientsQuery.isError,
    createClient,
    validateClient,
    rejectClient,
  };
}
