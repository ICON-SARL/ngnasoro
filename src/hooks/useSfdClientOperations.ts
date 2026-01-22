
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SfdClient } from '@/types/sfdClients';
import { logger } from '@/utils/logger';
import { 
  synchronizeClientCode, 
  createOrUpdateSfdClient,
  lookupUserByClientCode,
  getSfdClientByCode,
  type ClientLookupResult
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
        logger.log('Fetching SFD clients for SFD:', activeSfdId);
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
          logger.error('Error fetching SFD clients:', error);
          throw error;
        }
        
        const processedClients = await Promise.all((data || []).map(async (client: any) => {
          try {
            // client_code doesn't exist in database, just return client as-is
            return client;
          } catch (err) {
            logger.error('Error processing client:', err);
            return client;
          }
        }));
        
        return processedClients as SfdClient[];
      } catch (err) {
        logger.error('Error fetching SFD clients:', err);
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
      logger.log('Searching for client by code:', clientCode);
      
      const { data: existingClient, error: lookupError } = await getSfdClientByCode(clientCode, activeSfdId);
      
      if (existingClient) {
        logger.log('Client found in this SFD:', existingClient);
        toast({
          title: "Client trouvé",
          description: `${existingClient.full_name} est déjà client de votre SFD`,
        });
        
        return existingClient;
      }
      
      const userProfile = await lookupUserByClientCode(clientCode, activeSfdId);
      
      if (!userProfile) {
        logger.log('No user found with client code:', clientCode);
        toast({
          title: "Code non trouvé",
          description: "Aucun utilisateur trouvé avec ce code client",
          variant: "destructive"
        });
        
        return null;
      }
      
      logger.log('User found by client code:', userProfile);
      
      if (userProfile.user_id) {
        const { data: existingSfdClient, error: clientCheckError } = await supabase
          .from('sfd_clients')
          .select('*')
          .eq('user_id', userProfile.user_id)
          .eq('sfd_id', activeSfdId)
          .maybeSingle();
          
        if (clientCheckError && clientCheckError.code !== 'PGRST116') {
          logger.error('Error checking existing client:', clientCheckError);
          throw clientCheckError;
        }
        
        if (existingSfdClient) {
          logger.log('User is already a client in this SFD:', existingSfdClient);
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
          user_id: userProfile.user_id,
          full_name: userProfile.full_name || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          client_code: userProfile.client_code,
          isNewClient: true
        };
      }
      
      return null;
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error searching client by code:', err);
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors de la recherche du client",
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
      [key: string]: unknown;
    }) => {
      if (!activeSfdId) throw new Error('No active SFD ID');
      
      logger.log('Creating client with data:', clientData);
      
      try {
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
          logger.error('Error creating client:', error);
          throw error;
        }
        
        return data;
      } catch (error: unknown) {
        const err = error as { code?: string; message: string };
        logger.error('Error creating client:', err);
        
        if (err.code === '23505') {
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
