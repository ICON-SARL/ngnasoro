
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useAuth } from '@/hooks/useAuth';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';

export function useClientAdhesions() {
  const { toast } = useToast();
  const { activeSfdId } = useSfdDataAccess();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Fetch adhesion requests for SFD
  const {
    data: adhesionRequests = [],
    isLoading: isLoadingAdhesionRequests,
    refetch: refetchAdhesionRequests,
    error: adhesionRequestsError
  } = useQuery({
    queryKey: ['client-adhesion-requests', activeSfdId],
    queryFn: async () => {
      try {
        if (!activeSfdId || !user) return [];

        console.log('Fetching adhesion requests for SFD:', activeSfdId);

        const { data, error } = await supabase
          .from('client_adhesion_requests')
          .select('*')
          .eq('sfd_id', activeSfdId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching adhesion requests:', error);
          throw error;
        }

        console.log('Adhesion requests data:', data);
        return data as ClientAdhesionRequest[];
      } catch (error: any) {
        console.error('Error in fetching adhesion requests:', error);
        toast({
          title: 'Erreur',
          description: `Impossible de récupérer les demandes d'adhésion: ${error.message}`,
          variant: 'destructive',
        });
        throw error;
      }
    },
    enabled: !!activeSfdId && !!user,
    retry: 2, // Retry up to 2 times if there's an error
  });

  // Fetch user's own adhesion requests
  const {
    data: userAdhesionRequests = [],
    isLoading: isLoadingUserAdhesionRequests,
    refetch: refetchUserAdhesionRequests,
    error: userAdhesionRequestsError
  } = useQuery({
    queryKey: ['user-adhesion-requests', user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) return [];

        const { data, error } = await supabase
          .from('client_adhesion_requests')
          .select(`
            *,
            sfds (
              name,
              region
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user adhesion requests:', error);
          throw error;
        }

        // Format the response to properly handle the joined data
        const formattedData = data.map(item => ({
          ...item,
          sfd_name: item.sfds?.name,
          sfd_region: item.sfds?.region,
          // Remove nested sfds data to avoid conflicts
          sfds: undefined
        }));

        return formattedData as ClientAdhesionRequest[];
      } catch (error: any) {
        console.error('Error in fetching user adhesion requests:', error);
        toast({
          title: 'Erreur',
          description: `Impossible de récupérer vos demandes d'adhésion: ${error.message}`,
          variant: 'destructive',
        });
        throw error;
      }
    },
    enabled: !!user?.id,
    retry: 2, // Retry up to 2 times if there's an error
  });

  // Approve adhesion request mutation
  const approveMutation = useMutation({
    mutationFn: async (params: { adhesionId: string; notes?: string }) => {
      if (!user) throw new Error('Utilisateur non authentifié');
      
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: 'approved',
          processed_by: user.id,
          processed_at: new Date().toISOString(),
          notes: params.notes || null
        })
        .eq('id', params.adhesionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-adhesion-requests'] });
      queryClient.invalidateQueries({ queryKey: ['user-adhesion-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sfd-statistics'] });
      toast({
        title: 'Demande approuvée',
        description: 'La demande d\'adhésion a été approuvée avec succès.',
      });
    },
    onError: (error: any) => {
      console.error('Error approving adhesion:', error);
      toast({
        title: 'Erreur',
        description: `Impossible d'approuver la demande: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Reject adhesion request mutation
  const rejectMutation = useMutation({
    mutationFn: async (params: { adhesionId: string; notes?: string }) => {
      if (!user) throw new Error('Utilisateur non authentifié');
      
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: 'rejected',
          processed_by: user.id,
          processed_at: new Date().toISOString(),
          notes: params.notes || null
        })
        .eq('id', params.adhesionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-adhesion-requests'] });
      queryClient.invalidateQueries({ queryKey: ['user-adhesion-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sfd-statistics'] });
      toast({
        title: 'Demande rejetée',
        description: 'La demande d\'adhésion a été rejetée.',
      });
    },
    onError: (error: any) => {
      console.error('Error rejecting adhesion:', error);
      toast({
        title: 'Erreur',
        description: `Impossible de rejeter la demande: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Function to approve an adhesion request
  const approveAdhesionRequest = async (requestId: string, notes?: string) => {
    setIsProcessingAction(true);
    try {
      await approveMutation.mutateAsync({ adhesionId: requestId, notes });
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Function to reject an adhesion request
  const rejectAdhesionRequest = async (requestId: string, notes?: string) => {
    setIsProcessingAction(true);
    try {
      await rejectMutation.mutateAsync({ adhesionId: requestId, notes });
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Mutation pour créer une nouvelle demande d'adhésion
  const createAdhesionRequestMutation = useMutation({
    mutationFn: async (data: {
      sfd_id: string;
      full_name: string;
      email?: string;
      phone?: string;
      address?: string;
      profession?: string;
      monthly_income?: number;
      source_of_income?: string;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      // S'assurer que la SFD est active avant de créer une demande
      const { data: sfdData, error: sfdError } = await supabase
        .from('sfds')
        .select('name, status')
        .eq('id', data.sfd_id)
        .eq('status', 'active')
        .single();

      if (sfdError || !sfdData) {
        throw new Error('Cette SFD n\'est pas disponible actuellement');
      }

      const { data: result, error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          user_id: user.id,
          sfd_id: data.sfd_id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          profession: data.profession,
          monthly_income: data.monthly_income,
          source_of_income: data.source_of_income,
          notes: data.notes,
          status: 'pending',
          reference_number: `ADH-${Math.random().toString(36).substring(2, 10)}`
        })
        .select()
        .single();

      if (error) throw error;
      return result as ClientAdhesionRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-adhesion-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sfd-statistics'] });
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande d\'adhésion a été envoyée avec succès.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible d'envoyer la demande: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  return {
    adhesionRequests,
    userAdhesionRequests,
    isLoadingAdhesionRequests,
    isLoadingUserAdhesionRequests,
    isProcessingAction,
    refetchAdhesionRequests,
    refetchUserAdhesionRequests,
    approveAdhesionRequest,
    rejectAdhesionRequest,
    createAdhesionRequest: createAdhesionRequestMutation.mutate,
    isCreatingRequest: createAdhesionRequestMutation.isPending,
    adhesionRequestsError,
    userAdhesionRequestsError
  };
}
