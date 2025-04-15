
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

  // Fetch adhesion requests
  const {
    data: adhesionRequests = [],
    isLoading: isLoadingAdhesionRequests,
    refetch: refetchAdhesionRequests
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
        return [];
      }
    },
    enabled: !!activeSfdId && !!user,
  });

  // Approve adhesion request mutation
  const approveMutation = useMutation({
    mutationFn: async (requestId: string, notes?: string) => {
      if (!user) throw new Error('Utilisateur non authentifié');
      
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: 'approved',
          processed_by: user.id,
          processed_at: new Date().toISOString(),
          notes: notes || null
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-adhesion-requests'] });
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
    mutationFn: async (requestId: string, notes?: string) => {
      if (!user) throw new Error('Utilisateur non authentifié');
      
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: 'rejected',
          processed_by: user.id,
          processed_at: new Date().toISOString(),
          notes: notes || null
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-adhesion-requests'] });
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
      await approveMutation.mutateAsync(requestId, notes);
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
      await rejectMutation.mutateAsync(requestId, notes);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsProcessingAction(false);
    }
  };

  return {
    adhesionRequests,
    isLoadingAdhesionRequests,
    isProcessingAction,
    refetchAdhesionRequests,
    approveAdhesionRequest,
    rejectAdhesionRequest
  };
}
