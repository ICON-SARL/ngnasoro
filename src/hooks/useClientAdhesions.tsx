import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { useSfdDataAccess } from './useSfdDataAccess';

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

  const fetchAdhesionRequests = async (sfdId: string): Promise<AdhesionRequest[]> => {
    if (!sfdId || !user?.id) return [];

    try {
      console.log(`Fetching adhesion requests for SFD: ${sfdId}`);
      
      const { data, error } = await supabase.functions.invoke('fetch-client-adhesions', {
        body: { userId: user.id, sfdId }
      });
      
      if (error) {
        console.error('Error fetching adhesion requests from Edge Function:', error);
        
        console.log('Attempting direct DB fetch as fallback...');
        const { data: directData, error: directError } = await supabase
          .from('client_adhesion_requests')
          .select(`
            *,
            sfds:sfd_id(name)
          `)
          .eq('sfd_id', sfdId)
          .order('created_at', { ascending: false });
          
        if (directError) {
          throw directError;
        }
        
        const formattedRequests = directData?.map(req => ({
          ...req,
          sfd_name: req.sfds?.name,
          status: req.status as 'pending' | 'approved' | 'rejected'
        })) || [];
        
        console.log(`Fallback: Found ${formattedRequests.length} adhesion requests`);
        return formattedRequests as AdhesionRequest[];
      }
      
      console.log(`Success: Found ${data?.length || 0} adhesion requests`);
      console.log('Adhesion requests data:', data);
      
      const typedData = data?.map(item => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'rejected'
      })) || [];
      
      return typedData as AdhesionRequest[];
    } catch (error) {
      console.error('Error in fetchAdhesionRequests:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les demandes d'adhésion",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchUserAdhesionRequests = async (): Promise<AdhesionRequest[]> => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select('*, sfds:sfd_id(name)')
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

  const adhesionRequestsQuery = useQuery({
    queryKey: ['adhesion-requests', activeSfdId],
    queryFn: () => fetchAdhesionRequests(activeSfdId || ''),
    enabled: !!activeSfdId && !!user?.id,
  });

  const userAdhesionRequestsQuery = useQuery({
    queryKey: ['user-adhesion-requests', user?.id],
    queryFn: fetchUserAdhesionRequests,
    enabled: !!user?.id,
  });

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
      return data as AdhesionRequest;
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
      return data as AdhesionRequest;
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
          monthly_income: input.monthly_income ? parseFloat(input.monthly_income) : null,
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
