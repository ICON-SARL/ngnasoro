
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SfdClient } from '@/types/sfdClients';
import { synchronizeClientCode } from '@/utils/clientCodeUtils';

export function useSfdClientOperations() {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Query to fetch clients
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['sfd-clients-with-user', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return [];
      
      try {
        // Use a more robust query that includes the client_code
        const { data, error } = await supabase
          .from('sfd_clients')
          .select(`
            *,
            user:user_id (
              id, 
              email, 
              profiles!inner (
                client_code
              )
            )
          `)
          .eq('sfd_id', activeSfdId);
          
        if (error) throw error;
        
        // Process and sync client codes where needed
        const processedClients = await Promise.all((data || []).map(async (client: any) => {
          // If client has user but no client_code, sync it
          if (client.user && client.user.profiles && client.user.profiles[0]?.client_code && !client.client_code) {
            await supabase
              .from('sfd_clients')
              .update({ client_code: client.user.profiles[0].client_code })
              .eq('id', client.id);
              
            return {
              ...client,
              client_code: client.user.profiles[0].client_code
            };
          }
          return client;
        }));
        
        return processedClients as SfdClient[];
      } catch (err) {
        console.error('Error fetching SFD clients:', err);
        return [];
      }
    },
    enabled: !!activeSfdId
  });

  // Create client mutation with improved error handling
  const createClient = useMutation({
    mutationFn: async (clientData: {
      full_name: string;
      email?: string;
      phone?: string;
      user_id?: string;
      client_code?: string;
      [key: string]: any;
    }) => {
      if (!activeSfdId) throw new Error('No active SFD ID');
      
      try {
        // Check if user_id is provided and has a client code
        if (clientData.user_id) {
          // Ensure client code is synchronized
          await synchronizeClientCode(clientData.user_id, clientData.client_code);
        }
        
        const { data, error } = await supabase
          .from('sfd_clients')
          .insert({
            ...clientData,
            sfd_id: activeSfdId,
            status: 'pending'
          })
          .select()
          .single();
          
        if (error) throw error;
        return data;
      } catch (error: any) {
        // Better error handling
        if (error.code === '23505') {  // Unique constraint error
          throw new Error('Ce client existe déjà dans cette SFD');
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Client créé',
        description: 'Le client a été créé avec succès'
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients-with-user', activeSfdId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de créer le client: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  return {
    clients,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    createClient,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['sfd-clients-with-user', activeSfdId] })
  };
}
