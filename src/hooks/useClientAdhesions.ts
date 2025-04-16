
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AdhesionRequestInput {
  full_name: string;
  profession: string;
  monthly_income: string;
  source_of_income: string;
  phone: string;
  email: string;
  address: string;
}

export const useClientAdhesions = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);

  // Fetch user's adhesion requests
  const { 
    data: userAdhesionRequests,
    isLoading: isLoadingUserAdhesionRequests,
    refetch: refetchUserAdhesionRequests
  } = useQuery({
    queryKey: ['userAdhesionRequests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error fetching adhesion requests:', error);
        throw error;
      }
      
      return data as ClientAdhesionRequest[];
    },
    enabled: !!user?.id
  });

  // Fetch all adhesion requests (for admin)
  const { 
    data: adhesionRequests,
    isLoading: isLoadingAdhesionRequests,
    refetch: refetchAdhesionRequests
  } = useQuery({
    queryKey: ['adhesionRequests'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select('*');
        
      if (error) {
        console.error('Error fetching all adhesion requests:', error);
        throw error;
      }
      
      return data as ClientAdhesionRequest[];
    },
    enabled: !!user?.id
  });

  // Submit a new adhesion request
  const submitAdhesionRequest = async (sfdId: string, input: AdhesionRequestInput) => {
    try {
      setIsCreatingRequest(true);
      
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
          monthly_income: parseFloat(input.monthly_income),
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

      // Refresh the adhesion requests list
      await queryClient.invalidateQueries({queryKey: ['userAdhesionRequests']});
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error submitting adhesion request:', error);
      return { 
        success: false, 
        error: error.message || 'Une erreur est survenue lors de l\'envoi de votre demande' 
      };
    } finally {
      setIsCreatingRequest(false);
    }
  };

  // Approve an adhesion request
  const approveAdhesionRequest = async (adhesionId: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
          notes: notes
        })
        .eq('id', adhesionId);

      if (error) throw error;

      // Refresh the adhesion requests list
      await queryClient.invalidateQueries({queryKey: ['adhesionRequests']});
      
      toast({
        title: "Demande approuvée",
        description: "La demande d'adhésion a été approuvée avec succès",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error approving adhesion request:', error);
      toast({
        title: "Erreur",
        description: `Impossible d'approuver la demande: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  // Reject an adhesion request
  const rejectAdhesionRequest = async (adhesionId: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
          notes: notes
        })
        .eq('id', adhesionId);

      if (error) throw error;

      // Refresh the adhesion requests list
      await queryClient.invalidateQueries({queryKey: ['adhesionRequests']});
      
      toast({
        title: "Demande rejetée",
        description: "La demande d'adhésion a été rejetée",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error rejecting adhesion request:', error);
      toast({
        title: "Erreur",
        description: `Impossible de rejeter la demande: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    // User adhesion requests
    userAdhesionRequests: userAdhesionRequests || [],
    isLoadingUserAdhesionRequests,
    refetchUserAdhesionRequests,
    submitAdhesionRequest,
    isCreatingRequest,
    
    // All adhesion requests (for admin)
    adhesionRequests: adhesionRequests || [],
    isLoadingAdhesionRequests,
    refetchAdhesionRequests,
    
    // Admin actions
    approveAdhesionRequest,
    rejectAdhesionRequest
  };
};
