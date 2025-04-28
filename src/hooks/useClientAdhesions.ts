
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { AdhesionRequestInput, ClientAdhesionRequest } from '@/types/adhesionTypes';
import { useState } from 'react';

export function useClientAdhesions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);

  const submitAdhesionRequest = async (sfdId: string, data: AdhesionRequestInput) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour soumettre une demande",
        variant: "destructive",
      });
      return { success: false };
    }
    
    setIsCreatingRequest(true);
    
    try {
      const adhesionData = {
        user_id: user.id,
        sfd_id: sfdId,
        full_name: data.full_name,
        email: data.email || user.email,
        phone: data.phone,
        address: data.address,
        id_number: data.id_number,
        id_type: data.id_type,
        profession: data.profession,
        monthly_income: data.monthly_income ? parseFloat(data.monthly_income) : undefined,
        source_of_income: data.source_of_income,
        status: 'pending',
        reference_number: `ADH-${Date.now().toString().substring(6)}`
      };
      
      // Use RPC function to create an adhesion request
      const { data: result, error } = await supabase
        .rpc('create_client_adhesion_request', { 
          adhesion_data: adhesionData
        });
      
      if (error) throw error;
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'adhésion a été envoyée avec succès",
      });
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['user-adhesion-requests'] });
      
      return { success: true, requestId: result };
    } catch (error: any) {
      console.error('Error creating adhesion request:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de la demande",
        variant: "destructive",
      });
      
      return { success: false, error: error.message };
    } finally {
      setIsCreatingRequest(false);
    }
  };

  // Fetch adhesion requests
  const { 
    data: adhesionRequests, 
    refetch, 
    isLoading 
  } = useQuery<ClientAdhesionRequest[]>({
    queryKey: ['user-adhesion-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .rpc('get_adhesion_request_by_user', { 
          user_id_param: user.id 
        });
      
      if (error) {
        console.error('Error fetching adhesion requests:', error);
        return [];
      }
      
      return data as ClientAdhesionRequest[];
    },
    enabled: !!user?.id,
  });

  return {
    adhesionRequests: adhesionRequests || [],
    submitAdhesionRequest,
    isCreatingRequest,
    isLoading,
    refetchAdhesionRequests: refetch
  };
}
