
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { useSfdDataAccess } from './useSfdDataAccess';
import { edgeFunctionApi } from '@/utils/api/modules/edgeFunctionApi';
import { useState } from 'react';

// Définir le type pour les données d'entrée du formulaire d'adhésion
export interface AdhesionRequestInput {
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  profession?: string;
  monthly_income?: string;
  source_of_income?: string;
}

// Définir le type pour les demandes d'adhésion client
export interface ClientAdhesionRequest {
  id: string;
  user_id: string;
  sfd_id: string;
  sfd_name?: string;
  full_name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_at?: string;
  processed_by?: string;
  notes?: string;
  rejection_reason?: string;
}

export function useClientAdhesions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeSfdId } = useSfdDataAccess();
  const [retryCount, setRetryCount] = useState(0);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);

  const fetchAdhesionRequests = async (): Promise<ClientAdhesionRequest[]> => {
    if (!user?.id) return [];

    console.log(`Fetching adhesion requests for user: ${user.id}`);
    
    try {
      // Récupérer les demandes d'adhésion de l'utilisateur
      const { data: requests, error } = await supabase
        .from('client_adhesion_requests')
        .select(`
          *,
          sfds:sfd_id(name, logo_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching adhesion requests:', error);
        throw error;
      }
      
      // Formater les demandes pour correspondre au type ClientAdhesionRequest
      const formattedRequests = requests?.map(req => ({
        ...req,
        sfd_name: req.sfds?.name,
        status: req.status as 'pending' | 'approved' | 'rejected'
      })) || [];
      
      console.log(`Found ${formattedRequests.length} adhesion requests`);
      return formattedRequests as ClientAdhesionRequest[];
    } catch (error) {
      console.error('Error fetching adhesion requests:', error);
      setRetryCount(prev => prev + 1);
      
      // En cas d'erreur, essayer une requête de secours plus simple
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('client_adhesion_requests')
          .select('*')
          .eq('user_id', user.id)
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
    queryKey: ['user-adhesion-requests', user?.id],
    queryFn: fetchAdhesionRequests,
    enabled: !!user?.id,
  });

  const submitAdhesionRequest = async (sfdId: string, data: AdhesionRequestInput) => {
    if (!user?.id) {
      return { success: false, error: "User not authenticated" };
    }
    
    setIsCreatingRequest(true);
    try {
      console.log('Submitting adhesion request with data:', data);
      
      const { data: response, error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          sfd_id: sfdId,
          user_id: user.id,
          full_name: data.full_name,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          profession: data.profession || null,
          monthly_income: data.monthly_income ? parseFloat(data.monthly_income) : null,
          source_of_income: data.source_of_income || null,
          status: 'pending',
          reference_number: `ADH-${Date.now().toString().substring(6)}`
        })
        .select()
        .single();

      if (error) throw error;
      
      // Invalider les requêtes pour forcer le rafraîchissement des données
      queryClient.invalidateQueries({ queryKey: ['user-adhesion-requests'] });
      
      toast({
        title: "Demande soumise",
        description: "Votre demande d'adhésion a été soumise avec succès",
      });
      
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Error submitting adhesion request:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la soumission de la demande",
        variant: "destructive",
      });
      
      return { success: false, error: error.message };
    } finally {
      setIsCreatingRequest(false);
    }
  };

  return {
    adhesionRequests: adhesionRequestsQuery.data || [],
    isLoadingAdhesionRequests: adhesionRequestsQuery.isLoading,
    refetchAdhesionRequests: adhesionRequestsQuery.refetch,
    retryCount,
    submitAdhesionRequest,
    isCreatingRequest
  };
}
