
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ClientAdhesionRequest } from '@/types/adhesionRequests';

export interface AdhesionRequestInput {
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  profession?: string;
  monthly_income?: string;
  source_of_income?: string;
  id_number?: string;
  id_type?: string;
}

export function useClientAdhesions() {
  const { user } = useAuth();
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);

  // Fetch adhesion requests for current user
  const { data: adhesionRequests, refetch, isLoading: isQueryLoading } = useQuery({
    queryKey: ['user-adhesion-requests', user?.id],
    queryFn: async () => {
      try {
        // Call the Edge Function to retrieve adhesion requests
        const { data, error } = await supabase.functions.invoke('get_adhesion_requests', {
          body: { userId: user?.id }
        });
        
        if (error) throw error;
        return data as ClientAdhesionRequest[];
      } catch (error) {
        console.error('Error fetching adhesion requests:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Submit new adhesion request
  const submitAdhesionRequest = async (sfdId: string, input: AdhesionRequestInput) => {
    if (!user) return { success: false, error: "Utilisateur non connecté" };
    
    setIsCreatingRequest(true);
    try {
      const adhesionData = {
        user_id: user.id,
        sfd_id: sfdId,
        status: 'pending',
        full_name: input.full_name,
        email: input.email || user.email,
        phone: input.phone,
        address: input.address,
        id_number: input.id_number,
        id_type: input.id_type,
        profession: input.profession,
        monthly_income: input.monthly_income ? parseFloat(input.monthly_income) : undefined,
        source_of_income: input.source_of_income,
        reference_number: `ADH-${Date.now().toString().substring(6)}`
      };
      
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .insert(adhesionData)
        .select()
        .single();

      if (error) throw error;
      
      refetch();
      return { success: true, data };
    } catch (error: any) {
      console.error('Error submitting adhesion request:', error);
      return { success: false, error: error.message };
    } finally {
      setIsCreatingRequest(false);
    }
  };

  return {
    adhesionRequests: adhesionRequests || [],
    submitAdhesionRequest,
    isCreatingRequest,
    isLoading: isQueryLoading || isCreatingRequest,
    refetchAdhesionRequests: refetch
  };
}
