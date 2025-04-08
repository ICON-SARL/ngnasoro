
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useSubsidyRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Récupérer toutes les demandes de subvention
  const { data: subsidyRequests, isLoading } = useQuery({
    queryKey: ['subsidy-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subsidy_requests')
        .select(`
          *,
          sfds (name)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Récupérer les seuils d'alerte
  const { data: alertThresholds, isLoading: isLoadingThresholds } = useQuery({
    queryKey: ['subsidy-alert-thresholds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subsidy_alert_thresholds')
        .select('*');
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Approuver une demande
  const approveRequest = useMutation({
    mutationFn: async ({ requestId, comments }: { requestId: string, comments?: string }) => {
      const { data, error } = await supabase
        .from('subsidy_requests')
        .update({
          status: 'approved',
          decision_comments: comments,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', requestId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Enregistrer l'activité
      await supabase
        .from('subsidy_request_activities')
        .insert({
          request_id: requestId,
          activity_type: 'approve',
          description: 'Demande approuvée',
          details: comments ? { comments } : undefined,
          performed_by: user?.id
        });
        
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-requests'] });
      toast({
        title: 'Demande approuvée',
        description: 'La demande de subvention a été approuvée avec succès.'
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`
      });
    }
  });
  
  // Rejeter une demande
  const rejectRequest = useMutation({
    mutationFn: async ({ requestId, comments }: { requestId: string, comments?: string }) => {
      const { data, error } = await supabase
        .from('subsidy_requests')
        .update({
          status: 'rejected',
          decision_comments: comments,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', requestId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Enregistrer l'activité
      await supabase
        .from('subsidy_request_activities')
        .insert({
          request_id: requestId,
          activity_type: 'reject',
          description: 'Demande rejetée',
          details: comments ? { comments } : undefined,
          performed_by: user?.id
        });
        
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-requests'] });
      toast({
        title: 'Demande rejetée',
        description: 'La demande de subvention a été rejetée.'
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`
      });
    }
  });
  
  return {
    subsidyRequests,
    isLoading,
    alertThresholds,
    isLoadingThresholds,
    approveRequest,
    rejectRequest
  };
}
