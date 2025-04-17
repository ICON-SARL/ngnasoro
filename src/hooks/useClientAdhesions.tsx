
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { useSfdDataAccess } from './useSfdDataAccess';
import { edgeFunctionApi } from '@/utils/api/modules/edgeFunctionApi';
import ErrorState from '@/components/mobile/sfd-savings/ErrorState';
import { useState } from 'react';

export interface AdhesionRequest {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_at?: string | null;
  processed_by?: string | null;
  notes?: string | null;
  sfd_id: string;
  sfd_name?: string;
  user_id: string;
  id_type?: string | null;
  id_number?: string | null;
  monthly_income?: number | null;
  kyc_status?: string | null;
  verification_stage?: string | null;
  profession?: string | null;
  source_of_income?: string | null;
  reference_number?: string | null;
  rejection_reason?: string | null;
  sfds?: {
    name: string;
    logo_url?: string;
  };
}

export interface AdhesionRequestInput {
  full_name: string;
  profession?: string;
  monthly_income?: string;
  source_of_income?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export function useClientAdhesions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeSfdId } = useSfdDataAccess();
  const [retryCount, setRetryCount] = useState(0);

  const fetchAdhesionRequests = async (sfdId: string): Promise<AdhesionRequest[]> => {
    if (!sfdId || !user?.id) return [];

    console.log(`Fetching adhesion requests for SFD: ${sfdId}`);
    
    try {
      const { data: edgeData, error: edgeError, success } = await edgeFunctionApi.callFunction<AdhesionRequest[]>(
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
      return formattedRequests as AdhesionRequest[];
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
        return (fallbackData || []) as AdhesionRequest[];
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

  const fetchUserAdhesionRequests = async (): Promise<AdhesionRequest[]> => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select('*, sfds:sfd_id(name, logo_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedRequests = data?.map(req => ({
        ...req,
        sfd_name: req.sfds?.name,
        status: req.status as 'pending' | 'approved' | 'rejected'
      })) || [];
      
      console.log(`Found ${formattedRequests.length} user adhesion requests`);
      return formattedRequests as AdhesionRequest[];
    } catch (error) {
      console.error('Error fetching user adhesion requests:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos demandes d'adhésion",
        variant: "destructive",
      });
      return [];
    }
  };

  const userAdhesionRequestsQuery = useQuery({
    queryKey: ['user-adhesion-requests', user?.id],
    queryFn: fetchUserAdhesionRequests,
    enabled: !!user?.id,
  });

  const adhesionRequestsQuery = useQuery({
    queryKey: ['adhesion-requests', activeSfdId],
    queryFn: () => fetchAdhesionRequests(activeSfdId || ''),
    enabled: !!activeSfdId && !!user?.id,
  });

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
          email: input.email || null,
          phone: input.phone || null,
          address: input.address || null,
          profession: input.profession || null,
          monthly_income: input.monthly_income ? parseFloat(input.monthly_income) : null,
          source_of_income: input.source_of_income || null,
          status: 'pending',
          reference_number: `ADH-${Date.now().toString().substring(6)}`
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
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
    refetchUserAdhesionRequests: userAdhesionRequestsQuery.refetch,
    submitAdhesionRequest,
    isCreatingRequest: submitAdhesionRequestMutation.isPending,
    adhesionRequests: adhesionRequestsQuery.data || [],
    isLoadingAdhesionRequests: adhesionRequestsQuery.isLoading,
    refetchAdhesionRequests: adhesionRequestsQuery.refetch,
    retryCount,
  };
}
