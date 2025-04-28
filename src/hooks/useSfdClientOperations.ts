
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SfdClient } from '@/types/sfdClients';
import { 
  synchronizeClientCode, 
  createOrUpdateSfdClient,
  lookupUserByClientCode,
  getSfdClientByCode
} from '@/utils/clientCodeUtils';

export function useSfdClientOperations() {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const { 
    data: clients = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['sfd-clients-with-user', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return [];
      
      try {
        console.log('Fetching SFD clients for SFD:', activeSfdId);
        
        const { data, error } = await supabase
          .from('sfd_clients')
          .select(`
            *,
            user:user_id (
              id, 
              email,
              profiles!inner (
                id,
                full_name,
                email,
                phone,
                client_code
              )
            )
          `)
          .eq('sfd_id', activeSfdId);
          
        if (error) {
          console.error('Error fetching SFD clients:', error);
          throw error;
        }
        
        const processedClients = await Promise.all((data || []).map(async (client: any) => {
          try {
            if (client.user && 
              client.user.profiles && 
              client.user.profiles[0]?.client_code && 
              !client.client_code) {
              
              console.log('Syncing client code from profile to client:', client.id);
              
              await supabase
                .from('sfd_clients')
                .update({ client_code: client.user.profiles[0].client_code })
                .eq('id', client.id);
                
              return {
                ...client,
                client_code: client.user.profiles[0].client_code
              };
            }
            
            if (client.client_code && 
                client.user && 
                client.user.profiles && 
                !client.user.profiles[0]?.client_code && 
                client.user_id) {
              
              console.log('Syncing client code from client to profile:', client.user_id);
              
              await supabase
                .from('profiles')
                .update({ client_code: client.client_code })
                .eq('id', client.user_id);
            }
            
            return client;
          } catch (err) {
            console.error('Error processing client:', err);
            return client;
          }
        }));
        
        return processedClients as SfdClient[];
      } catch (err) {
        console.error('Error fetching SFD clients:', err);
        return [];
      }
    },
    enabled: !!activeSfdId
  });

  const searchClientByCode = async (clientCode: string) => {
    if (!activeSfdId) {
      toast({
        title: "Erreur",
        description: "Aucune SFD active sélectionnée",
        variant: "destructive"
      });
      return null;
    }
    
    setIsSearching(true);
    try {
      console.log('Searching for client by code:', clientCode);
      
      const existingClient = await getSfdClientByCode(clientCode, activeSfdId);
      
      if (existingClient) {
        console.log('Client found in this SFD:', existingClient);
        
        toast({
          title: "Client trouvé",
          description: `${existingClient.full_name} est déjà client de votre SFD`,
        });
        
        return existingClient;
      }
      
      const userProfile = await lookupUserByClientCode(clientCode, activeSfdId);
      
      if (!userProfile) {
        console.log('No user found with client code:', clientCode);
        
        toast({
          title: "Code non trouvé",
          description: "Aucun utilisateur trouvé avec ce code client",
          variant: "destructive"
        });
        
        return null;
      }
      
      console.log('User found by client code:', userProfile);
      
      if (userProfile.id) {
        const { data: existingSfdClient, error: clientCheckError } = await supabase
          .from('sfd_clients')
          .select('*')
          .eq('user_id', userProfile.id)
          .eq('sfd_id', activeSfdId)
          .maybeSingle();
          
        if (clientCheckError && clientCheckError.code !== 'PGRST116') {
          console.error('Error checking existing client:', clientCheckError);
          throw clientCheckError;
        }
        
        if (existingSfdClient) {
          console.log('User is already a client in this SFD:', existingSfdClient);
          
          if (!existingSfdClient.client_code) {
            await supabase
              .from('sfd_clients')
              .update({ client_code: userProfile.client_code })
              .eq('id', existingSfdClient.id);
              
            return { ...existingSfdClient, client_code: userProfile.client_code };
          }
          
          toast({
            title: "Client déjà enregistré",
            description: `${userProfile.full_name} est déjà client de votre SFD`,
          });
          
          return existingSfdClient as SfdClient;
        }
        
        toast({
          title: "Utilisateur trouvé",
          description: `${userProfile.full_name} peut être ajouté comme client`,
        });
        
        return {
          user_id: userProfile.id,
          full_name: userProfile.full_name || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          client_code: userProfile.client_code,
          isNewClient: true
        };
      }
      
      return null;
    } catch (error: any) {
      console.error('Error searching client by code:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la recherche du client",
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsSearching(false);
    }
  };

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
        console.log('Creating client with data:', clientData);
        
        if (clientData.user_id) {
          const result = await createOrUpdateSfdClient(
            activeSfdId, 
            clientData.user_id, 
            {
              ...clientData,
              status: 'pending'
            }
          );
          
          if (!result.success) {
            throw new Error(result.error || 'Failed to create client');
          }
          
          return result.client;
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
          
        if (error) {
          console.error('Error creating client:', error);
          throw error;
        }
        
        return data;
      } catch (error: any) {
        console.error('Error creating client:', error);
        
        if (error.code === '23505') {
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
    isSearching,
    error,
    searchTerm,
    setSearchTerm,
    searchClientByCode,
    createClient,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['sfd-clients-with-user', activeSfdId] })
  };
}
