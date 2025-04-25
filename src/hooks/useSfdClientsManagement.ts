
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface SfdClient {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  status: string;
  user_id?: string;
  created_at: string;
}

export function useSfdClientsManagement() {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  // Get all clients for the active SFD
  const { data: clients = [], isLoading, error, refetch } = useQuery({
    queryKey: ['sfd-clients', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return [];

      const { data, error } = await supabase
        .from('sfd_clients')
        .select('*')
        .eq('sfd_id', activeSfdId);

      if (error) throw error;
      return data as SfdClient[];
    },
    enabled: !!activeSfdId
  });

  // Create a new client
  const createClient = async (clientData: {
    full_name: string;
    email?: string;
    phone?: string;
    address?: string;
    id_number?: string;
    id_type?: string;
  }) => {
    if (!user || !activeSfdId) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer un client sans SFD active',
        variant: 'destructive'
      });
      return null;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('sfd_clients')
        .insert({
          ...clientData,
          sfd_id: activeSfdId,
          status: 'active', // Auto-validate clients created by SFD admins
          validated_by: user.id,
          validated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh the clients list
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });

      toast({
        title: 'Succès',
        description: 'Client créé avec succès'
      });

      return data;
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: 'Erreur',
        description: "Une erreur s'est produite lors de la création du client",
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  // Create account for a client
  const createAccountForClient = async (clientId: string, userId: string) => {
    if (!activeSfdId) return false;

    try {
      // Check if account already exists
      const { data: existingAccount } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingAccount) {
        console.log('Account already exists for this user');
        return true;
      }

      // Create new account
      const { error } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          sfd_id: activeSfdId,
          balance: 0,
          currency: 'FCFA'
        });

      if (error) throw error;
      
      toast({
        title: 'Compte créé',
        description: 'Un compte a été créé pour ce client'
      });
      
      return true;
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        title: 'Erreur',
        description: "Impossible de créer un compte pour ce client",
        variant: 'destructive'
      });
      return false;
    }
  };

  // Delete a client
  const deleteClient = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('sfd_clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
      return clientId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });
      toast({
        title: 'Client supprimé',
        description: 'Client supprimé avec succès'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: "Une erreur s'est produite lors de la suppression du client",
        variant: 'destructive'
      });
    }
  });

  return {
    clients,
    isLoading,
    error,
    createClient,
    isCreating,
    deleteClient,
    createAccountForClient,
    refetch
  };
}
