
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { SfdClient } from '@/types/sfdClients';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useSfdDataAccess } from './useSfdDataAccess';
import { useToast } from './use-toast';

export function useSfdClients() {
  const { user } = useAuth();
  const { activeSfdId } = useSfdDataAccess();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Récupération des clients de la SFD
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['sfd-clients', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) {
        console.log('No active SFD ID, cannot fetch clients');
        return [];
      }
      
      console.log(`Fetching clients for SFD ID: ${activeSfdId}`);
      
      try {
        const { data, error } = await supabase.functions.invoke('sfd-clients', {
          body: { 
            sfdId: activeSfdId,
            action: 'getClients'
          }
        });
        
        if (error) {
          console.error('Error fetching clients from edge function:', error);
          throw error;
        }
        
        if (!data) {
          console.log('No clients returned from edge function');
          return [];
        }
        
        return data as SfdClient[];
      } catch (err) {
        console.error('Error fetching clients:', err);
        throw err;
      }
    },
    enabled: !!activeSfdId,
  });

  // Filtrer les clients selon le terme de recherche
  const filteredClients = clients.filter(client =>
    searchTerm === '' || 
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  // Create client mutation
  const createClient = useMutation({
    mutationFn: async (clientData: Omit<SfdClient, 'id' | 'created_at' | 'status' | 'kyc_level'>) => {
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
        description: 'Le nouveau client a été créé avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients', activeSfdId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible de créer le client: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Validation d'un client
  const validateClient = useMutation({
    mutationFn: async ({ clientId }: { clientId: string }) => {
      if (!user) throw new Error('Non authentifié');
      
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: { 
          action: 'validateClient',
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
        description: 'Le compte client a été validé avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients', activeSfdId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible de valider le client: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Rejet d'un client
  const rejectClient = useMutation({
    mutationFn: async ({ clientId }: { clientId: string }) => {
      if (!user) throw new Error('Non authentifié');
      
      const { data, error } = await supabase.functions.invoke('sfd-clients', {
        body: { 
          action: 'rejectClient',
          clientId,
          validatedBy: user.id
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Client rejeté',
        description: 'Le compte client a été rejeté',
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients', activeSfdId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible de rejeter le client: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Suppression d'un client
  const deleteClient = useMutation({
    mutationFn: async ({ clientId }: { clientId: string }) => {
      const { error } = await supabase.functions.invoke('sfd-clients', {
        body: { 
          action: 'deleteClient',
          clientId
        }
      });
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Client supprimé',
        description: 'Le compte client a été supprimé',
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients', activeSfdId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible de supprimer le client: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    clients: filteredClients,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    activeSfdId,  // Add this to expose the activeSfdId
    createClient, // Add this to expose the createClient mutation
    validateClient,
    rejectClient,
    deleteClient
  };
}
