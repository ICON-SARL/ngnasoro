
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ClientAdhesionRequest } from '@/types/adhesionRequests';
import { useToast } from './use-toast';

export function useAdhesionRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch adhesion requests using RPC function instead of edge function
  const { data: adhesionRequests, refetch, isLoading: isQueryLoading } = useQuery({
    queryKey: ['user-adhesion-requests', user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) return [];
        
        // Use RPC function to get adhesion requests
        const { data, error } = await supabase
          .rpc('get_adhesion_request_by_user', { 
            user_id_param: user.id 
          });
        
        if (error) {
          console.error('Error fetching adhesion requests:', error);
          throw error;
        }
        
        return data as ClientAdhesionRequest[];
      } catch (error) {
        console.error('Error fetching adhesion requests:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Create a new adhesion request
  const createAdhesionRequest = async (sfdId: string, data: {
    full_name: string;
    email?: string;
    phone?: string;
    address?: string;
    profession?: string;
    monthly_income?: string;
    source_of_income?: string;
    id_number?: string;
    id_type?: string;
  }) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour soumettre une demande",
        variant: "destructive",
      });
      return { success: false };
    }
    
    setIsLoading(true);
    
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
      
      refetch();
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
      setIsLoading(false);
    }
  };

  return {
    adhesionRequests,
    createAdhesionRequest,
    isLoading: isLoading || isQueryLoading,
    refetchRequests: refetch
  };
}
