
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { useSfdDataAccess } from './useSfdDataAccess';
import { edgeFunctionApi } from '@/utils/api/modules/edgeFunctionApi';
import { AdhesionRequestInput, ClientAdhesionRequest } from '@/types/adhesionTypes';
import { useState } from 'react';

export function useClientAdhesions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeSfdId } = useSfdDataAccess();
  const [retryCount, setRetryCount] = useState(0);

  const fetchAdhesionRequests = async (sfdId: string): Promise<ClientAdhesionRequest[]> => {
    if (!sfdId || !user?.id) return [];

    console.log(`Fetching adhesion requests for SFD: ${sfdId}`);
    
    try {
      const { data: edgeData, error: edgeError, success } = await edgeFunctionApi.callFunction<ClientAdhesionRequest[]>(
        'fetch-client-adhesions', 
        { userId: user.id, sfdId }
      );
      
      if (!edgeError && success && edgeData) {
        console.log(`Found ${edgeData.length} adhesion requests via edge function`);
        return edgeData;
      }
      
      console.log('Edge function failed, falling back to direct database query');
      
      const { data: directData, error: directError } = await supabase
        .from('client_adhesion_requests')
        .select(`
          *,
          sfds:sfd_id(name, logo_url)
        `)
        .eq('sfd_id', sfdId)
        .order('created_at', { ascending: false });
      
      if (directError) {
        console.error('Error in direct database query:', directError);
        throw directError;
      }
      
      const formattedRequests = directData?.map(req => ({
        ...req,
        sfd_name: req.sfds?.name,
        status: req.status as 'pending' | 'approved' | 'rejected'
      })) || [];
      
      console.log(`Found ${formattedRequests.length} adhesion requests via direct query`);
      return formattedRequests as ClientAdhesionRequest[];
    } catch (error) {
      console.error('Error fetching adhesion requests:', error);
      setRetryCount(prev => prev + 1);
      
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('client_adhesion_requests')
          .select('*')
          .eq('sfd_id', sfdId)
          .order('created_at', { ascending: false });
          
        if (fallbackError) throw fallbackError;
        
        console.log(`Found ${fallbackData?.length || 0} adhesion requests with fallback query`);
        return (fallbackData || []) as ClientAdhesionRequest[];
      } catch (finalError) {
        console.error('All attempts to fetch adhesion requests failed:', finalError);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de récupérer les demandes d'adhésion",
          variant: "destructive",
        });
        return [];
      }
    }
  };

  const adhesionRequestsQuery = useQuery({
    queryKey: ['adhesion-requests', activeSfdId],
    queryFn: () => fetchAdhesionRequests(activeSfdId || ''),
    enabled: !!activeSfdId && !!user?.id,
  });

  const processAdhesion = useMutation({
    mutationFn: async ({ 
      requestId, 
      action, 
      notes 
    }: { 
      requestId: string;
      action: 'approve' | 'reject';
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          processed_at: new Date().toISOString(),
          processed_by: user.id,
          notes: notes || null
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adhesion-requests'] });
    }
  });

  return {
    adhesionRequests: adhesionRequestsQuery.data || [],
    isLoadingAdhesionRequests: adhesionRequestsQuery.isLoading,
    refetchAdhesionRequests: adhesionRequestsQuery.refetch,
    processAdhesion,
    retryCount
  };
}
