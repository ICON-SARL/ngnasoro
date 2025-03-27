
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sfdClientApi } from '@/utils/sfdClientApi';
import { SfdClient } from '@/types/sfdClients';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useSfdClients() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all clients for the current SFD
  const clientsQuery = useQuery({
    queryKey: ['sfd-clients'],
    queryFn: sfdClientApi.getSfdClients,
    enabled: !!user
  });
  
  // Create a new client
  const createClient = useMutation({
    mutationFn: sfdClientApi.createClient,
    onSuccess: () => {
      toast({
        title: "Client créé avec succès",
        description: "Le nouveau client a été ajouté à votre SFD",
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur lors de la création",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  });

  // Validate a client account
  const validateClient = useMutation({
    mutationFn: ({ clientId, notes }: { clientId: string, notes?: string }) => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      return sfdClientApi.validateClientAccount(clientId, user.id, notes);
    },
    onSuccess: () => {
      toast({
        title: "Compte validé",
        description: "Le compte client a été validé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de validation",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  });

  // Reject a client account
  const rejectClient = useMutation({
    mutationFn: ({ clientId, notes }: { clientId: string, notes?: string }) => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      return sfdClientApi.rejectClientAccount(clientId, user.id, notes);
    },
    onSuccess: () => {
      toast({
        title: "Compte rejeté",
        description: "Le compte client a été rejeté",
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de rejet",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  });

  // Update client data
  const updateClient = useMutation({
    mutationFn: ({ clientId, updates }: { clientId: string, updates: Partial<SfdClient> }) => {
      return sfdClientApi.updateClient(clientId, updates);
    },
    onSuccess: () => {
      toast({
        title: "Client mis à jour",
        description: "Les informations du client ont été mises à jour",
      });
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de mise à jour",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  });

  // Get client by ID
  const getClientById = async (clientId: string) => {
    return sfdClientApi.getClientById(clientId);
  };

  return {
    clients: clientsQuery.data || [],
    isLoading: clientsQuery.isLoading,
    isError: clientsQuery.isError,
    createClient,
    validateClient,
    rejectClient,
    updateClient,
    getClientById,
    refetch: clientsQuery.refetch
  };
}
