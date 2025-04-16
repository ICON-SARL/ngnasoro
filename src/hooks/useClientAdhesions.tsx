
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

export interface AdhesionRequestInput {
  full_name: string;
  profession: string;
  monthly_income: string;
  source_of_income: string;
  phone: string;
  email: string;
  address: string;
}

export function useClientAdhesions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeSfdId } = useSfdDataAccess();

  // Récupérer toutes les demandes d'adhésion pour une SFD
  const fetchAdhesionRequests = async (sfdId: string): Promise<ClientAdhesionRequest[]> => {
    if (!sfdId) return [];

    const { data, error } = await supabase
      .from('client_adhesion_requests')
      .select('*')
      .eq('sfd_id', sfdId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching adhesion requests:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les demandes d'adhésion",
        variant: "destructive",
      });
      return [];
    }

    return data as ClientAdhesionRequest[];
  };

  // Récupérer les demandes d'adhésion pour un utilisateur
  const fetchUserAdhesionRequests = async (): Promise<ClientAdhesionRequest[]> => {
    if (!user?.id) return [];

    const { data, error } = await supabase
      .from('client_adhesion_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user adhesion requests:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos demandes d'adhésion",
        variant: "destructive",
      });
      return [];
    }

    return data as ClientAdhesionRequest[];
  };

  // Requête pour récupérer les demandes d'adhésion SFD
  const adhesionRequestsQuery = useQuery({
    queryKey: ['adhesion-requests', activeSfdId],
    queryFn: () => fetchAdhesionRequests(activeSfdId || ''),
    enabled: !!activeSfdId,
  });

  // Requête pour récupérer les demandes d'adhésion utilisateur
  const userAdhesionRequestsQuery = useQuery({
    queryKey: ['user-adhesion-requests', user?.id],
    queryFn: fetchUserAdhesionRequests,
    enabled: !!user?.id,
  });

  // Mutation pour créer une demande d'adhésion
  const createAdhesionRequest = useMutation({
    mutationFn: async (data: {
      sfd_id: string;
      full_name: string;
      email?: string;
      phone?: string;
      address?: string;
      id_number?: string;
      id_type?: string;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error("Utilisateur non connecté");

      const { data: result, error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          user_id: user.id,
          sfd_id: data.sfd_id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          id_number: data.id_number,
          id_type: data.id_type,
          notes: data.notes,
          status: 'pending_validation'
        })
        .select()
        .single();

      if (error) throw error;
      return result as ClientAdhesionRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-adhesion-requests'] });
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'adhésion a été envoyée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible d'envoyer la demande: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation pour approuver une demande
  const approveAdhesionRequest = useMutation({
    mutationFn: async ({ adhesionId, notes }: { adhesionId: string; notes?: string }) => {
      if (!user?.id) throw new Error("Utilisateur non connecté");

      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString(),
          processed_by: user.id,
          notes: notes
        })
        .eq('id', adhesionId)
        .select()
        .single();

      if (error) throw error;
      return data as ClientAdhesionRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adhesion-requests'] });
      toast({
        title: "Demande approuvée",
        description: "La demande d'adhésion a été approuvée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible d'approuver la demande: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation pour rejeter une demande
  const rejectAdhesionRequest = useMutation({
    mutationFn: async ({ adhesionId, notes }: { adhesionId: string; notes?: string }) => {
      if (!user?.id) throw new Error("Utilisateur non connecté");

      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          processed_by: user.id,
          notes: notes
        })
        .eq('id', adhesionId)
        .select()
        .single();

      if (error) throw error;
      return data as ClientAdhesionRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adhesion-requests'] });
      toast({
        title: "Demande rejetée",
        description: "La demande d'adhésion a été rejetée",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de rejeter la demande: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Submit adhesion request
  const submitAdhesionRequestMutation = useMutation({
    mutationFn: async ({ sfdId, input }: { sfdId: string, input: AdhesionRequestInput }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          sfd_id: sfdId,
          user_id: user.id,
          full_name: input.full_name,
          profession: input.profession,
          monthly_income: parseFloat(input.monthly_income),
          source_of_income: input.source_of_income,
          phone: input.phone,
          email: input.email,
          address: input.address,
          status: 'pending',
          kyc_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-adhesion-requests'] });
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'adhésion a été envoyée avec succès"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || 'Une erreur est survenue lors de l\'envoi de votre demande',
        variant: "destructive"
      });
    }
  });

  const submitAdhesionRequest = async (sfdId: string, input: AdhesionRequestInput) => {
    try {
      await submitAdhesionRequestMutation.mutateAsync({ sfdId, input });
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Une erreur est survenue lors de l\'envoi de votre demande' 
      };
    }
  };

  return {
    userAdhesionRequests: userAdhesionRequestsQuery.data || [],
    isLoadingUserAdhesionRequests: userAdhesionRequestsQuery.isLoading,
    refetchUserAdhesionRequests: () => queryClient.invalidateQueries({ queryKey: ['user-adhesion-requests'] }),
    submitAdhesionRequest,
    isCreatingRequest: submitAdhesionRequestMutation.isPending,
    adhesionRequests: adhesionRequestsQuery.data || [],
    isLoadingAdhesionRequests: adhesionRequestsQuery.isLoading,
    approveAdhesionRequest: async (requestId: string, notes?: string) => {
      try {
        await approveAdhesionRequest.mutateAsync({ adhesionId: requestId, notes });
        return true;
      } catch {
        return false;
      }
    },
    rejectAdhesionRequest: async (requestId: string, notes?: string) => {
      try {
        await rejectAdhesionRequest.mutateAsync({ adhesionId: requestId, notes });
        return true;
      } catch {
        return false;
      }
    },
    refetchAdhesionRequests: () => queryClient.invalidateQueries({ queryKey: ['adhesion-requests'] }),
  };
}
